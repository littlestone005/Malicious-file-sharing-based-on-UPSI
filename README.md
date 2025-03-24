# 基于UPSI的恶意文件检测系统

基于非平衡私有集合交集（UPSI）协议的恶意文件检测系统，保护用户隐私的同时检测恶意文件。

## 项目概述

本项目实现了一个使用私有集合交集（PSI）技术的恶意文件检测系统，允许用户在不泄露其文件内容的情况下检测其文件是否为已知恶意软件。

主要特点：
- 隐私保护：使用PSI协议确保用户文件信息不被泄露
- 高效检测：快速匹配文件哈希与已知恶意软件数据库
- 用户友好：简洁直观的界面，使检测过程简单易用
- 安全认证：完整的用户认证和授权系统

## 系统架构

系统由三个主要部分组成：

1. **前端**：React应用，提供用户界面
2. **后端**：FastAPI服务，处理API请求和业务逻辑
3. **算法模块**：实现PSI协议的C++库

## 快速开始

### 环境要求
- Python 3.9+
- Node.js 16+
- C++编译器（支持C++17）

### 后端设置
```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务器
python -m backend.main
```

### 前端设置
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 算法模块构建
```bash
# 进入算法目录
cd algorithm

# 创建构建目录
mkdir build && cd build

# 配置并构建
cmake ..
make
```

## API文档

启动后端服务器后，API文档可在以下位置访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 主要功能

### 用户管理
- 用户注册/登录
- 用户信息管理
- 权限控制

### 文件扫描
- 文件上传与哈希计算
- 隐私保护检测
- 扫描结果展示
- 扫描历史管理

### 隐私保护
- PSI协议集成
- 零知识证明支持
- 隐私设置选项

## 项目结构

```
project/
├── frontend/           # 前端React应用
├── backend/            # 后端FastAPI应用
└── algorithm/          # PSI协议C++实现
```

详细的子目录结构请参见各部分的README文件。

## 演示与测试

系统包含以下演示和测试功能：

- `/backend/scripts/view_db.py` - 用于演示查看数据库内容的脚本
- 测试账号：用户名 `admin`，密码 `admin`
- 预置的恶意软件哈希值用于演示检测功能

## 开发指南

有关模块开发的详细信息，请参阅：
- [前端开发指南](frontend/README.md)
- [后端开发指南](backend/README.md)
- [算法模块开发指南](algorithm/README.md)

## 许可证

本项目采用 MIT 许可证
