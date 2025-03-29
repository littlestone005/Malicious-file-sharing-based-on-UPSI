from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.core.config import settings, ALGORITHM
from backend.db.session import get_db
from backend.models.user import User

# 密码哈希管理
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 配置
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# 验证密码
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码

    比较明文密码和哈希密码是否匹配
    """
    return pwd_context.verify(plain_password, hashed_password)

# 创建密码哈希
def get_password_hash(password: str) -> str:
    """创建密码哈希

    根据明文密码生成安全的哈希密码
    """
    return pwd_context.hash(password)

# 创建JWT访问令牌
def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """创建JWT访问令牌

    Args:
        subject: 令牌主题，通常是用户ID
        expires_delta: 令牌有效期，默认为配置中的值

    Returns:
        str: 编码后的JWT令牌
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

# 获取当前用户
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """获取当前用户

    通过JWT令牌验证并返回当前登录用户
    
    Args:
        token: JWT令牌
        db: 数据库会话
        
    Returns:
        User: 用户对象
        
    Raises:
        HTTPException: 认证失败时抛出401异常
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="认证失败",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 解码JWT令牌
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # 获取用户
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    
    # 检查用户是否被停用
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账户已被停用"
        )
    
    return user 