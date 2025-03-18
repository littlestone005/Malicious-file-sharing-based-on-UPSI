from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
#整体就是为了处理torken的，来防止用户短时间重复登陆时需要再次输入信息
# 创建密码上下文实例
# schemes=["bcrypt"]: 使用bcrypt算法进行密码哈希
# deprecated="auto": 自动处理弃用的哈希方法
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#pwd_context是CryptContext的实例化
# 创建OAuth2密码验证方案实例
# tokenUrl: 指定获取token的接口地址
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    创建JWT访问令牌
    
    Args:
        data (dict): 要编码到token中的数据，如用户ID等
        expires_delta (Optional[timedelta]): token的过期时间，可选参数
        
    Returns:
        str: 生成的JWT token字符串
    """
    # 复制输入的数据字典，避免修改原始数据
    to_encode = data.copy()
    
    # 设置token的过期时间
    if expires_delta:
        # 如果提供了过期时间，使用提供的时间
        expire = datetime.utcnow() + expires_delta
    else:
        # 否则默认15分钟后过期
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    # 将过期时间添加到要编码的数据中
    # "exp"是JWT标准声明，表示过期时间
    to_encode.update({"exp": expire})
    
    # 使用JWT编码数据
    encoded_jwt = jwt.encode(
        to_encode,                    # 要编码的数据
        settings.SECRET_KEY,          # 用于签名的密钥
        algorithm=settings.ALGORITHM   # 使用的加密算法（如HS256）
    )
    
    # 返回生成的JWT token
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str):
    """
    验证密码是否正确
    
    Args:
        plain_password (str): 用户输入的明文密码
        hashed_password (str): 数据库中存储的哈希密码
        
    Returns:
        bool: 如果密码匹配返回True，否则返回False
    """
    # 使用pwd_context验证密码
    # 会自动处理密码的哈希比较
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    """
    获取密码的哈希值
    
    Args:
        password (str): 要哈希的明文密码
        
    Returns:
        str: 密码的哈希值，用于存储在数据库中
    """
    # 使用pwd_context创建密码的哈希值
    # 使用bcrypt算法自动添加盐值并进行哈希
    return pwd_context.hash(password)

# 1. CryptContext 是什么：
# - 是passlib库提供的密码哈希管理工具
# - 用于处理密码的加密和验证
# - 提供了一个统一的接口来处理不同的哈希算法

# 2. schemes=["bcrypt"] 的含义：
# - 指定使用bcrypt算法进行密码哈希
# - bcrypt的特点：
#   - 自动包含盐值（salt）
#   - 计算速度适中（故意的，为了防止暴力破解）
#   - 被广泛认可的安全哈希算法

# 3. deprecated="auto" 的含义：
# - 自动处理过时的哈希方法
# - 如果检测到旧的哈希方法，会自动升级到新的方法 