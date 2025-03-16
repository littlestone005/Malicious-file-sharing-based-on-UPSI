from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv
from psi_wrapper import get_psi_wrapper

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

# Models
class FileHash(BaseModel):
    fileName: str
    fileSize: int
    fileType: str
    hash: str

class DetectionRequest(BaseModel):
    client_id: Optional[str] = None
    hashes: List[FileHash]
    use_psi: bool = True

class DetectionResponse(BaseModel):
    malicious_hashes: List[str]
    proof: Optional[str] = None

# Get PSI wrapper
psi_wrapper = get_psi_wrapper()

# Server's secret key (in a real implementation, this would be securely stored)
SERVER_KEY = "server_secret_key"

# Mock malware database (in a real implementation, this would come from a database)
MALWARE_SIGNATURES = [
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    "3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278",
    "8c3d4a0f94b252c7859a96fd69a5711b5a4e599afc857c8b4f414b3fb6a095b9",
    "2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3",
    "19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7",
    "4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5",
    "4fc82b26aecb47d2868c4efbe3581732a3e7cbcc6c2efb32062c08170a05eeb8",
    "6b23c0d5f35d1b11f9b683f0b0a617355deb11277d91ae091d399c655b87940d",
    "3f39d5c348e5b79d06e842c114e6cc571583bbf44e4b0ebfda1a01ec05745d43",
]

# Preprocess the server's set (in a real implementation, this would be done once and cached)
SERVER_PREPROCESSED = psi_wrapper.server_preprocess(MALWARE_SIGNATURES, SERVER_KEY)

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
            malicious_hashes = [h for h in file_hashes if h in MALWARE_SIGNATURES]
            
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