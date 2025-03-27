# 数据库设计与优化文档

本文档详细说明了项目使用的数据库设计、表结构、关系以及性能优化策略。

## 数据库概述

系统默认使用SQLite数据库，同时支持PostgreSQL数据库用于生产环境。数据库存储用户信息、恶意软件特征和扫描记录等数据。

### 主要数据库文件
- `malware_detection.db` - 主SQLite数据库文件（运行时自动生成）
- `backend/scripts_for_test/db/test.db` - 测试数据库文件（仅用于测试）

### 数据库配置
数据库连接配置在`backend/core/config.py`中设置，主要配置项包括：

```python
# SQLite配置（默认）
DATABASE_URL = "sqlite:///./malware_detection.db"

# PostgreSQL配置（可选）
# DATABASE_URL = "postgresql://user:password@localhost:5432/malware_detection"

# 数据库连接池配置
DB_POOL_SIZE = 20
DB_POOL_MAX_OVERFLOW = 10
DB_POOL_TIMEOUT = 30
DB_POOL_RECYCLE = 1800  # 30分钟
```

## 数据库模型

系统使用SQLAlchemy ORM管理以下主要表：

### 1. 用户表 (users)

存储用户信息和认证数据：

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # 关系：一个用户可以有多个扫描记录
    scan_records = relationship("ScanRecord", back_populates="user")
```

### 2. 已知威胁表 (known_threats)

存储恶意软件特征：

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

### 3. 扫描记录表 (scan_records)

存储扫描历史：

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
    
    # 关系：多个扫描记录可以关联到一个用户
    user = relationship("User", back_populates="scan_records")
```

## 表关系

系统数据表之间的关系：

1. **用户-扫描记录**：一对多关系
   - 一个用户可以创建多个扫描记录
   - 扫描记录通过`user_id`外键关联到用户

2. **扫描记录-已知威胁**：间接关联
   - 扫描结果（`result`字段）中以JSON格式存储匹配的威胁哈希值
   - 前端可通过这些哈希值查询已知威胁表获取详细信息

## 数据库索引

为提高查询性能，系统在以下字段上建立了索引：

### 现有索引

```
users:
- id (primary key, index)
- username (unique, index)
- email (unique, index)

known_threats:
- id (primary key, index)
- hash (unique, index)
- threat_type (index)

scan_records:
- id (primary key, index)
- user_id (index, foreign key)
- file_hash (index)
- scan_date (index)
```

### 索引创建迁移

这些索引通过Alembic迁移脚本`migrations/versions/1683a1b4c2d5_add_performance_indexes.py`创建：

```python
def upgrade():
    # 为用户表添加索引
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # 为已知恶意软件特征表添加索引
    op.create_index(op.f('ix_known_threats_hash'), 'known_threats', ['hash'], unique=True)
    op.create_index(op.f('ix_known_threats_threat_type'), 'known_threats', ['threat_type'], unique=False)
    
    # 为扫描记录表添加索引
    op.create_index(op.f('ix_scan_records_user_id'), 'scan_records', ['user_id'], unique=False)
    op.create_index(op.f('ix_scan_records_file_hash'), 'scan_records', ['file_hash'], unique=False)
    op.create_index(op.f('ix_scan_records_scan_date'), 'scan_records', ['scan_date'], unique=False)
```

## 数据库性能优化

系统实现了多种数据库性能优化策略：

### 1. 连接池管理

使用SQLAlchemy的连接池功能优化数据库连接，在`database/session.py`中配置：

```python
# SQLite连接配置
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # 允许多线程
    poolclass=QueuePool,                        # 使用队列池
    pool_size=10,                              # 连接池大小
    max_overflow=20,                           # 最大溢出连接数
    pool_recycle=3600,                         # 连接回收时间(1小时)
    pool_pre_ping=True,                        # 连接前检查
)
```

### 2. SQLite优化

针对SQLite数据库的特定优化：

```python
@event.listens_for(engine, "connect")
def optimize_sqlite_connection(dbapi_connection, connection_record):
    """配置SQLite连接参数以优化性能"""
    # 启用WAL模式提高并发性能
    dbapi_connection.execute("PRAGMA journal_mode=WAL")
    # 启用外键约束
    dbapi_connection.execute("PRAGMA foreign_keys=ON")
    # 设置同步模式为NORMAL，平衡安全和性能
    dbapi_connection.execute("PRAGMA synchronous=NORMAL")
    # 设置缓存大小（以页为单位）
    dbapi_connection.execute("PRAGMA cache_size=-10000")  # 约10MB缓存
    # 设置临时存储位置为内存
    dbapi_connection.execute("PRAGMA temp_store=MEMORY")
    # 设置页大小为4KB
    dbapi_connection.execute("PRAGMA page_size=4096")
    # 启用内存映射，提高I/O性能
    dbapi_connection.execute("PRAGMA mmap_size=30000000")  # 约30MB映射
```

### 3. 查询性能监控

记录慢查询和统计查询执行时间：

```python
@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """记录SQL执行开始时间"""
    conn.info.setdefault('query_start_time', []).append(time.time())

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """记录SQL执行时间并打印慢查询"""
    total_time = time.time() - conn.info['query_start_time'].pop()
    if total_time > settings.SLOW_QUERY_THRESHOLD:
        logger.warning(
            f"慢查询(用时{total_time:.2f}秒): {statement}\n参数: {parameters}"
        )
```

### 4. 查询优化策略

1. **延迟加载**：默认使用SQL Alchemy的延迟加载，减少不必要的数据获取
   ```python
   # 示例：只有访问user属性时才加载用户数据
   scan_record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
   # 这里不会加载user数据
   # 只有访问user属性时才会查询用户表
   user = scan_record.user  
   ```

2. **预加载相关数据**：对于已知会使用关联数据的查询，使用joinedload减少查询次数
   ```python
   # 示例：一次性加载用户及其扫描记录
   user_with_scans = db.query(User).options(
       joinedload(User.scan_records)
   ).filter(User.id == user_id).first()
   ```

3. **分页查询**：处理大量记录时使用分页查询，避免一次加载过多数据
   ```python
   # 示例：分页查询扫描记录
   page = 1
   page_size = 20
   records = db.query(ScanRecord).filter(
       ScanRecord.user_id == user_id
   ).order_by(
       ScanRecord.scan_date.desc()
   ).offset((page - 1) * page_size).limit(page_size).all()
   ```

4. **批量操作**：对于大量数据写入使用批量操作
   ```python
   # 示例：批量插入已知威胁
   db.bulk_save_objects([
       KnownThreat(hash=hash1, threat_type="Trojan", ...),
       KnownThreat(hash=hash2, threat_type="Ransomware", ...)
   ])
   db.commit()
   ```

## 数据库维护工具

系统提供了以下数据库维护和优化工具：

### 1. 数据库优化脚本 - optimize_db.py

```bash
# 清理30天前的记录并执行VACUUM压缩
python backend/scripts/optimize_db.py --clean-days 30 --vacuum

# 重建索引并分析表
python backend/scripts/optimize_db.py --rebuild-index --analyze

# 执行所有优化
python backend/scripts/optimize_db.py --all
```

### 2. 数据库查看工具 - view_db_for_test.py（仅用于测试）

用于查看数据库内容，显示表结构和数据，仅用于测试和开发环境。

```bash
python backend/scripts_for_test/db/view_db_for_test.py
```

### 3. 数据库初始化 - init_db.py

在`backend/database/init_db.py`中实现，用于初始化数据库并填充初始数据：

```python
def init_db(db: Session) -> None:
    """初始化数据库，添加默认用户和恶意软件特征"""
    # 检查是否已有用户
    user = db.query(User).first()
    if user:
        return
    
    # 创建管理员用户
    hashed_password = get_password_hash("admin")
    admin_user = User(
        username="admin",
        email="admin@example.com",
        password_hash=hashed_password,
        is_active=True
    )
    db.add(admin_user)
    
    # 添加已知恶意软件特征...
```

## 数据库迁移管理

系统使用Alembic管理数据库架构迁移。迁移脚本位于`migrations/versions/`目录。

### 创建新迁移

```bash
# 自动生成迁移脚本
alembic revision --autogenerate -m "描述迁移内容"

# 手动创建迁移脚本
alembic revision -m "描述迁移内容"
```

### 应用迁移

```bash
# 应用所有迁移
alembic upgrade head

# 应用特定版本
alembic upgrade <revision_id>
```

### 回滚迁移

```bash
# 回滚到上一版本
alembic downgrade -1

# 回滚到特定版本
alembic downgrade <revision_id>
```

## 数据库安全性

系统实现了以下数据库安全措施：

1. **密码哈希存储**：用户密码使用bcrypt算法哈希后存储
2. **参数化查询**：所有查询使用ORM或参数化方式执行，防止SQL注入
3. **最小权限原则**：应用程序使用有限权限数据库账户
4. **敏感数据加密**：某些敏感数据字段在存储前进行加密

## 备份策略

推荐的数据库备份策略：

1. **定期完整备份**：每天对整个数据库进行完整备份
   ```bash
   # SQLite
   sqlite3 malware_detection.db ".backup backup_$(date +%Y%m%d).db"
   
   # PostgreSQL
   pg_dump -U username -d malware_detection > backup_$(date +%Y%m%d).sql
   ```

2. **增量备份**：使用WAL（预写日志）文件进行增量备份
3. **备份验证**：定期测试备份的完整性和可恢复性

## 未来优化计划

计划中的数据库优化：

1. **分表策略**：针对`scan_records`表考虑按时间段分表
2. **缓存层**：添加Redis缓存层，优化频繁查询（如用户信息、热门威胁）
3. **读写分离**：在高负载场景下实现读写分离架构
4. **时序数据优化**：针对时间序列数据（如扫描历史）的特殊优化

---

**注意**：数据库设计和优化策略可能随项目发展而调整。建议定期参考本文档最新版本了解当前数据库架构。 