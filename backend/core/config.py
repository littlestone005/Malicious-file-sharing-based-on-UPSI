"""
应用程序配置模块
包含所有应用程序配置参数和环境变量
"""

from pydantic import BaseSettings, AnyHttpUrl, validator
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any, Union
import pathlib
import secrets

# 加载.env文件
load_dotenv()

class Settings(BaseSettings):
    """应用程序配置设置"""
    # API相关配置
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """验证并处理CORS来源配置"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # 项目信息
    PROJECT_NAME: str = "Malicious File Sharing Based on UPSI"
    DESCRIPTION: str = "Based on unbalanced PSI for malicious file feature sharing"
    VERSION: str = "0.1.0"
    
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/malware_detection.db")
    
    # 数据库连接池配置
    DB_POOL_SIZE: int = 20
    DB_POOL_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800  # 30分钟
    
    # 数据库性能监控配置
    SLOW_QUERY_THRESHOLD: float = 0.5  # 慢查询阈值（秒）
    
    # 文件上传配置
    UPLOAD_DIR: str = "data/uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: List[str] = ["exe", "dll", "sys", "zip", "rar", "7z", "pdf", "doc", "docx", "xls", "xlsx"]
    
    # PSI算法配置
    PSI_FEATURE_COUNT: int = 200  # 每个文件提取的特征数量
    PSI_MATCH_THRESHOLD: float = 0.6  # PSI匹配阈值
    
    # 缓存配置
    CACHE_ENABLED: bool = True
    CACHE_EXPIRATION: int = 3600  # 1小时（秒）
    
    # 安全设置
    REQUIRE_HTTPS: bool = False  # 生产环境设为True
    PASSWORD_MIN_LENGTH: int = 8  # 密码最小长度
    
    # 调试模式
    DEBUG: bool = False
    
    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "data/logs/app.log"
    
    # 基础配置
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PASSWORD_HASH_ALGORITHM: str = os.getenv("PASSWORD_HASH_ALGORITHM", "bcrypt")
    PASSWORD_HASH_ROUNDS: int = int(os.getenv("PASSWORD_HASH_ROUNDS", "12"))
    MIN_PASSWORD_LENGTH: int = int(os.getenv("MIN_PASSWORD_LENGTH", "8"))
    PASSWORD_COMPLEXITY: bool = os.getenv("PASSWORD_COMPLEXITY", "true").lower() == "true"
    
    # 上传配置
    BASE_DIR: pathlib.Path = pathlib.Path(__file__).resolve().parent.parent.parent
    UPLOAD_PATH: pathlib.Path = BASE_DIR / "data" / "uploads"
    SCAN_UPLOAD_PATH: pathlib.Path = BASE_DIR / "data" / "uploads" / "scans"
    TEMP_UPLOAD_PATH: pathlib.Path = BASE_DIR / "data" / "uploads" / "temp"
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    ALLOWED_FILE_TYPES: List[str] = os.getenv("ALLOWED_FILE_TYPES", "txt,pdf,doc,docx,xls,xlsx").replace(" ", "").split(",")
    
    # 日志配置
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    LOG_DIR: pathlib.Path = BASE_DIR / "data" / "logs"
    
    # 速率限制
    RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_PERIOD: int = int(os.getenv("RATE_LIMIT_PERIOD", "60"))
    
    # 扫描配置
    SCAN_TIMEOUT: int = int(os.getenv("SCAN_TIMEOUT", "300"))
    SCAN_INTERVAL: int = int(os.getenv("SCAN_INTERVAL", "60"))
    SCAN_TYPE: str = os.getenv("SCAN_TYPE", "full")
    SCAN_OPTIONS: Dict[str, Any] = {
        "deep_scan": os.getenv("SCAN_OPTIONS_DEEP_SCAN", "true").lower() == "true"
    }
    
    # PSI配置
    SERVER_KEY: str = os.getenv("SERVER_KEY", "your-secret-key-for-psi-protocol")
    SERVER_PREPROCESSED_CACHE: str = os.getenv("SERVER_PREPROCESSED_CACHE", "./cache/preprocessed.dat")
    
    # 已知恶意软件样本哈希（用于演示和测试）
    MALWARE_SIGNATURES: List[str] = [
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
        "3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278",
        "8c3d4a0f94b252c7859a96fd69a5711b5a4e599afc857c8b4f414b3fb6a095b9",
        "2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3"
    ]
    
    class Config:
        """Pydantic配置"""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# 创建全局配置实例
settings = Settings()

# 确保必要的目录存在
def ensure_directories():
    """确保必要的目录存在"""
    directories = [
        settings.UPLOAD_PATH,
        settings.SCAN_UPLOAD_PATH,
        settings.TEMP_UPLOAD_PATH,
        settings.LOG_DIR,
        settings.UPLOAD_PATH / "malware_samples"  # 添加恶意软件样本目录
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"目录已创建: {directory}")  # 添加日志输出

# 创建目录
ensure_directories()

# 预处理服务器数据
SERVER_PREPROCESSED = None

def initialize_psi():
    """初始化PSI协议"""
    global SERVER_PREPROCESSED
    
    try:
        from backend.psi_wrapper import get_psi_wrapper
        wrapper = get_psi_wrapper()
        SERVER_PREPROCESSED = wrapper.server_preprocess(settings.MALWARE_SIGNATURES, settings.SERVER_KEY)
        print("PSI预处理数据已初始化")
    except ImportError:
        print("警告: PSI包装器未找到，跳过PSI初始化")
    except Exception as e:
        print(f"警告: PSI初始化错误: {str(e)}")

# 配置变量
ALGORITHM = "HS256"  # JWT算法
