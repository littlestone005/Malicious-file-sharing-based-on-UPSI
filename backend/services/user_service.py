from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from typing import List, Optional

from backend.models.user import User
from backend.core.security import verify_password, get_password_hash
from backend.database.session import get_db

async def get_user(db: Session, user_id: int) -> Optional[User]:
    """
    根据用户ID获取用户
    """
    return db.query(User).filter(User.id == user_id).first()

async def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    根据邮箱获取用户
    """
    return db.query(User).filter(User.email == email).first()

async def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """
    根据用户名获取用户
    """
    return db.query(User).filter(User.username == username).first()

async def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """
    获取用户列表
    """
    return db.query(User).offset(skip).limit(limit).all()

async def create_user(db: Session, username: str, email: str, password: str) -> User:
    """
    创建新用户
    """
    # 检查邮箱是否已被使用
    db_user = await get_user_by_email(db, email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 检查用户名是否已被使用
    db_user = await get_user_by_username(db, username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # 创建新用户
    hashed_password = get_password_hash(password)
    db_user = User(
        username=username,
        email=email,
        password=password,  # 存储明文密码，仅用于展示
        password_hash=hashed_password,  # 存储哈希密码，用于认证
        created_at=datetime.utcnow(),
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

async def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    验证用户身份
    """
    user = await get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    
    # 更新最后登录时间
    user.last_login = datetime.utcnow()
    db.commit()
    
    return user

async def update_user(db: Session, user_id: int, data: dict) -> User:
    """
    更新用户信息
    """
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 更新可修改的字段
    for key, value in data.items():
        if key == "password":
            # 如果更新密码，需要哈希处理
            setattr(user, "password_hash", get_password_hash(value))
        elif hasattr(user, key) and key != "id" and key != "password_hash":
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

async def deactivate_user(db: Session, user_id: int) -> User:
    """
    停用用户账户
    """
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    return user 