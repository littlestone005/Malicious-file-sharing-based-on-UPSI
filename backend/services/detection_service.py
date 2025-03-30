from typing import List, Optional
from fastapi import HTTPException
from datetime import datetime
from backend.schemas.detection import DetectionRequest, DetectionResponse
from backend.psi_wrapper import get_psi_wrapper
from backend.core.config import settings
from sqlalchemy.orm import Session
from backend.models.known_threat import KnownThreat
import os
import logging

async def detect_malware(hashes: list, use_psi: bool) -> DetectionResponse:
    psi = get_psi_wrapper()
    
    if use_psi:
        # 模拟PSI协议交互
        intersection, proof = psi.client_query(hashes, "simulated_preprocessed_data")
        return DetectionResponse(
            malicious_hashes=intersection,
            proof=proof
        )
    else:
        # 传统检测模式
        malicious_hashes = [h for h in hashes if h.startswith('malicious_')]
        return DetectionResponse(
            malicious_hashes=malicious_hashes,
            proof=None
        )

async def analyze_hashes(request: DetectionRequest):
    try:
        psi_wrapper = get_psi_wrapper()
        file_hashes = [file.hash for file in request.hashes]

        if request.use_psi:
            # PSI协议处理
            intersection, proof = psi_wrapper.client_query(
                file_hashes, 
                settings.SERVER_PREPROCESSED
            )
            return DetectionResponse(
                malicious_hashes=intersection,
                proof=proof
            )
        else:
            # 传统哈希比对
            # 分块哈希比对
            hashes_set = set(settings.MALWARE_SIGNATURES)
            malicious_hashes = [h for h in file_hashes if h in hashes_set]

            # 缓存匹配结果（实际生产环境应使用Redis）
            matched_cache = {h: True for h in malicious_hashes}

            # 记录检测统计信息（需补充日志实现）
            detection_stats = {
                'total_hashes': len(file_hashes),
                'matched_count': len(malicious_hashes),
                'timestamp': datetime.utcnow().isoformat()
            }
            return DetectionResponse(
                malicious_hashes=malicious_hashes,
                proof=None
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Detection error: {str(e)}"
        )

async def add_malware_sample(
    db: Session, 
    file_path: str,
    threat_type: str,
    severity: str,
    description: str = None
) -> KnownThreat:
    """
    将文件添加为已知威胁样本
    
    Args:
        db: 数据库会话
        file_path: 文件路径
        threat_type: 威胁类型
        severity: 威胁级别 (low, medium, high, critical)
        description: 威胁描述
        
    Returns:
        创建的KnownThreat对象
    """
    from backend.utils.hashing import calculate_file_hash
    from datetime import datetime
    
    logger = logging.getLogger(__name__)
    logger.info(f"尝试将文件添加为恶意软件样本: {file_path}")
    
    # 确保文件存在
    if not os.path.exists(file_path):
        error_msg = f"文件不存在: {file_path}"
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    try:
        # 计算文件哈希值
        logger.info(f"计算文件哈希值: {file_path}")
        file_hash = calculate_file_hash(file_path)
        logger.info(f"文件哈希值: {file_hash}")
        
        # 检查哈希值是否已存在
        logger.info(f"检查哈希值是否已存在: {file_hash}")
        existing = db.query(KnownThreat).filter(KnownThreat.hash == file_hash).first()
        if existing:
            logger.info(f"哈希值已存在: {file_hash}, 返回现有记录")
            return existing
        
        # 创建新的威胁记录
        logger.info(f"创建新的威胁记录: {threat_type}, {severity}")
        now = datetime.utcnow()
        threat = KnownThreat(
            hash=file_hash,
            threat_type=threat_type,
            severity=severity,
            first_seen=now,
            last_seen=now,
            description=description
        )
        
        db.add(threat)
        db.commit()
        db.refresh(threat)
        logger.info(f"威胁记录已创建: ID={threat.id}, 哈希值={threat.hash}")
        
        return threat
    except Exception as e:
        db.rollback()
        logger.error(f"添加恶意软件样本失败: {str(e)}")
        raise