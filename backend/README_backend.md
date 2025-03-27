# 基于UPSI的恶意文件检测系统 - 后端

FastAPI实现的后端服务，处理用户认证、文件上传和恶意软件检测。

## 目录结构

```
backend/
├── core/                 # 核心功能模块
│   ├── config.py         # 配置管理
│   └── security.py       # 安全功能
├── database/             # 数据库相关
│   ├── init_db.py        # 数据库初始化
│   ├── session.py        # 数据库会话
│   └── base.py           # 数据库基础模型
├── models/              # 数据模型
│   ├── base.py          # 模型基类
│   ├── user.py          # 用户模型
│   ├── known_threat.py  # 恶意软件模型
│   └── scan_record.py   # 扫描记录模型 
├── routers/            # 路由处理器
│   ├── detection.py     # 检测相关路由
│   ├── auth.py          # 认证相关路由
│   ├── user.py          # 用户相关路由
│   └── scan.py          # 扫描相关路由 
├── schemas/           # 数据验证模式
│   ├── user.py         # 用户数据验证
│   ├── detection.py    # 检测数据验证
│   └── scan.py         # 扫描数据验证
├── services/          # 业务逻辑服务
│   ├── detection_service.py  # 检测服务
│   ├── user_service.py       # 用户服务
│   └── scan_service.py       # 扫描服务
├── utils/            # 工具函数
│   ├── hashing.py     # 哈希计算
│   └── logging.py     # 日志工具
├── middleware/       # 中间件
│   ├── auth.py        # 认证中间件
│   └── rate_limit.py  # 速率限制
├── scripts/          # 辅助脚本
│   ├── view_db_for_test.py    # 数据库查看工具（测试用）
│   └── optimize_db.py         # 数据库优化脚本
├── tests/            # 单元测试
├── tests_for_demo_renamed/  # 演示用测试案例
├── scripts_for_test/  # 测试专用脚本
├── uploads/         # 上传文件目录
│   ├── scans/       # 扫描文件目录
│   └── temp/        # 临时文件目录
├── logs/            # 日志目录
├── main.py          # 应用入口
├── psi_wrapper.py   # PSI协议包装器
└── requirements.txt # 依赖项
```

## 目录结构重构说明

为了使代码组织更加清晰，我们对后端项目的目录结构进行了重构：

### 脚本文件重构

```
backend/
├── scripts/             # 脚本目录(生产环境可用)
│   ├── db/              # 数据库相关脚本
│   │   ├── optimize_db.py        # 数据库优化脚本
│   │   └── update_db_schema.py   # 数据库架构更新脚本
│   ├── maintenance/     # 系统维护脚本
│   │   └── update_admin_password.py  # 更新管理员密码脚本
│   └── deployment/      # 部署相关脚本
│       └── prepare_environment.py    # 环境准备脚本
│
├── tools/               # 开发/测试工具(仅开发环境使用)
│   ├── db/              # 数据库工具
│   │   ├── view_db.py              # 数据库查看工具
│   │   └── test_db.db              # 测试数据库
│   └── sandbox/         # 测试和实验脚本
│       └── create_test_data.py     # 测试数据生成工具
```

### 测试文件重构

```
backend/
├── tests/               # 单元测试和集成测试
│   ├── unit/            # 单元测试
│   │   ├── models/      # 模型单元测试
│   │   ├── services/    # 服务单元测试
│   │   └── utils/       # 工具函数单元测试
│   ├── integration/     # 集成测试
│   │   └── routers/     # API路由集成测试
│   ├── fixtures/        # 测试固件
│   │   └── test_data.py  # 测试数据生成器
│   └── conftest.py      # pytest配置
│
└── examples/            # 使用示例和演示代码
    ├── api_usage/       # API使用示例
    └── sample_apps/     # 示例应用程序
```

### 重构原则

1. **职责划分**：明确区分生产脚本(`scripts/`)和开发工具(`tools/`)
2. **环境隔离**：测试代码(`tests/`)与示例代码(`examples/`)分离
3. **结构一致**：保持每个目录内部结构的一致性
4. **命名规范**：避免使用`_for_test`等后缀，而是通过目录结构表达用途

### 重构变更说明

| 旧路径 | 新路径 | 说明 |
|-------|-------|------|
| `scripts/optimize_db.py` | `scripts/db/optimize_db.py` | 归类到数据库脚本 |
| `scripts/view_db_for_test.py` | `tools/db/view_db.py` | 移至开发工具 |
| `scripts_for_test/db/test.db` | `tools/db/test_db.db` | 移至开发工具，规范命名 |
| `scripts_for_test/db/create_and_view_db.py` | `tools/db/create_test_db.py` | 功能明确化 |
| `tests_for_demo_renamed/` | `examples/` | 清晰表明示例代码性质 |

## 安装与设置

### 环境要求

- Python 3.9+
- SQLite/PostgreSQL

### 安装依赖

```bash
pip install -r requirements.txt
```

### 配置

主要配置项在`.env`文件和`core/config.py`中。重要配置：

- `DATABASE_URL`: 数据库连接字符串
- `SECRET_KEY`: JWT加密密钥
- `SERVER_HOST`和`SERVER_PORT`: 服务器主机和端口

### 数据库初始化

数据库会在首次启动时自动创建和初始化。

## 启动服务器

```bash
# 开发环境
python -m backend.main

# 生产环境
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## 数据库结构

### 数据模型

系统使用SQLAlchemy ORM管理以下数据模型：

#### User 模型

用户信息存储：

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
```

#### KnownThreat 模型

已知恶意软件特征：

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

#### ScanRecord 模型

扫描记录：

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
```

### 数据库会话管理

使用SQLAlchemy的会话来管理数据库连接，在`database/session.py`中定义：

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session, Session
from sqlalchemy.pool import QueuePool

from backend.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=10,
    pool_recycle=3600,
    pool_pre_ping=True
)
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 数据库初始化和迁移

- `database/init_db.py`: 填充初始数据（管理员用户和已知恶意软件特征）
- 使用Alembic进行数据库版本控制和迁移管理，迁移脚本位于`migrations/versions/`目录

## 数据库优化策略

### 索引优化

为提高查询性能，系统在以下字段上建立了索引：

- `users.username` 和 `users.email`: 加速用户登录查询
- `known_threats.hash`: 加速恶意软件检测
- `scan_records.user_id` 和 `scan_records.file_hash`: 加速扫描记录查询

### 查询优化

- 使用SQLAlchemy的延迟加载（lazy-loading）减少不必要的数据获取
- 针对频繁查询的数据实现缓存机制
- 使用批量操作处理大量记录

### 连接池管理

使用SQLAlchemy的连接池功能管理数据库连接：

```python
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_recycle=3600,
    pool_pre_ping=True
)
```

### 优化脚本

数据库优化脚本`scripts/optimize_db.py`支持以下操作：

```bash
# 清理30天前的记录并执行VACUUM压缩
python scripts/optimize_db.py --clean-days 30 --vacuum

# 重建索引并分析表
python scripts/optimize_db.py --rebuild-index --analyze

# 执行所有优化
python scripts/optimize_db.py --all
```

## API路由

### 认证
- `POST /api/v1/auth/token`: 用户登录
- `POST /api/v1/auth/register`: 用户注册

### 用户
- `GET /api/v1/users/me`: 获取当前用户信息
- `PUT /api/v1/users/me`: 更新当前用户信息

### 扫描
- `POST /api/v1/scans/upload`: 上传并扫描文件
- `GET /api/v1/scans`: 获取扫描记录列表
- `GET /api/v1/scans/{scan_id}`: 获取扫描详情

### 检测
- `POST /api/v1/detection/scan`: 检测文件哈希

## 开发指南

### 添加新路由

1. 在`routers/`目录中创建路由文件
2. 在`main.py`中注册路由
3. 在`schemas/`中定义请求和响应模型
4. 在`services/`中实现业务逻辑

### 运行测试

```bash
pytest
```

## 测试和演示功能

- **数据库查看工具**: `scripts/view_db_for_test.py` - 用于测试和演示查看数据库内容
  ```bash
  python scripts/view_db_for_test.py
  ```

- **演示测试目录**: `tests_for_demo_renamed/` - 包含用于功能演示的测试案例
  
- **测试脚本目录**: `scripts_for_test/` - 包含专用于测试的辅助脚本

- **默认管理员账号**: 用户名 `admin`, 密码 `admin` - 用于测试和演示系统功能 