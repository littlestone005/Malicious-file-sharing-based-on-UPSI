# 基于UPSI的恶意文件检测系统

一个基于非平衡私有集合交集 (UPSI) 协议的恶意文件检测系统，能够在保护用户隐私的同时提供高效的恶意软件检测服务。本项目旨在解决传统恶意文件检测中的隐私泄露问题。

## 项目亮点

- **隐私保护**: 采用非平衡PSI协议，用户文件特征不会泄露给服务提供方
- **高效检测**: 先进的特征提取和匹配算法，确保检测准确性
- **用户友好**: 简洁直观的界面设计，易于使用
- **安全可靠**: 完整的用户认证和授权系统
- **响应式设计**: 适配各种设备屏幕，提供一致的用户体验

## 系统架构

该系统由三个主要部分组成:

1. **前端**: 基于React和Ant Design构建的用户界面，提供文件上传、结果展示和用户管理功能
2. **后端**: 使用FastAPI实现的API服务，处理请求、业务逻辑和数据管理
3. **算法模块**: 高效的私有集合交集(PSI)算法实现，为隐私保护恶意软件检测提供核心支持

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 14+
- NPM 6+
- SQLite (内置数据库)

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/Malicious-file-sharing-based-on-UPSI.git
   cd Malicious-file-sharing-based-on-UPSI
   ```

2. 后端设置
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. 前端设置
   ```bash
   cd frontend
   npm install
   ```

### 启动服务

1. 使用工具脚本快速启动（推荐）
   ```bash
   # 一键启动前端和后端服务器
   python tools/launch.py
   
   # 初始化数据库
   python tools/sql_init_db.py
   
   # 查看数据库内容
   python tools/view_db.py
   # 或使用简化版工具
   python tools/view_db_for_test.py
   ```
   详细的脚本使用说明请参考 `tools/README_SCRIPTS.md` 和 `tools/README_DATABASE.md`。

2. 手动启动
   ```bash
   # 启动后端
   cd backend
   python -m backend.main
   
   # 启动前端
   cd frontend
   npm run dev
   ```

3. 访问应用
   打开浏览器访问: http://localhost:5173

## 项目结构

```
├── algorithm/              # PSI算法实现
│   ├── psi/               # PSI协议核心
│   ├── features/          # 特征提取
│   └── ml_models/         # 机器学习模型
├── backend/                # FastAPI后端
│   ├── core/              # 核心配置
│   ├── database/          # 数据库模型和会话管理
│   ├── models/            # 数据模型定义
│   ├── routers/           # API路由
│   ├── schemas/           # 数据验证模式
│   ├── services/          # 业务逻辑
│   ├── utils/             # 工具函数
│   ├── middleware/        # 中间件
│   ├── tests/             # 测试代码
│   ├── scripts/           # 维护脚本
│   ├── uploads/           # 上传文件存储
│   ├── logs/              # 日志文件
│   ├── main.py            # 应用入口
│   └── psi_wrapper.py     # PSI算法包装器
├── frontend/               # React前端
│   ├── src/               # 源代码
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   └── utils/         # 工具函数
│   ├── public/            # 静态资源
│   └── dist/              # 构建输出
├── tools/                  # 工具脚本目录
│   ├── launch.py          # 一键启动前端和后端服务
│   ├── sql_init_db.py     # 初始化数据库(使用原生SQL)
│   ├── view_db.py         # 查看数据库内容(详细版)
│   ├── view_db_for_test.py # 查看数据库内容(简化版)
│   ├── README_SCRIPTS.md  # 脚本使用指南
│   └── README_DATABASE.md # 数据库工具使用指南
├── data/                   # 数据存储目录
│   ├── malware_detection.db # SQLite数据库
│   ├── backups/           # 数据库备份
│   ├── logs/              # 日志文件
│   └── uploads/           # 上传文件存储
├── docs/                   # 项目文档
├── requirements.txt        # Python依赖
└── .env                    # 环境变量配置
```

## 核心功能

### 1. 隐私保护的文件扫描

- 允许用户上传文件进行恶意软件检测
- 应用PSI协议确保用户文件特征的隐私安全
- 提供详细的扫描结果和安全建议

### 2. 用户账户管理

- 注册和登录功能
- 个人资料设置
- 安全设置（密码修改）
- 语言偏好设置

### 3. 扫描历史记录

- 记录用户的扫描历史
- 提供扫描结果的长期存储和查询
- 支持按时间、文件名等条件筛选

### 4. 安全和隐私设置

- 用户可自定义隐私保护程度
- 支持对敏感扫描进行额外加密
- 完整的用户权限管理

## 数据库结构

项目使用SQLite作为数据库，主要包含以下表：

1. **users** - 用户信息表
   - 存储用户账户信息，包括用户名、邮箱、密码哈希等

2. **known_threats** - 已知威胁记录表
   - 存储已知的恶意软件威胁信息，包括文件哈希、威胁类型、严重程度等

3. **scan_records** - 文件扫描记录表
   - 存储用户的文件扫描记录，包括文件名、扫描结果等

详细的数据库结构和使用说明请参考 `tools/README_DATABASE.md`。

## 技术亮点

### 前端技术

- **React**: 用于构建用户界面
- **Ant Design**: 提供现代化UI组件
- **React Router**: 实现页面路由
- **Axios**: 处理API请求
- **Styled Components**: CSS样式组件

### 后端技术

- **FastAPI**: 高性能Web框架
- **SQLite**: 轻量级数据库
- **Pydantic**: 数据验证和序列化
- **JWT认证**: 安全的用户认证
- **异步处理**: 高效处理并发请求

### 算法技术

- **非平衡PSI协议**: 保护用户隐私的核心技术
- **特征提取算法**: 高效提取文件特征
- **机器学习增强**: 提高检测准确率

## 用户界面展示

系统提供直观易用的用户界面:

- **首页**: 项目介绍和功能导航
- **扫描页面**: 文件上传和检测
- **结果页面**: 详细的扫描结果展示
- **历史记录**: 用户的扫描历史管理
- **用户设置**: 个人资料和安全设置

## 隐私保护机制

本系统的核心优势在于采用PSI协议进行恶意文件检测:

- 用户文件特征不会被服务器完整获取
- 服务器的恶意软件特征库不会暴露给用户
- 只有匹配结果会被双方获知
- 可根据安全需求选择不同隐私保护级别

## 未来展望

本项目计划在未来添加的功能:

- 更多文件类型的支持
- 高级威胁分析报告
- 实时威胁情报集成
- 更多语言的国际化支持
- 移动设备适配优化
