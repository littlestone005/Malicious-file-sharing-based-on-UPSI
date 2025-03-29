from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ScanCreateRequest(BaseModel):
    """扫描创建请求"""
    privacy_enabled: bool = True

class ScanListResponse(BaseModel):
    """扫描记录列表响应项"""
    id: int
    file_name: str
    scan_date: datetime
    status: str
    is_malicious: Optional[bool] = None
    privacy_enabled: Optional[bool] = None
    result_details: Optional[Dict[str, Any]] = None
    
    class Config:
        orm_mode = True

class ScanResponse(BaseModel):
    """扫描记录详情响应"""
    id: int
    file_name: str
    scan_date: datetime
    is_malicious: bool
    privacy_enabled: bool
    result_details: Optional[Dict[str, Any]] = None
    
    class Config:
        orm_mode = True

class ScanStatisticsResponse(BaseModel):
    """扫描统计数据响应"""
    totalScans: int
    cleanFiles: int
    infectedFiles: int
    suspiciousFiles: int
    privacyProtected: int 