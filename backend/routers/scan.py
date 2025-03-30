from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
import logging

from backend.core.security import get_current_user
from backend.schemas.scan import ScanCreateRequest, ScanResponse, ScanListResponse, ScanStatisticsResponse
from backend.services.scan_service import (
    save_upload_file, 
    scan_file, 
    get_scan_records, 
    get_scan_record,
    get_scan_statistics,
    create_scan_record,
    update_scan_result
)
from backend.db.session import get_db
from backend.models.user import User
from backend.services.detection_service import analyze_hashes
from pydantic import BaseModel
from datetime import datetime

# 设置日志
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/scans", tags=["file scanning"])

# 定义文件哈希请求模型
class FileHashItem(BaseModel):
    hash: str
    fileName: str
    fileSize: int
    fileType: Optional[str] = None

class CheckHashesRequest(BaseModel):
    hashes: List[FileHashItem]
    privacy_enabled: bool = True

@router.post("/check-hashes", response_model=Dict[str, Any])
async def check_file_hashes(
    request: CheckHashesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    检测文件哈希是否为恶意软件
    
    接收文件哈希列表，并使用PSI协议检测是否为恶意软件
    """
    try:
        logger.info(f"接收到哈希检测请求: {len(request.hashes)}个文件")
        
        # 提取所有哈希值，用于检测
        hashes_list = [item.hash for item in request.hashes]
        
        # 为每个文件创建一个扫描记录
        scan_records = []
        for item in request.hashes:
            record = await create_scan_record(
                db=db,
                user_id=current_user.id,
                file_name=item.fileName,
                file_hash=item.hash,
                file_size=item.fileSize,
                privacy_enabled=request.privacy_enabled
            )
            scan_records.append(record)
        
        # 调用检测服务分析哈希
        from backend.core.config import settings
        hash_detection_result = []
        
        # 此处模拟哈希检测结果，实际应调用analyze_hashes服务
        # 简化处理：检查哈希是否在预定义的恶意软件签名列表中
        malware_signatures = settings.MALWARE_SIGNATURES
        
        for idx, hash_value in enumerate(hashes_list):
            record = scan_records[idx]
            is_malicious = hash_value in malware_signatures
            
            # 构建检测结果
            result = {
                "is_malicious": is_malicious,
                "scan_method": "psi" if request.privacy_enabled else "direct",
                "scan_date": datetime.utcnow().isoformat()
            }
            
            # 针对恶意文件添加威胁详情
            if is_malicious:
                result["threat_details"] = {
                    "type": "Trojan",  # 示例数据，实际应从威胁数据库获取
                    "severity": "high", 
                    "description": "Known malicious file detected in database"
                }
            
            # 更新扫描记录结果
            await update_scan_result(db, record.id, result)
            
            # 添加到返回结果
            hash_detection_result.append({
                "hash": hash_value,
                "fileName": request.hashes[idx].fileName,
                "is_malicious": is_malicious,
                "scan_id": record.id
            })
        
        return {
            "scan_id": scan_records[0].id if scan_records else None,  # 返回第一个记录的ID作为扫描ID
            "results": hash_detection_result
        }
        
    except Exception as e:
        logger.error(f"哈希检测失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"哈希检测失败: {str(e)}"
        )

@router.post("/upload", response_model=ScanResponse)
async def upload_and_scan(
    file: UploadFile = File(...),
    privacy_enabled: bool = Query(True, description="是否启用PSI隐私保护"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    上传并扫描文件
    
    上传文件并进行恶意软件检测，支持PSI隐私保护
    """
    try:
        # 保存上传文件
        file_path = await save_upload_file(file)
        
        # 扫描文件
        result = await scan_file(
            db=db,
            file_path=file_path,
            user_id=current_user.id,
            privacy_enabled=privacy_enabled
        )
        
        # 从结果构建响应
        is_malicious = result.get("is_malicious", False)
        scan_id = result.get("scan_id")
        
        return {
            "id": scan_id,
            "file_name": file.filename,
            "scan_date": result.get("scan_date"),
            "is_malicious": is_malicious,
            "privacy_enabled": privacy_enabled,
            "result_details": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"扫描失败: {str(e)}"
        )

@router.get("/", response_model=List[ScanListResponse])
async def list_scan_records(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取用户的扫描记录列表
    """
    records = await get_scan_records(db, user_id=current_user.id, skip=skip, limit=limit)
    
    # 处理记录中的result字段，确保它是有效的JSON对象
    for record in records:
        if record.result and isinstance(record.result, str):
            try:
                record.result = json.loads(record.result)
            except (json.JSONDecodeError, TypeError):
                # 如果解析失败，设置为空对象
                record.result = {}
        
        # 确保result是字典
        if not isinstance(record.result, dict):
            record.result = {}
        
        # 设置is_malicious属性，从result字段中获取
        record.is_malicious = record.result.get("is_malicious", False)
        
        # 设置privacy_enabled属性
        # ScanListResponse模型中没有privacy_enabled字段，需要在返回之前手动加入
        setattr(record, "privacy_enabled", record.privacy_enabled)
        
        # 将result作为属性保存，方便前端使用
        setattr(record, "result_details", record.result)
    
    return records

@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan_detail(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取扫描记录详情
    """
    record = await get_scan_record(db, record_id=scan_id)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="扫描记录不存在"
        )
    
    # 检查是否为记录所有者
    if record.user_id != current_user.id:
        # TODO: 添加管理员权限检查
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有权限访问此记录"
        )
    
    # 处理result字段，确保它是有效的JSON对象
    if record.result and isinstance(record.result, str):
        try:
            record.result = json.loads(record.result)
        except (json.JSONDecodeError, TypeError):
            # 如果解析失败，设置为空对象
            record.result = {}
    
    # 确保result是字典
    result = record.result or {}
    is_malicious = False
    
    # 尝试获取is_malicious字段
    if isinstance(result, dict):
        is_malicious = result.get("is_malicious", False)
    
    return {
        "id": record.id,
        "file_name": record.file_name,
        "scan_date": record.scan_date,
        "is_malicious": is_malicious,
        "privacy_enabled": record.privacy_enabled,
        "result_details": result
    }

@router.get("/statistics/", response_model=None)
async def get_user_scan_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取用户的扫描统计数据
    
    返回总扫描数、安全文件数、威胁文件数、可疑文件数和隐私保护使用次数
    """
    try:
        statistics = await get_scan_statistics(db, current_user.id)
        return statistics
    except Exception as e:
        logger.error(f"获取扫描统计数据失败: {str(e)}")
        # 发生错误时返回空数据
        return {
            "totalScans": -1,
            "cleanFiles": -1,
            "infectedFiles": -1,
            "suspiciousFiles": -1,
            "privacyProtected": -1
        } 