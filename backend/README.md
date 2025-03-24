# 基于UPSI的恶意文件检测系统 - 后端

FastAPI实现的后端服务，处理用户认证、文件上传和恶意软件检测。

## 目录结构

```
backend/
├── core/                 # 核心功能模块
│   ├── config.py         # 配置管理
│   └── security.py       # 安全功能
├── database/             # 数据库相关
│   ├── init_db.py       # 数据库初始化
│   └── session.py       # 数据库会话
├── models/              # 数据模型
├── routers/            # 路由处理器 
├── schemas/           # 数据验证模式
├── services/          # 业务逻辑服务
├── utils/            # 工具函数
├── scripts/          # 辅助脚本
│   └── view_db.py    # 数据库查看工具（演示用）
├── tests/            # 测试文件
├── uploads/         # 上传文件目录
│   ├── scans/       # 扫描文件目录
│   └── temp/        # 临时文件目录
├── logs/            # 日志目录
├── main.py          # 应用入口
├── psi_wrapper.py   # PSI协议包装器
└── requirements.txt # 依赖项
```

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

## 演示功能

- 数据库查看工具: `python backend/scripts/view_db.py`
- 默认管理员账号: 用户名 `admin`, 密码 `admin` 