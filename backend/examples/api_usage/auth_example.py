#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
演示API身份验证示例
展示如何使用系统API进行身份验证
"""

import requests
import json

# API基础URL
BASE_URL = "http://localhost:8000/api/v1"

def register_user(username, email, password):
    """
    注册新用户示例
    
    参数:
        username: 用户名
        email: 邮箱
        password: 密码
    
    返回:
        响应对象
    """
    url = f"{BASE_URL}/auth/register"
    data = {
        "username": username,
        "email": email,
        "password": password
    }
    
    response = requests.post(url, json=data)
    return response

def login_user(username, password):
    """
    用户登录示例
    
    参数:
        username: 用户名
        password: 密码
    
    返回:
        (响应对象, 访问令牌)
    """
    url = f"{BASE_URL}/auth/token"
    data = {
        "username": username,
        "password": password
    }
    
    response = requests.post(url, data=data)
    token = None
    
    if response.status_code == 200:
        token = response.json().get("access_token")
    
    return response, token

def get_user_info(token):
    """
    获取当前用户信息示例
    
    参数:
        token: 访问令牌
    
    返回:
        响应对象
    """
    url = f"{BASE_URL}/users/me"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(url, headers=headers)
    return response

def update_user_profile(token, email=None, password=None):
    """
    更新用户信息示例
    
    参数:
        token: 访问令牌
        email: 新邮箱
        password: 新密码
    
    返回:
        响应对象
    """
    url = f"{BASE_URL}/users/me"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # 构建更新数据
    data = {}
    if email:
        data["email"] = email
    if password:
        data["password"] = password
    
    response = requests.put(url, json=data, headers=headers)
    return response

def demonstrate_auth_flow():
    """完整演示身份验证流程"""
    # 1. 注册新用户
    print("1. 注册新用户...")
    register_resp = register_user("demo_user", "demo@example.com", "Demo@Pass123")
    
    if register_resp.status_code == 200:
        print("注册成功!")
    else:
        print(f"注册失败: {register_resp.text}")
        # 可能是用户已存在，继续下一步
    
    # 2. 用户登录
    print("\n2. 用户登录...")
    login_resp, token = login_user("demo_user", "Demo@Pass123")
    
    if login_resp.status_code == 200:
        print(f"登录成功! 获取令牌: {token[:10]}...")
    else:
        print(f"登录失败: {login_resp.text}")
        return
    
    # 3. 获取用户信息
    print("\n3. 获取用户信息...")
    user_info_resp = get_user_info(token)
    
    if user_info_resp.status_code == 200:
        user_info = user_info_resp.json()
        print(f"获取用户信息成功:")
        print(json.dumps(user_info, indent=2, ensure_ascii=False))
    else:
        print(f"获取用户信息失败: {user_info_resp.text}")
    
    # 4. 更新用户信息
    print("\n4. 更新用户信息...")
    update_resp = update_user_profile(token, email="updated@example.com")
    
    if update_resp.status_code == 200:
        print("用户信息更新成功!")
    else:
        print(f"用户信息更新失败: {update_resp.text}")
    
    # 5. 再次获取用户信息验证更新
    print("\n5. 验证用户信息更新...")
    user_info_resp = get_user_info(token)
    
    if user_info_resp.status_code == 200:
        user_info = user_info_resp.json()
        print(f"当前用户信息:")
        print(json.dumps(user_info, indent=2, ensure_ascii=False))
    else:
        print(f"获取用户信息失败: {user_info_resp.text}")

if __name__ == "__main__":
    print("===== 身份验证API使用示例 =====")
    demonstrate_auth_flow()
    print("\n示例运行完成!") 