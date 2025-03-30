"""
数据库查看相关路由

用于提供数据库内容查看功能，用于项目展示和调试
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.core.deps import get_db
from backend.models.user import User
from backend.models.scan_record import ScanRecord
from backend.models.known_threat import KnownThreat
import json

router = APIRouter(
    prefix="/database",
    tags=["database"],
    responses={404: {"description": "Not found"}},
)

@router.get("/users", response_model=Dict[str, Any])
async def get_users(
    skip: int = 0,
    limit: int = 100,  # 增加默认数量
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    获取用户数据，用于数据库查看页面
    
    参数:
      - skip: 分页偏移量
      - limit: 每页数量
      - search: 搜索关键词
    
    返回:
      - users: 用户数据列表
      - total: 用户总数
    """
    query = db.query(User)
    
    # 应用搜索筛选
    if search:
        search = f"%{search}%"
        query = query.filter(
            (User.username.like(search)) | 
            (User.email.like(search))
        )
    
    # 获取总数
    total = query.count()
    
    # 获取分页数据
    users = query.order_by(User.id.asc()).offset(skip).limit(limit).all()
    
    # 转换为字典列表
    result = []
    for user in users:
        user_dict = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "password": user.password,  # 为了展示，显示明文密码
            "created_at": user.created_at,
            "last_login": user.last_login,
            "is_active": user.is_active
        }
        
        # 处理JSON字段
        if hasattr(user, 'preferences') and user.preferences:
            if isinstance(user.preferences, str):
                try:
                    user_dict["preferences"] = json.loads(user.preferences)
                except:
                    user_dict["preferences"] = user.preferences
            else:
                user_dict["preferences"] = user.preferences
                
        if hasattr(user, 'notification_settings') and user.notification_settings:
            if isinstance(user.notification_settings, str):
                try:
                    user_dict["notification_settings"] = json.loads(user.notification_settings)
                except:
                    user_dict["notification_settings"] = user.notification_settings
            else:
                user_dict["notification_settings"] = user.notification_settings
                
        result.append(user_dict)
    
    return {
        "users": result,
        "total": total
    }

@router.get("/scan-records", response_model=Dict[str, Any])
async def get_scan_records(
    skip: int = 0,
    limit: int = 100,  # 增加默认数量
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    获取扫描记录数据，用于数据库查看页面
    
    参数:
      - skip: 分页偏移量
      - limit: 每页数量
      - search: 搜索关键词
    
    返回:
      - records: 扫描记录列表
      - total: 记录总数
    """
    query = db.query(ScanRecord)
    
    # 应用搜索筛选
    if search:
        search = f"%{search}%"
        query = query.filter(
            (ScanRecord.file_name.like(search)) | 
            (ScanRecord.user_name.like(search)) |
            (ScanRecord.file_hash.like(search))
        )
    
    # 获取总数
    total = query.count()
    
    # 获取分页数据，按ID排序
    records = query.order_by(ScanRecord.id.asc()).offset(skip).limit(limit).all()
    
    # 转换为字典列表
    result = []
    for record in records:
        # 处理result字段
        result_data = record.result
        if isinstance(result_data, str):
            try:
                result_data = json.loads(result_data)
            except:
                result_data = {}
        elif result_data is None:
            result_data = {}
            
        # 确定记录是否标记为恶意
        is_malicious = False
        if isinstance(result_data, dict):
            is_malicious = result_data.get("is_malicious", False)
        
        record_dict = {
            "id": record.id,
            "user_id": record.user_id,
            "user_name": record.user_name,
            "file_name": record.file_name,
            "file_hash": record.file_hash,
            "file_size": record.file_size,
            "scan_date": record.scan_date,
            "status": record.status,
            "privacy_enabled": record.privacy_enabled,
            "is_malicious": is_malicious,
            "result": result_data
        }
        
        result.append(record_dict)
    
    return {
        "records": result,
        "total": total
    }

@router.get("/known-threats", response_model=Dict[str, Any])
async def get_known_threats(
    skip: int = 0,
    limit: int = 100,  # 增加默认数量
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    获取已知威胁数据，用于数据库查看页面
    
    参数:
      - skip: 分页偏移量
      - limit: 每页数量
      - search: 搜索关键词
    
    返回:
      - threats: 威胁数据列表
      - total: 威胁总数
    """
    query = db.query(KnownThreat)
    
    # 应用搜索筛选
    if search:
        search = f"%{search}%"
        query = query.filter(
            (KnownThreat.hash.like(search)) | 
            (KnownThreat.threat_type.like(search)) |
            (KnownThreat.description.like(search))
        )
    
    # 获取总数
    total = query.count()
    
    # 获取分页数据，按ID排序
    threats = query.order_by(KnownThreat.id.asc()).offset(skip).limit(limit).all()
    
    # 转换为字典列表
    result = []
    for threat in threats:
        threat_dict = {
            "id": threat.id,
            "hash": threat.hash,
            "threat_type": threat.threat_type,
            "severity": threat.severity,
            "first_seen": threat.first_seen,
            "last_seen": threat.last_seen,
            "description": threat.description
        }
        
        result.append(threat_dict)
    
    return {
        "threats": result,
        "total": total
    } 