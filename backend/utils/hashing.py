import hashlib
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def calculate_file_hash(file_path: str) -> str:
    try:
        with open(file_path, 'rb') as f:
            sha256 = hashlib.sha256()
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
            return sha256.hexdigest()
    except IOError as e:
        logger.error(f'文件哈希计算失败: {str(e)}')
        raise

# 文件分块哈希计算
def chunked_hash(file_path: str, chunk_size: int = 4096) -> list[str]:
    hashes = []
    try:
        with open(file_path, 'rb') as f:
            while chunk := f.read(chunk_size):
                hashes.append(hashlib.sha256(chunk).hexdigest())
    except Exception as e:
        logger.error(f'分块哈希计算异常: {str(e)}')
        raise
    return hashes