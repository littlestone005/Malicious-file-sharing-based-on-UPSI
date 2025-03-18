# 导入所需的库
from pydantic_settings import BaseSettings    # 用于创建具有类型验证的配置类
from dotenv import load_dotenv               # 用于加载环境变量文件
import os                                    # 用于操作环境变量

# 加载.env文件中的环境变量到系统环境中
load_dotenv('.env')

class Settings(BaseSettings):
    """
    应用程序配置类
    继承自BaseSettings以获得环境变量的自动加载和类型验证功能
    """
    # 基本配置
    PROJECT_NAME: str = "Malware Detection System"    # 项目名称，用于API文档和日志
    VERSION: str = "1.0.0"                           # 项目版本号，用于版本控制和API文档
    API_V1_STR: str = "/api/v1"                      # API路由前缀，用于API版本管理
    #可以同时维护多个API版本
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL")    # PostgreSQL数据库连接URL
                                                     # 格式: postgresql://user:password@host:port/dbname
    
    # Redis缓存配置
    REDIS_URL: str = os.getenv("REDIS_URL")         # Redis服务器连接URL
                                                    # 格式: redis://host:port/db
#这行代码定义了Redis缓存服务器的连接URL配置项，类似于数据库URL的配置。    
    # JWT认证配置
    SECRET_KEY: str = os.getenv("SECRET_KEY")       # JWT加密密钥，用于token生成和验证
    ALGORITHM: str = os.getenv("ALGORITHM")         # JWT加密算法，通常使用"HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(          # JWT token过期时间（分钟）
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30) # 默认30分钟
    )

# 创建全局配置实例，供其他模块导入使用
settings = Settings() 