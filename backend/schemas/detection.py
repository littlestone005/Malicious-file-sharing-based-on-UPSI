from pydantic import BaseModel
from typing import List, Optional

class FileHash(BaseModel):
    hash: str

class DetectionRequest(BaseModel):
    hashes: List[FileHash]
    use_psi: bool

class DetectionResponse(BaseModel):
    malicious_hashes: List[str]
    proof: Optional[str] = None