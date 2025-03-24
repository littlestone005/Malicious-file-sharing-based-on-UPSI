from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

from backend.core.security import create_access_token
from backend.schemas.user import UserCreate, UserResponse, TokenResponse
from backend.services.user_service import authenticate_user, create_user, get_user_by_username
from backend.database.session import get_db
from backend.core.config import settings

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# OAuth2 配置
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")

# 登录请求模型
class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    用户登录并获取令牌
    
    使用用户名和密码获取访问令牌
    """
    user = await authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    注册新用户
    
    创建新用户账户
    """
    try:
        user = await create_user(
            db=db, 
            username=user_data.username, 
            email=user_data.email, 
            password=user_data.password
        )
        return user
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"注册失败: {str(e)}"
        )

@router.get("/check-username/{username}")
async def check_username_availability(
    username: str,
    db: Session = Depends(get_db)
):
    """
    检查用户名是否可用
    """
    user = await get_user_by_username(db, username)
    return {"available": user is None}

# 添加其他认证相关路由...