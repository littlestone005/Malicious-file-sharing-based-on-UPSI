from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from backend.models.base import Base

class KnownThreat(Base):
    """已知威胁模型
    
    用于存储已知的恶意软件特征
    """
    __tablename__ = "known_threats"
    
    id = Column(Integer, primary_key=True, index=True)
    hash = Column(String(64), unique=True, nullable=False)
    threat_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    first_seen = Column(DateTime, nullable=False)
    last_seen = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<KnownThreat {self.threat_type} ({self.severity})>" 