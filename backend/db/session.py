"""
Database session management for SQLAlchemy.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 获取项目根目录
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 确保data目录存在
DATA_DIR = os.path.join(ROOT_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# 数据库文件路径
DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'malware_detection.db')}"

# 创建SQLAlchemy引擎
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建所有模型的基类
Base = declarative_base()

# 依赖项
def get_db():
    """
    获取数据库会话的依赖项函数。
    用于FastAPI路由依赖注入。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 