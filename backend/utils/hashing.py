import hashlib
import logging
from pathlib import Path
from fastapi import UploadFile
import shutil
import os
import aiofiles
from typing import List

logger = logging.getLogger(__name__)

async def calculate_upload_file_hash(file: UploadFile) -> str:
    """
    计算上传文件的SHA-256哈希值
    
    将上传的文件内容读取到内存中并计算其哈希值
    对于大文件，应改进此函数以分块读取
    
    Args:
        file: FastAPI上传文件对象
        
    Returns:
        文件的SHA-256哈希值（十六进制字符串）
    """
    content = await file.read()
    # 将文件指针重置到开始位置，以便后续操作可以再次读取
    await file.seek(0)
    
    # 计算SHA-256哈希值
    file_hash = hashlib.sha256(content).hexdigest()
    return file_hash

def calculate_file_hash(file_path: str) -> str:
    """
    计算文件的SHA-256哈希值
    
    读取文件并计算其哈希值，适用于本地文件
    
    Args:
        file_path: 文件路径
        
    Returns:
        文件的SHA-256哈希值（十六进制字符串）
    """
    # 创建哈希对象
    hasher = hashlib.sha256()
    
    # 分块读取文件并更新哈希值
    with open(file_path, 'rb') as f:
        # 每次读取1MB
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            hasher.update(chunk)
    
    # 返回十六进制哈希值
    return hasher.hexdigest()

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