from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.core.security import get_current_user
from backend.schemas.user import UserResponse, UserUpdate
from backend.services.user_service import get_user, get_users, update_user, deactivate_user
from backend.database.session import get_db
from backend.models.user import User

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    """
    获取当前登录用户的信息
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新当前登录用户的信息
    """
    updated_user = await update_user(db, current_user.id, user_data.dict(exclude_unset=True))
    return updated_user

@router.get("/", response_model=List[UserResponse])
async def read_users(
    skip: int = 0, 
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取所有用户列表
    
    需要管理员权限
    """
    # TODO: 这里应添加权限检查
    users = await get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取指定用户的信息
    
    需要管理员权限或是用户本人
    """
    # 检查是否为本人或管理员
    if current_user.id != user_id:
        # TODO: 添加管理员权限检查
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够权限访问此资源"
        )
    
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    管理员更新用户信息
    
    需要管理员权限
    """
    # TODO: 添加管理员权限检查
    
    updated_user = await update_user(db, user_id, user_data.dict(exclude_unset=True))
    return updated_user

@router.delete("/{user_id}", response_model=UserResponse)
async def deactivate_user_account(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    停用用户账户
    
    需要管理员权限或是用户本人
    """
    # 检查是否为本人或管理员
    if current_user.id != user_id:
        # TODO: 添加管理员权限检查
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够权限执行此操作"
        )
    
    user = await deactivate_user(db, user_id)
    return user 