from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status
from typing import List, Optional
import os
import json

from backend.models.scan_record import ScanRecord
from backend.models.known_threat import KnownThreat
from backend.utils.hashing import calculate_file_hash
from backend.core.config import settings
from backend.psi_wrapper import get_psi_wrapper
from backend.models.user import User

async def save_upload_file(upload_file: UploadFile) -> str:
    """
    保存上传的文件并返回保存路径
    """
    # 确保上传目录存在
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # 生成唯一文件名
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    file_path = os.path.join(settings.UPLOAD_DIR, f"{timestamp}_{upload_file.filename}")
    
    # 保存文件
    with open(file_path, "wb") as f:
        content = await upload_file.read()
        f.write(content)
    
    return file_path

async def create_scan_record(
    db: Session, 
    user_id: int, 
    file_name: str,
    file_hash: str,
    file_size: int,
    privacy_enabled: bool
) -> ScanRecord:
    """
    创建扫描记录
    """
    # 获取用户名
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    record = ScanRecord(
        user_id=user_id,
        user_name=user.username,
        file_name=file_name,
        file_hash=file_hash,
        file_size=file_size,
        scan_date=datetime.utcnow(),
        status="pending",
        privacy_enabled=privacy_enabled,
        result=None
    )
    
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

async def update_scan_status(db: Session, record_id: int, status: str) -> ScanRecord:
    """
    更新扫描状态
    """
    record = db.query(ScanRecord).filter(ScanRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found")
    
    record.status = status
    db.commit()
    db.refresh(record)
    return record

async def update_scan_result(db: Session, record_id: int, result: dict) -> ScanRecord:
    """
    更新扫描结果
    """
    record = db.query(ScanRecord).filter(ScanRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found")
    
    record.result = result
    record.status = "completed"
    db.commit()
    db.refresh(record)
    return record

async def get_scan_records(
    db: Session, 
    user_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[ScanRecord]:
    """
    获取扫描记录列表
    """
    query = db.query(ScanRecord)
    if user_id:
        query = query.filter(ScanRecord.user_id == user_id)
    
    return query.order_by(ScanRecord.scan_date.desc()).offset(skip).limit(limit).all()

async def get_scan_record(db: Session, record_id: int) -> Optional[ScanRecord]:
    """
    获取扫描记录详情
    """
    return db.query(ScanRecord).filter(ScanRecord.id == record_id).first()

async def scan_file(
    db: Session,
    file_path: str,
    user_id: int,
    privacy_enabled: bool = True
) -> dict:
    """
    扫描文件，检测是否包含恶意软件
    """
    # 获取文件信息
    file_name = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)
    file_hash = calculate_file_hash(file_path)
    
    # 创建扫描记录
    record = await create_scan_record(
        db=db,
        user_id=user_id,
        file_name=file_name,
        file_hash=file_hash,
        file_size=file_size,
        privacy_enabled=privacy_enabled
    )
    
    # 更新状态为处理中
    await update_scan_status(db, record.id, "processing")
    
    try:
        # 获取恶意软件特征库
        known_threats = db.query(KnownThreat.hash).all()
        malware_signatures = [t[0] for t in known_threats]
        
        if privacy_enabled:
            # 使用PSI协议检测
            psi_wrapper = get_psi_wrapper()
            client_hashes = [file_hash]
            
            # 服务器预处理数据应从缓存或配置中获取
            server_preprocessed = settings.SERVER_PREPROCESSED
            
            # 执行PSI协议
            intersection, proof = psi_wrapper.client_query(client_hashes, server_preprocessed)
            
            # 构建结果
            is_malicious = len(intersection) > 0
            result = {
                "is_malicious": is_malicious,
                "matches": intersection,
                "privacy_proof": proof,
                "scan_method": "psi"
            }
        else:
            # 传统检测模式
            is_malicious = file_hash in malware_signatures
            
            # 构建结果
            result = {
                "is_malicious": is_malicious,
                "scan_method": "direct"
            }
            
            if is_malicious:
                # 获取威胁详情
                threat = db.query(KnownThreat).filter(KnownThreat.hash == file_hash).first()
                if threat:
                    result["threat_details"] = {
                        "type": threat.threat_type,
                        "severity": threat.severity,
                        "description": threat.description
                    }
        
        # 更新扫描结果
        await update_scan_result(db, record.id, result)
        return result
        
    except Exception as e:
        # 更新状态为失败
        await update_scan_status(db, record.id, "failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan failed: {str(e)}"
        )

async def get_scan_statistics(db: Session, user_id: int) -> dict:
    """
    获取用户的扫描统计数据
    
    Args:
        db: 数据库会话
        user_id: 用户ID
        
    Returns:
        包含各类统计数据的字典
    """
    # 总扫描次数 - 仅当前用户
    total_scans = db.query(ScanRecord).filter(ScanRecord.user_id == user_id).count()
    
    # 获取带有威胁检测结果的记录 - 仅当前用户
    scan_records = db.query(ScanRecord).filter(ScanRecord.user_id == user_id).all()
    
    # 初始化计数器
    clean_files = 0
    infected_files = 0
    suspicious_files = 0
    privacy_protected = 0
    
    # 遍历记录并计数
    for record in scan_records:
        # 隐私保护计数
        if record.privacy_enabled:
            privacy_protected += 1
            
        # 根据结果状态计数
        if record.result:
            # 尝试解析result字段，它可能是字符串或者已经是字典
            if isinstance(record.result, str):
                try:
                    result_dict = json.loads(record.result)
                except (json.JSONDecodeError, TypeError):
                    # 如果解析失败，假设是安全的
                    clean_files += 1
                    continue
            else:
                result_dict = record.result
            
            # 检查是否恶意
            is_malicious = result_dict.get('is_malicious', False)
            
            # 获取威胁详情
            threat_details = result_dict.get('threat_details', {})
            if isinstance(threat_details, str):
                try:
                    threat_details = json.loads(threat_details)
                except (json.JSONDecodeError, TypeError):
                    threat_details = {}
            
            severity = threat_details.get('severity', '')
            
            if is_malicious:
                if severity == 'high':
                    infected_files += 1
                else:
                    suspicious_files += 1
            else:
                clean_files += 1
        else:
            # 如果没有结果，假设是安全的
            clean_files += 1
    
    # 返回统计数据
    return {
        "totalScans": total_scans,
        "cleanFiles": clean_files,
        "infectedFiles": infected_files,
        "suspiciousFiles": suspicious_files,
        "privacyProtected": privacy_protected
    } 