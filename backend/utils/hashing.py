import hashlib
import logging
from pathlib import Path
from fastapi import UploadFile
import shutil
import os
import aiofiles
from typing import List

logger = logging.getLogger(__name__)

async def calculate_file_hash_from_upload(upload_file: UploadFile) -> str:
    """计算上传文件的哈希值
    
    将上传文件的内容读取并计算SHA-256哈希
    
    Args:
        upload_file: FastAPI上传文件对象
        
    Returns:
        str: 文件的SHA-256哈希值
    """
    try:
        sha256 = hashlib.sha256()
        contents = await upload_file.read()
        sha256.update(contents)
        # 重置文件位置，以便后续操作可以重新读取
        await upload_file.seek(0)
        return sha256.hexdigest()
    except Exception as e:
        logger.error(f'上传文件哈希计算失败: {str(e)}')
        raise

def calculate_file_hash(file_path: str) -> str:
    """计算文件哈希值
    
    读取文件内容并计算SHA-256哈希
    
    Args:
        file_path: 文件路径
        
    Returns:
        str: 文件的SHA-256哈希值
    """
    try:
        with open(file_path, 'rb') as f:
            sha256 = hashlib.sha256()
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
            return sha256.hexdigest()
    except IOError as e:
        logger.error(f'文件哈希计算失败: {str(e)}')
        raise

def chunked_hash(file_path: str, chunk_size: int = 4096) -> List[str]:
    """文件分块哈希计算
    
    将文件分块并计算每块的SHA-256哈希
    
    Args:
        file_path: 文件路径
        chunk_size: 分块大小，默认4KB
        
    Returns:
        List[str]: 各块的SHA-256哈希值列表
    """
    hashes = []
    try:
        with open(file_path, 'rb') as f:
            while chunk := f.read(chunk_size):
                hashes.append(hashlib.sha256(chunk).hexdigest())
    except Exception as e:
        logger.error(f'分块哈希计算异常: {str(e)}')
        raise
    return hashes

async def save_uploaded_file(upload_file: UploadFile, destination: str) -> str:
    """保存上传文件
    
    将上传的文件保存到指定位置
    
    Args:
        upload_file: FastAPI上传文件对象
        destination: 目标路径
        
    Returns:
        str: 保存后的文件路径
    """
    try:
        # 确保目标目录存在
        os.makedirs(os.path.dirname(destination), exist_ok=True)
        
        # 异步保存文件
        async with aiofiles.open(destination, 'wb') as out_file:
            content = await upload_file.read()
            await out_file.write(content)
        
        return destination
    except Exception as e:
        logger.error(f'保存上传文件失败: {str(e)}')
        raise