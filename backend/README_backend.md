# 基于UPSI的恶意文件检测系统 - 后端

FastAPI实现的后端服务，处理用户认证、文件上传和恶意软件检测。

## 目录结构

```
backend/
├── core/                 # 核心功能模块
│   ├── config.py         # 配置管理
│   └── security.py       # 安全功能
├── database/             # 数据库相关
│   ├── session.py        # 数据库会话
│   └── upgrade_db.py     # 数据库升级脚本
├── models/               # 数据模型
│   ├── base.py           # 模型基类
│   ├── user.py           # 用户模型
│   ├── known_threat.py   # 恶意软件模型
│   └── scan_record.py    # 扫描记录模型 
├── routers/              # 路由处理器
│   ├── detection.py      # 检测相关路由
│   ├── auth.py           # 认证相关路由
│   ├── user.py           # 用户相关路由
│   └── scan.py           # 扫描相关路由 
├── schemas/              # 数据验证模式
│   ├── user.py           # 用户数据验证
│   ├── detection.py      # 检测数据验证
│   └── scan.py           # 扫描数据验证
├── services/             # 业务逻辑服务
│   ├── detection_service.py  # 检测服务
│   ├── user_service.py       # 用户服务
│   └── scan_service.py       # 扫描服务
├── utils/                # 工具函数
│   ├── hashing.py        # 哈希计算
│   └── logging.py        # 日志工具
├── middleware/           # 中间件
│   └── auth.py           # 认证中间件
├── scripts/              # 辅助脚本
│   └── db/               # 数据库脚本
├── tests/                # 测试案例
├── uploads/              # 上传文件目录
├── logs/                 # 日志目录
├── main.py               # 应用入口
├── psi_wrapper.py        # PSI协议包装器
└── requirements.txt      # 依赖项
```

## 安装与设置

### 环境要求

- Python 3.9+
- SQLite 数据库

### 安装依赖

```bash
pip install -r requirements.txt
```

### 配置

主要配置项在`.env`文件和`core/config.py`中。重要配置：

- `DATABASE_URL`: 数据库连接字符串
- `SECRET_KEY`: JWT加密密钥
- `SERVER_HOST`和`SERVER_PORT`: 服务器主机和端口

## 启动服务器

```bash
# 本地开发环境
python -m backend.main
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
    name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    password = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    preferences = Column(JSON, nullable=True, default=dict)
    notification_settings = Column(JSON, nullable=True, default=dict)
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

## API 接口

### 认证接口

- `POST /api/v1/auth/register`: 用户注册
- `POST /api/v1/auth/login`: 用户登录（JSON格式）
- `POST /api/v1/auth/token`: 用户登录（表单格式）

### 用户接口

- `GET /api/v1/users/me`: 获取当前用户信息
- `PUT /api/v1/users/me`: 更新当前用户信息

### 文件扫描接口

- `POST /api/v1/detection/scan`: 上传并扫描文件
- `GET /api/v1/detection/result/{scan_id}`: 获取扫描结果
- `GET /api/v1/scan/history`: 获取用户的扫描历史

## 核心功能

### 1. PSI协议实现

系统采用不平衡PSI（Unbalanced Private Set Intersection）协议，确保在检测恶意文件时保护用户隐私。PSI协议的主要实现在`psi_wrapper.py`中。

### 2. 用户认证与授权

使用JWT（JSON Web Token）进行用户认证，确保API访问的安全性。实现在`core/security.py`中。

### 3. 文件扫描与检测

- 文件上传处理
- 提取文件特征
- 应用PSI协议进行安全检测
- 结果分析与展示

### 4. 用户数据管理

提供用户信息管理功能，包括个人资料更新、密码修改等。

## 安全措施

- 密码哈希存储
- JWT令牌认证
- HTTPS传输加密
- 文件类型验证
- 隐私保护协议 