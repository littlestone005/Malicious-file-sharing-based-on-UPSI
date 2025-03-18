from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON
from datetime import datetime
from app.db.session import Base

class ScanRecord(Base):#是一个数据库表的模型（Model）定义
    """扫描记录模型
    
    用于存储文件扫描的详细信息和结果
    继承自SQLAlchemy的声明性基类Base
    """
    __tablename__ = "scan_records"  # 数据库表名
    
    # ID字段：记录的唯一标识符
    id = Column(
        Integer,                    # 整数类型
        primary_key=True,          # 设置为主键
        index=True                 # 创建索引以提高查询性能
    )
    
    # 用户ID字段：关联到用户表
    user_id = Column(
        Integer,                    # 整数类型
        ForeignKey("users.id")      # 外键，关联到users表的id字段
    )
    
    # 文件名字段：存储被扫描文件的名称
    file_name = Column(
        String(255),                # 字符串类型，最大长度255
        nullable=False              # 不允许为空
    )
    
    # 文件哈希值字段：存储文件的唯一标识符
    file_hash = Column(
        String(64),                 # 字符串类型，长度64（适用于SHA-256哈希）
        nullable=False              # 不允许为空
    )
    
    # 文件大小字段：存储文件的字节大小
    file_size = Column(
        Integer,                    # 整数类型
        nullable=False              # 不允许为空
    )
    
    # 扫描时间字段：记录扫描开始的时间
    scan_date = Column(
        DateTime,                   # 日期时间类型
        default=datetime.utcnow     # 默认值为当前UTC时间
    )
    
    # 扫描状态字段：记录当前扫描的状态
    status = Column(
        String(20),                 # 字符串类型，最大长度20
        nullable=False              # 不允许为空
        # 可能的值：pending, processing, completed, failed
    )
    
    # 隐私保护标志：指示是否启用隐私保护
    privacy_enabled = Column(
        Boolean,                    # 布尔类型
        default=True               # 默认值为True，即默认启用隐私保护
    )
    
    # 扫描结果字段：存储详细的扫描结果
    result = Column(
        JSON                        # JSON类型，可存储复杂的结构化数据
        # 例如：
        # {
        #     "threats_found": ["virus1", "malware2"],
        #     "risk_level": "high",
        #     "scan_duration": 120
        # }
    ) 