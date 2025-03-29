# 后端组件文档

本文档详细介绍基于UPSI的恶意文件检测系统的后端组件架构和功能。

## 架构概述

后端服务基于FastAPI框架构建，采用异步处理方式提供高性能API服务。主要功能包括用户认证、文件处理、PSI算法集成和数据管理。

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
├── services/             # 业务逻辑服务
├── utils/                # 工具函数
├── middleware/           # 中间件
├── scripts/              # 辅助脚本
├── tests/                # 测试案例
├── uploads/              # 上传文件目录
├── logs/                 # 日志目录
├── main.py               # 应用入口
└── psi_wrapper.py        # PSI协议包装器
```

## 数据模型

系统使用SQLAlchemy ORM管理以下核心数据模型：

### User 模型

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

### KnownThreat 模型

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

### 1. 用户认证与授权

基于JWT（JSON Web Token）实现的安全认证机制：

- **令牌生成与验证**: 在`core/security.py`中实现
- **密码哈希与验证**: 使用密码哈希存储，防止明文泄露
- **基于角色的授权**: 通过中间件实现API访问控制

### 2. 文件上传与处理

安全的文件上传和处理流程：

- **文件验证**: 检查文件类型、大小和内容有效性
- **安全存储**: 临时存储上传文件，处理完成后清理
- **并发处理**: 异步处理多个文件上传请求

### 3. PSI协议集成

与算法模块的集成：

- **PSI包装器**: `psi_wrapper.py`提供与PSI算法的接口
- **隐私级别配置**: 支持不同级别的隐私保护设置
- **特征处理**: 提取和处理文件特征以进行比对

### 4. 数据管理

高效的数据管理机制：

- **事务处理**: 确保数据操作的原子性和一致性
- **查询优化**: 优化数据库查询提高性能
- **数据验证**: 使用Pydantic模型验证输入数据

## 配置管理

系统配置在`core/config.py`中集中管理，主要配置项：

- **数据库连接**: 数据库URL和连接参数
- **安全设置**: JWT密钥、令牌过期时间等
- **文件上传**: 上传限制、临时存储路径
- **日志配置**: 日志级别、格式和存储位置

## 错误处理

系统实现了统一的错误处理机制：

- **HTTP异常**: 标准化的HTTP错误响应
- **业务异常**: 自定义业务逻辑异常
- **日志记录**: 详细的错误日志记录

## 部署与扩展

### 部署选项

- **本地开发**: 使用内置服务器运行
- **生产部署**: 使用Gunicorn与Uvicorn工作进程

### 水平扩展

- **无状态设计**: 服务可以无状态水平扩展
- **负载均衡**: 支持多实例负载均衡
- **缓存集成**: 可集成Redis等缓存提高性能

## 维护与监控

- **健康检查**: 提供API端点检查系统状态
- **性能监控**: 日志集成支持性能指标收集
- **数据备份**: 数据库备份和恢复机制

## 安全措施

- **输入验证**: 严格验证所有API输入
- **防止注入**: ORM防止SQL注入
- **速率限制**: 防止暴力攻击和滥用
- **安全头部**: 配置安全相关的HTTP头部 