# 数据库设计文档

本文档详细介绍基于UPSI的恶意文件检测系统的数据库设计和相关操作。

## 数据库概述

系统使用SQLite作为默认数据库，通过SQLAlchemy ORM进行数据管理。数据库主要存储用户信息、恶意软件特征和扫描记录。

## 数据库模型

### 主要实体关系

系统的数据库包含以下核心实体及其关系：

```
User(1) -- (N)ScanRecord
   |
   |
KnownThreat
```

### User 模型

用户表存储注册用户信息：

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    password = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    preferences = Column(JSON, nullable=True, default=dict)
    notification_settings = Column(JSON, nullable=True, default=dict)
    
    scan_records = relationship("ScanRecord", back_populates="user")
```

### KnownThreat 模型

已知恶意软件特征表：

```python
class KnownThreat(Base):
    __tablename__ = "known_threats"
    
    id = Column(Integer, primary_key=True, index=True)
    hash = Column(String(64), unique=True, nullable=False)
    threat_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    first_seen = Column(DateTime, nullable=False)
    last_seen = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
```

### ScanRecord 模型

扫描记录表存储用户文件扫描历史：

```python
class ScanRecord(Base):
    __tablename__ = "scan_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_name = Column(String(255), nullable=False)
    file_hash = Column(String(64), nullable=False)
    file_size = Column(Integer, nullable=False)
    scan_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), nullable=False)
    privacy_enabled = Column(Boolean, default=True)
    result = Column(JSON, nullable=True)
    
    user = relationship("User", back_populates="scan_records")
```

## 数据库初始化

系统提供了数据库初始化工具，用于创建表结构和添加初始数据。

### 初始化脚本

`tools/init_db.py`脚本负责数据库初始化：

```python
def initialize_database(force=False):
    """
    初始化数据库，创建表结构并添加初始数据
    
    Args:
        force (bool): 如果为True，会删除现有数据库并重新创建
    """
    if force and os.path.exists(DATABASE_PATH):
        os.remove(DATABASE_PATH)
    
    # 创建数据库目录
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    
    # 创建表
    Base.metadata.create_all(bind=engine)
    
    # 添加初始数据
    add_initial_data()
```

### 初始数据

初始化过程会添加以下数据：

#### 默认用户账户

```python
def add_default_users():
    """添加默认用户账户"""
    with SessionLocal() as db:
        # 检查admin用户是否已存在
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            # 创建管理员账户
            admin = User(
                username="admin",
                email="admin@example.com",
                name="Administrator",
                password_hash=get_password_hash("admin"),
                is_active=True
            )
            db.add(admin)
        
        # 检查测试用户是否已存在
        test_user = db.query(User).filter(User.username == "testuser").first()
        if not test_user:
            # 创建测试用户
            test_user = User(
                username="testuser",
                email="test@example.com",
                name="Test User",
                password_hash=get_password_hash("test123"),
                is_active=True
            )
            db.add(test_user)
        
        db.commit()
```

#### 初始恶意软件特征

```python
def add_known_threats():
    """添加初始恶意软件特征数据"""
    with SessionLocal() as db:
        # 添加样本恶意软件特征
        sample_threats = [
            {
                "hash": "e1d8c6e5f8e7d4c3b2a1098f7e6d5c4b3a2e1d0c9b8a7f6e5d4c3b2a1",
                "threat_type": "trojan",
                "severity": "high",
                "first_seen": datetime(2023, 1, 15),
                "last_seen": datetime(2023, 5, 20),
                "description": "Generic trojan that steals user credentials"
            },
            # 更多样本恶意软件特征...
        ]
        
        for threat in sample_threats:
            # 检查特征是否已存在
            existing = db.query(KnownThreat).filter(
                KnownThreat.hash == threat["hash"]
            ).first()
            
            if not existing:
                db.add(KnownThreat(**threat))
        
        db.commit()
```

## 数据库会话管理

系统使用依赖注入方式管理数据库会话：

```python
def get_db():
    """
    创建数据库会话并在使用后关闭
    用作FastAPI依赖项
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

在API路由中使用：

```python
@router.get("/users/me")
def get_current_user(db: Session = Depends(get_db), 
                     current_user: User = Depends(get_current_user)):
    return current_user
```

## 数据库查询优化

### 索引

为提高查询性能，系统在关键字段上创建了索引：

```python
# User表
id = Column(Integer, primary_key=True, index=True)
username = Column(String(50), unique=True, nullable=False, index=True)
email = Column(String(100), unique=True, nullable=False, index=True)

# KnownThreat表
id = Column(Integer, primary_key=True, index=True)
hash = Column(String(64), unique=True, nullable=False, index=True)

# ScanRecord表
id = Column(Integer, primary_key=True, index=True)
user_id = Column(Integer, ForeignKey("users.id"), index=True)
file_hash = Column(String(64), nullable=False, index=True)
```

### 优化策略

为提高数据库性能，系统实施了以下优化措施：

1. **惰性加载**：默认使用惰性加载减少不必要的查询
2. **选择性查询**：只查询需要的列以减少数据传输
3. **批量操作**：使用批量插入和更新来减少事务数量
4. **连接池**：使用连接池管理数据库连接

## 数据库维护

### 备份和恢复

`backend/scripts/db/backup.py`提供数据库备份功能：

```python
def backup_database(backup_path=None):
    """
    备份SQLite数据库
    
    Args:
        backup_path: 备份文件路径，默认为'data/backup/malware_detection_{timestamp}.db'
    """
    if not backup_path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = os.path.join(os.path.dirname(DATABASE_PATH), "backup")
        os.makedirs(backup_dir, exist_ok=True)
        backup_path = os.path.join(
            backup_dir, f"malware_detection_{timestamp}.db"
        )
    
    # 使用SQLite的备份API
    with sqlite3.connect(DATABASE_PATH) as conn:
        backup = sqlite3.connect(backup_path)
        conn.backup(backup)
        backup.close()
    
    print(f"Database backed up to {backup_path}")
    return backup_path
```

### 数据库优化

`backend/scripts/db/optimize.py`提供数据库优化功能：

```python
def optimize_database():
    """
    优化SQLite数据库性能
    - 执行VACUUM
    - 重建索引
    - 分析统计信息
    """
    with sqlite3.connect(DATABASE_PATH) as conn:
        # 启用外键约束
        conn.execute("PRAGMA foreign_keys = ON;")
        
        # 执行VACUUM整理数据库
        conn.execute("VACUUM;")
        
        # 重建索引
        conn.execute("REINDEX;")
        
        # 分析统计信息以优化查询计划
        conn.execute("ANALYZE;")
    
    print("Database optimization completed")
```

## 数据安全

### 密码存储

用户密码使用安全哈希算法存储，不保存明文：

```python
def get_password_hash(password: str) -> str:
    """
    生成密码哈希
    使用bcrypt算法
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码
    """
    return pwd_context.verify(plain_password, hashed_password)
```

### 敏感数据

系统不存储用户上传的原始文件，只存储安全哈希值和扫描结果：

```python
# 仅存储文件哈希和扫描结果，不保存原始文件内容
scan_record = ScanRecord(
    user_id=current_user.id,
    file_name=file.filename,
    file_hash=file_hash,
    file_size=file_size,
    scan_date=datetime.utcnow(),
    status="completed",
    privacy_enabled=privacy_enabled,
    result=result
)
```

## 数据库清理

系统支持定期清理过期数据，保持数据库性能：

```python
def cleanup_old_records(days_to_keep=90):
    """
    清理指定天数之前的扫描记录
    
    Args:
        days_to_keep: 保留多少天内的记录
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
    
    with SessionLocal() as db:
        # 查询要删除的记录
        old_records = db.query(ScanRecord).filter(
            ScanRecord.scan_date < cutoff_date
        ).all()
        
        print(f"Found {len(old_records)} old records to clean up")
        
        # 删除旧记录
        db.query(ScanRecord).filter(
            ScanRecord.scan_date < cutoff_date
        ).delete()
        
        db.commit()
    
    print(f"Cleaned up scan records older than {days_to_keep} days")
```

## 数据导入与导出

### 导入威胁数据

系统支持从CSV文件导入恶意软件特征：

```python
def import_threats_from_csv(csv_file_path):
    """
    从CSV文件导入恶意软件特征
    
    CSV格式：hash,threat_type,severity,first_seen,last_seen,description
    """
    with open(csv_file_path, 'r') as f:
        reader = csv.DictReader(f)
        threats = []
        
        for row in reader:
            # 转换日期字符串为datetime对象
            row['first_seen'] = datetime.strptime(row['first_seen'], '%Y-%m-%d')
            row['last_seen'] = datetime.strptime(row['last_seen'], '%Y-%m-%d')
            threats.append(row)
    
    with SessionLocal() as db:
        for threat in threats:
            # 检查是否已存在
            existing = db.query(KnownThreat).filter(
                KnownThreat.hash == threat['hash']
            ).first()
            
            if existing:
                # 更新现有记录
                for key, value in threat.items():
                    setattr(existing, key, value)
            else:
                # 添加新记录
                db.add(KnownThreat(**threat))
        
        db.commit()
    
    print(f"Imported {len(threats)} threats from {csv_file_path}")
```

### 导出扫描结果

系统支持将扫描结果导出为JSON或CSV格式：

```python
def export_scan_results(user_id, format='json', output_path=None):
    """
    导出用户的扫描结果
    
    Args:
        user_id: 用户ID
        format: 'json'或'csv'
        output_path: 输出文件路径，默认为当前目录
    """
    with SessionLocal() as db:
        records = db.query(ScanRecord).filter(
            ScanRecord.user_id == user_id
        ).all()
        
        # 转换为字典列表
        data = []
        for record in records:
            data.append({
                'id': record.id,
                'file_name': record.file_name,
                'file_hash': record.file_hash,
                'file_size': record.file_size,
                'scan_date': record.scan_date.isoformat(),
                'status': record.status,
                'result': record.result
            })
    
    if not output_path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = f"scan_results_{user_id}_{timestamp}.{format}"
    
    if format == 'json':
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
    elif format == 'csv':
        with open(output_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
    
    print(f"Exported {len(data)} scan results to {output_path}")
    return output_path
``` 