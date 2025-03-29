from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.core.security import get_current_user
from backend.schemas.scan import ScanCreateRequest, ScanResponse, ScanListResponse
from backend.services.scan_service import (
    save_upload_file, 
    scan_file, 
    get_scan_records, 
    get_scan_record
)
from backend.db.session import get_db
from backend.models.user import User

router = APIRouter(prefix="/api/v1/scans", tags=["file scanning"])

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
    
    return {
        "id": record.id,
        "file_name": record.file_name,
        "scan_date": record.scan_date,
        "is_malicious": record.result and record.result.get("is_malicious", False) if record.result else False,
        "privacy_enabled": record.privacy_enabled,
        "result_details": record.result
    } 