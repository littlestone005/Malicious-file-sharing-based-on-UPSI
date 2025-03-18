# 导入必要的SQLAlchemy组件
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession  # 使用异步引擎和会话
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from app.core.config import settings

# 创建异步数据库引擎
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# 创建异步会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

# 创建声明性基类
Base = declarative_base()

async def get_db():
    """
    创建数据库会话的依赖函数
    
    用法示例：
    @app.get("/users")
    async def get_users(db: AsyncSession = Depends(get_db)):
        users = await db.execute(select(User))  # 使用异步查询
        return users.scalars().all()
    
    Yields:
        AsyncSession: 数据库会话对象
    """
    async with SessionLocal() as db:  # 使用异步上下文管理器
        yield db  # 返回会话给使用者