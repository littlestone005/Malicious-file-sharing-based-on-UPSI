from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from pydantic import BaseModel
from typing import List, Optional
from backend.services.detection_service import analyze_hashes, detect_malware
from backend.schemas.detection import DetectionRequest, DetectionResponse
from backend.utils.hashing import calculate_file_hash

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
    file_hash = await calculate_file_hash(file)
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