"""认证路由测试"""

import pytest
from fastapi import status

def test_login(client, test_user):
    """测试登录"""
    response = client.post(
        "/api/v1/auth/token",
        json={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"
    assert "user_id" in data
    assert "username" in data
    assert data["username"] == "testuser"

def test_login_wrong_password(client, test_user):
    """测试密码错误的登录"""
    response = client.post(
        "/api/v1/auth/token",
        json={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_register(client):
    """测试注册"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "newpassword"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "new@example.com"
    assert "id" in data
    assert "password" in data 