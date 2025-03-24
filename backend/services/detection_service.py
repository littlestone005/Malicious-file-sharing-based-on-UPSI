from typing import List, Optional
from fastapi import HTTPException
from datetime import datetime
from backend.schemas.detection import DetectionRequest, DetectionResponse
from backend.psi_wrapper import get_psi_wrapper
from backend.core.config import settings

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