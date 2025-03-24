from pydantic import BaseSettings
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
import pathlib

# 加载.env文件
load_dotenv()

class Settings(BaseSettings):
    # 基础配置
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Malicious File Detection")
    VERSION: str = os.getenv("VERSION", "0.1.0")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # API配置
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
    
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./malware_detection.db")
    
    # 安全配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    PASSWORD_HASH_ALGORITHM: str = os.getenv("PASSWORD_HASH_ALGORITHM", "bcrypt")
    PASSWORD_HASH_ROUNDS: int = int(os.getenv("PASSWORD_HASH_ROUNDS", "12"))
    MIN_PASSWORD_LENGTH: int = int(os.getenv("MIN_PASSWORD_LENGTH", "8"))
    PASSWORD_COMPLEXITY: bool = os.getenv("PASSWORD_COMPLEXITY", "true").lower() == "true"
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[str] = os.getenv("BACKEND_CORS_ORIGINS", "").replace(" ", "").split(",") or ["http://localhost:3000"]
    
    # 上传配置
    BASE_DIR: pathlib.Path = pathlib.Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    UPLOAD_PATH: pathlib.Path = BASE_DIR / "uploads"
    SCAN_UPLOAD_PATH: pathlib.Path = BASE_DIR / "uploads" / "scans"
    TEMP_UPLOAD_PATH: pathlib.Path = BASE_DIR / "uploads" / "temp"
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    ALLOWED_FILE_TYPES: List[str] = os.getenv("ALLOWED_FILE_TYPES", "txt,pdf,doc,docx,xls,xlsx").replace(" ", "").split(",")
    
    # 日志配置
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    LOG_DIR: pathlib.Path = BASE_DIR / "logs"
    LOG_FILE: str = os.getenv("LOG_FILE", str(LOG_DIR / "app.log"))
    
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
        settings.LOG_DIR
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)

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