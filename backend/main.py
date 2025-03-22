from fastapi import FastAPI, Depends, HTTPException, status
from backend.schemas.detection import DetectionRequest, DetectionResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv
from backend.psi_wrapper import get_psi_wrapper

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Privacy-Preserving Malware Detection API",
    description="API for detecting malware while preserving user privacy using PSI protocol",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 导入路由模块
from backend.routers.detection import router as detection_router
from backend.routers.auth import router as auth_router
from backend.routers.test import router as test_router

# 注册路由
app.include_router(detection_router)
app.include_router(auth_router)
app.include_router(test_router, prefix="/api/v1", tags=["test"])

# 获取PSI包装器
psi_wrapper = get_psi_wrapper()

# Mock malware database (in a real implementation, this would come from a database)
from backend.config import settings

# Preprocess the server's set using configuration
SERVER_PREPROCESSED = psi_wrapper.server_preprocess(settings.malware_signatures, settings.server_key)

# Routes
@app.get("/")
async def root():
    return {"message": "Privacy-Preserving Malware Detection API"}

@app.post("/api/v1/detect", response_model=DetectionResponse)
async def detect_malware(request: DetectionRequest):
    """
    Detect malware in the provided file hashes.
    
    If use_psi is True, the PSI protocol will be used to preserve privacy.
    Only malicious file hashes will be revealed to the server.
    """
    try:
        # Extract file hashes
        file_hashes = [file.hash for file in request.hashes]
        
        if request.use_psi:
            # Use PSI protocol
            intersection, proof = psi_wrapper.client_query(file_hashes, SERVER_PREPROCESSED)
            
            return DetectionResponse(
                malicious_hashes=intersection,
                proof=proof
            )
        else:
            # Traditional approach - check each hash against the database
            malicious_hashes = [h for h in file_hashes if h in settings.malware_signatures]
            
            return DetectionResponse(
                malicious_hashes=malicious_hashes,
                proof=None
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during malware detection: {str(e)}"
        )

if __name__ == "__main__":
    # Run the API server
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)