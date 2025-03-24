"""用户服务测试"""

import pytest
from fastapi import HTTPException

from backend.services.user_service import (
    get_user,
    get_user_by_username,
    create_user,
    authenticate_user,
    update_user
)

@pytest.mark.asyncio
async def test_get_user(db_session, test_user):
    """测试获取用户"""
    user = await get_user(db_session, test_user.id)
    assert user is not None
    assert user.id == test_user.id
    assert user.username == test_user.username
    assert user.email == test_user.email

@pytest.mark.asyncio
async def test_get_nonexistent_user(db_session):
    """测试获取不存在的用户"""
    user = await get_user(db_session, 9999)
    assert user is None

@pytest.mark.asyncio
async def test_get_user_by_username(db_session, test_user):
    """测试通过用户名获取用户"""
    user = await get_user_by_username(db_session, test_user.username)
    assert user is not None
    assert user.id == test_user.id
    assert user.username == test_user.username

@pytest.mark.asyncio
async def test_create_user(db_session):
    """测试创建用户"""
    user = await create_user(
        db_session,
        username="newuser",
        email="new@example.com",
        password="newpassword"
    )
    assert user is not None
    assert user.username == "newuser"
    assert user.email == "new@example.com"
    assert user.password == "newpassword"
    
    # 验证哈希密码不为空
    assert user.password_hash is not None
    assert user.password_hash != "newpassword"

@pytest.mark.asyncio
async def test_create_duplicate_username(db_session, test_user):
    """测试创建重复用户名的用户"""
    with pytest.raises(HTTPException) as excinfo:
        await create_user(
            db_session,
            username=test_user.username,
            email="another@example.com",
            password="password"
        )
    assert excinfo.value.status_code == 400
    assert "用户名已存在" in str(excinfo.value.detail)

@pytest.mark.asyncio
async def test_authenticate_user_success(db_session, test_user):
    """测试成功认证用户"""
    user = await authenticate_user(db_session, test_user.username, "testpassword")
    assert user is not None
    assert user.id == test_user.id
    assert user.username == test_user.username

@pytest.mark.asyncio
async def test_authenticate_user_wrong_password(db_session, test_user):
    """测试密码错误的认证"""
    user = await authenticate_user(db_session, test_user.username, "wrongpassword")
    assert user is None

@pytest.mark.asyncio
async def test_authenticate_nonexistent_user(db_session):
    """测试认证不存在的用户"""
    user = await authenticate_user(db_session, "nonexistent", "password")
    assert user is None 