from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from pydantic import BaseModel, ValidationError
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.services.detection_service import analyze_hashes, detect_malware, add_malware_sample
from backend.schemas.detection import DetectionRequest, DetectionResponse
from backend.utils.hashing import calculate_file_hash, calculate_upload_file_hash
from backend.core.deps import get_db
from backend.core.security import get_current_user
from backend.models.user import User
import os
from backend.core.config import settings
import logging

router = APIRouter(prefix="/api/v1/detection", tags=["detection"])

@router.post("/scan", response_model=DetectionResponse)
async def detect_malware(request: DetectionRequest):
    try:
        result = await analyze_hashes(request)
        return {
            "malicious_hashes": result.malicious_hashes,
            "proof": result.proof
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    use_psi: bool = True
):
    file_hash = await calculate_upload_file_hash(file)
    detection_result = await detect_malware(
        hashes=[file_hash],
        use_psi=use_psi
    )
    return {
        "filename": file.filename,
        "hash": file_hash,
        "is_malicious": len(detection_result.malicious_hashes) > 0,
        "proof": detection_result.proof
    }

@router.post("/malware-sample", tags=["detection"])
async def upload_malware_sample(
    file: UploadFile = File(...),
    threat_type: str = Form(...),
    severity: str = Form(...),
    description: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    上传文件并将其添加为恶意软件样本
    """
    logger = logging.getLogger(__name__)
    logger.info(f"开始处理恶意软件样本上传: {file.filename}")
    
    # 验证用户权限（仅管理员可以上传样本）
    if current_user.username != "admin":
        logger.warning(f"非管理员用户尝试上传恶意软件样本: {current_user.username}")
        raise HTTPException(
            status_code=403,
            detail="只有管理员可以上传恶意软件样本"
        )
    
    # 验证severity参数
    if severity not in ["low", "medium", "high", "critical"]:
        logger.warning(f"无效的威胁级别参数: {severity}")
        raise HTTPException(
            status_code=400,
            detail="威胁级别必须是: low, medium, high, critical"
        )
    
    # 确保上传目录存在
    sample_dir = os.path.join(settings.UPLOAD_DIR, "malware_samples")
    logger.info(f"确保恶意软件样本目录存在: {sample_dir}")
    try:
        os.makedirs(sample_dir, exist_ok=True)
        logger.info(f"恶意软件样本目录已创建或已存在: {sample_dir}")
    except Exception as e:
        logger.error(f"创建恶意软件样本目录失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"服务器错误: 无法创建上传目录: {str(e)}"
        )
    
    # 保存上传的文件
    file_path = os.path.join(sample_dir, file.filename)
    logger.info(f"保存上传文件: {file_path}")
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        logger.info(f"文件已保存: {file_path}")
    except Exception as e:
        logger.error(f"保存上传文件失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"服务器错误: 无法保存上传文件: {str(e)}"
        )
    
    try:
        # 添加为恶意软件样本
        logger.info(f"将文件添加为恶意软件样本: {file_path}")
        threat = await add_malware_sample(
            db=db,
            file_path=file_path,
            threat_type=threat_type,
            severity=severity,
            description=description
        )
        
        logger.info(f"恶意软件样本已成功添加: {threat.hash}")
        return {
            "status": "success",
            "message": "成功添加恶意软件样本",
            "file_name": file.filename,
            "hash": threat.hash,
            "threat_type": threat.threat_type,
            "severity": threat.severity
        }
    except Exception as e:
        logger.error(f"添加恶意软件样本失败: {str(e)}")
        
        # 出错时删除上传的文件
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"已删除上传文件: {file_path}")
            except Exception as delete_error:
                logger.error(f"删除上传文件失败: {str(delete_error)}")
        
        raise HTTPException(
            status_code=500,
            detail=f"添加恶意软件样本失败: {str(e)}"
        )