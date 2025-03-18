from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base
from sqlalchemy import Column, Integer, String

# 创建数据库表
Base.metadata.create_all(bind=engine)#创建所有在 Base 类中定义的 ORM 模型对应的数据库表。
#您需要在 SQLAlchemy 的 Base 类中定义自己的模型类
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 设置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # 允许所有来源访问
    allow_credentials=True,   # 允许携带凭证
    allow_methods=["*"],      # 允许所有HTTP方法
    allow_headers=["*"],      # 允许所有请求头
)

# 包含API路由
app.include_router(api_router, prefix=settings.API_V1_STR)

# 数据库连接配置
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/malware_detection"

# 创建数据库引擎
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 创建会话工厂（用于创建数据库会话）
SessionLocal = sessionmaker(
    autocommit=False,    # 不自动提交事务
    autoflush=False,     # 不自动刷新
    bind=engine          # 绑定到引擎
)

# 创建基础模型类
Base = declarative_base()

# 用户模型定义
class User(Base):
    __tablename__ = "users"  # 表名

    id = Column(Integer, primary_key=True, index=True)      # 主键ID
    username = Column(String, unique=True, index=True)      # 唯一用户名
    email = Column(String, unique=True, index=True)         # 唯一邮箱
    password_hash = Column(String)                          # 密码哈希
    created_at = Column(DateTime)                           # 创建时间
    last_login = Column(DateTime)                           # 最后登录时间
    is_active = Column(Boolean, default=True)               # 是否激活

# 扫描记录模型定义
class ScanRecord(Base):
    __tablename__ = "scan_records"  # 表名

    id = Column(Integer, primary_key=True, index=True)      # 主键ID
    user_id = Column(Integer, ForeignKey("users.id"))       # 外键关联用户
    file_name = Column(String)                              # 文件名
    file_hash = Column(String)                              # 文件哈希值
    scan_date = Column(DateTime, default=datetime.utcnow)   # 扫描时间
    status = Column(String)                                 # 扫描状态
    privacy_enabled = Column(Boolean, default=True)         # 隐私保护
    result = Column(JSON)                                   # 扫描结果

# 数据访问层示例
class ScanRepository:
    def __init__(self, db_session: Session):
        self.db_session = db_session
#async 通常与异步编程相关，但在您提供的 SQL 脚本中并没有直接使用 async 关键字
    # 创建扫描记录
    async def create_scan(self, user_id: int, file_hash: str) -> ScanRecord:
        scan_record = ScanRecord(
            user_id=user_id,
            file_hash=file_hash,
            status="pending"
        )
        self.db_session.add(scan_record)
        await self.db_session.commit()
        return scan_record

    # 获取用户的扫描记录
    async def get_user_scans(
        self, 
        user_id: int, 
        skip: int = 0,    # 分页参数：跳过数量
        limit: int = 10   # 分页参数：限制数量
    ) -> List[ScanRecord]:
        return await self.db_session.query(ScanRecord)\
            .filter(ScanRecord.user_id == user_id)\
            .offset(skip)\
            .limit(limit)\
            .all() 