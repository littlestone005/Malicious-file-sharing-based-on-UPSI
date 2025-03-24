from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """用户基础信息模式"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    """用户创建请求模式"""
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    """用户更新请求模式"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    """用户信息响应模式"""
    id: int
    password: str
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool
    
    class Config:
        orm_mode = True

class TokenResponse(BaseModel):
    """令牌响应模式"""
    access_token: str
    token_type: str
    user_id: int
    username: str 