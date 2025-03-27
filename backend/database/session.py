"""
数据库会话管理模块
提供数据库连接和会话管理功能，包括性能优化
"""
import logging
import time
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from backend.core.config import settings

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建SQLAlchemy引擎
engine = create_engine(
    settings.DATABASE_URL,
    # SQLite特定参数
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
    # 连接池配置
    poolclass=QueuePool,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_POOL_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,  # 连接前测试连接是否可用
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 声明基类
Base = declarative_base()


# SQLite优化配置
@event.listens_for(engine, "connect")
def optimize_sqlite_connection(dbapi_connection, connection_record):
    """配置SQLite连接参数以优化性能"""
    if not settings.DATABASE_URL.startswith("sqlite"):
        return
    
    # 启用WAL模式提高并发性能
    dbapi_connection.execute("PRAGMA journal_mode=WAL")
    # 启用外键约束
    dbapi_connection.execute("PRAGMA foreign_keys=ON")
    # 设置同步模式为NORMAL，平衡安全和性能
    dbapi_connection.execute("PRAGMA synchronous=NORMAL")
    # 设置缓存大小（以页为单位）
    dbapi_connection.execute("PRAGMA cache_size=-10000")  # 约10MB缓存
    # 设置临时存储位置为内存
    dbapi_connection.execute("PRAGMA temp_store=MEMORY")
    # 设置页大小为4KB
    dbapi_connection.execute("PRAGMA page_size=4096")
    # 启用内存映射，提高I/O性能
    dbapi_connection.execute("PRAGMA mmap_size=30000000")  # 约30MB映射
    
    logger.debug("SQLite连接优化配置已应用")


# 查询性能监控
@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """记录SQL执行开始时间"""
    conn.info.setdefault('query_start_time', []).append(time.time())
    
    # 调试模式下记录SQL语句
    if settings.DEBUG:
        logger.debug(f"执行SQL: {statement}")
        logger.debug(f"参数: {parameters}")


@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """记录SQL执行时间并打印慢查询"""
    total_time = time.time() - conn.info['query_start_time'].pop()
    
    # 记录慢查询
    if total_time > settings.SLOW_QUERY_THRESHOLD:
        logger.warning(
            f"慢查询 (用时 {total_time:.2f}秒): {statement}"
        )


def get_db() -> Generator:
    """
    获取数据库会话
    
    用作FastAPI依赖项，提供数据库会话
    
    示例:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 