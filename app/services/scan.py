from fastapi import HTTPException
import hashlib
from typing import Optional
from sqlalchemy.orm import Session
from app.models.scan import ScanRecord
import json
#这是一个扫描服务类，用于处理文件扫描记录的创建。
class ScanService:
    def __init__(self, db: Session):
        # 初始化时接收数据库会话
        self.db = db

    async def create_scan(self, user_id: int, file_data: bytes, filename: str) -> dict:
        """
        创建新的扫描记录
        
        参数:
        - user_id: 用户ID
        - file_data: 文件的二进制数据
        - filename: 文件名
        """
        try:
            # 1. 计算文件的SHA256哈希值（用于文件唯一标识）
            file_hash = hashlib.sha256(file_data).hexdigest()
            
            # 2. 创建扫描记录
            scan_record = ScanRecord(
                user_id=user_id,          # 记录是谁上传的
                file_name=filename,        # 文件名
                file_hash=file_hash,       # 文件哈希值
                file_size=len(file_data),  # 文件大小
                status="pending"           # 初始状态为待处理
            )
            
            # 3. 保存到数据库
            self.db.add(scan_record)       # 添加记录
            self.db.commit()               # 提交事务
            self.db.refresh(scan_record)   # 刷新记录（获取数据库生成的ID）
            
            # 4. 返回扫描信息
            return {
                "scan_id": scan_record.id,
                "status": "pending",
                "file_hash": file_hash
            }
            
        except Exception as e:
            # 如果出错，回滚事务并抛出异常
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e)) 