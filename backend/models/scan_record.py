from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.models.base import Base

class ScanRecord(Base):
    """扫描记录模型
    
    用于存储文件扫描的详细信息和结果
    """
    __tablename__ = "scan_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_name = Column(String(255), nullable=False)
    file_hash = Column(String(64), nullable=False)
    file_size = Column(Integer, nullable=False)
    scan_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), nullable=False)  # pending, processing, completed, failed
    privacy_enabled = Column(Boolean, default=True)
    result = Column(JSON, nullable=True)
    
    # 关系定义
    user = relationship("User", back_populates="scan_records")
    
    def __repr__(self):
        return f"<ScanRecord {self.id} for file {self.file_name}>" 