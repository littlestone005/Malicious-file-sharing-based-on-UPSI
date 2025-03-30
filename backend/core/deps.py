from typing import Generator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from backend.db.session import SessionLocal
from backend.models.user import User
from backend.core.config import settings
from backend.schemas.token import TokenPayload
from backend.core.security import oauth2_scheme, JWT_SECRET, JWT_ALGORITHM

def get_db() -> Generator:
    """
    获取数据库会话依赖
    
    为每个请求创建一个新的SQLAlchemy会话，在请求结束时关闭
    
    Yields:
        Session: 数据库会话
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    获取当前用户依赖
    
    解析JWT令牌，验证其有效性，并返回相应的用户对象
    
    Args:
        db: 数据库会话
        token: JWT令牌
        
    Returns:
        User: 用户对象
        
    Raises:
        HTTPException: 当令牌无效或用户不存在时抛出
    """
    try:
        # 解码JWT令牌
        payload = jwt.decode(
            token, 
            JWT_SECRET, 
            algorithms=[JWT_ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效凭证",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 查找用户
    user = db.query(User).filter(User.username == token_data.sub).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 验证用户状态
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账户已禁用",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    获取当前活跃用户依赖
    
    Args:
        current_user: 当前用户对象
        
    Returns:
        User: 活跃用户对象
        
    Raises:
        HTTPException: 当用户不活跃时抛出
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账户未激活"
        )
    return current_user 