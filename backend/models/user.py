from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.models.base import Base

class User(Base):
    """用户模型
    
    用于存储系统用户基本信息
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    name = Column(String(100), nullable=True)  # 用户姓名
    phone = Column(String(20), nullable=True)  # 用户手机号
    password = Column(String(255), nullable=False)  # 明文密码，仅用于展示
    password_hash = Column(String(255), nullable=False)  # 哈希密码，用于认证
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    preferences = Column(JSON, nullable=True, default=dict)  # 用户偏好设置，如界面语言
    notification_settings = Column(JSON, nullable=True, default=dict)  # 通知设置
    
    # 关系定义
    scan_records = relationship("ScanRecord", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.username}>" 