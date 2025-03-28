from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    """用户基础信息模式"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    """用户创建请求模式"""
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    """用户更新请求模式"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    current_password: Optional[str] = None  # 用于验证当前密码
    is_active: Optional[bool] = None
    preferences: Optional[Dict[str, Any]] = None  # 用户偏好设置
    notification_settings: Optional[Dict[str, bool]] = None  # 通知设置

class UserResponse(UserBase):
    """用户信息响应模式"""
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool
    preferences: Optional[Dict[str, Any]] = None
    notification_settings: Optional[Dict[str, bool]] = None
    
    class Config:
        orm_mode = True

class TokenResponse(BaseModel):
    """令牌响应模式"""
    access_token: str
    token_type: str
    user_id: int
    username: str 