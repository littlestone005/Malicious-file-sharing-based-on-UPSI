# 项目目录结构

本文档详细介绍了基于UPSI的恶意文件检测系统的目录结构和各模块的功能。

## 整体项目结构

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
│   ├── init_db.py         # 初始化数据库
│   ├── view_db_for_test.py # 查看数据库内容
│   └── README_SCRIPTS.md  # 脚本使用指南
├── data/                   # 数据存储目录
│   └── malware_detection.db # SQLite数据库
├── docs/                   # 项目文档
│   ├── overview/          # 项目概述文档
│   ├── components/        # 组件文档
│   ├── database/          # 数据库文档
│   └── optimization/      # 优化文档
├── requirements.txt        # Python依赖
└── .env                    # 环境变量配置
```

## 各目录详细说明

### algorithm/ - 算法模块

包含PSI算法核心实现和特征提取功能：

- `psi/` - 私有集合交集算法实现
  - `garbled_circuit.py` - 混淆电路实现
  - `oblivious_transfer.py` - 不经意传输实现
  - `utils.py` - 工具函数
- `features/` - 特征提取模块
  - `byte_histogram.py` - 字节直方图特征
  - `entropy.py` - 熵特征计算
  - `pe_header.py` - PE头部特征
- `ml_models/` - 使用PSI保护隐私的机器学习模型
  - `rf_model.py` - 随机森林模型
  - `xgboost_model.py` - XGBoost模型

### backend/ - 后端服务

FastAPI实现的后端API服务，处理请求和业务逻辑：

- `core/` - 核心配置模块
  - `config.py` - 配置管理
  - `security.py` - 安全功能
- `database/` - 数据库相关
  - `session.py` - 数据库会话
  - `upgrade_db.py` - 数据库升级脚本
- `models/` - 数据模型定义
  - `base.py` - 模型基类
  - `user.py` - 用户模型
  - `known_threat.py` - 恶意软件模型
  - `scan_record.py` - 扫描记录模型
- `routers/` - 路由处理器
  - `detection.py` - 检测相关路由
  - `auth.py` - 认证相关路由
  - `user.py` - 用户相关路由
  - `scan.py` - 扫描相关路由
- `schemas/` - 数据验证模式
- `services/` - 业务逻辑服务
- `utils/` - 工具函数
- `middleware/` - 中间件
- `tests/` - 测试代码
- `scripts/` - 维护脚本
- `uploads/` - 上传文件存储
- `logs/` - 日志文件
- `main.py` - 应用入口
- `psi_wrapper.py` - PSI算法包装器

### frontend/ - 前端应用

基于React和Vite构建的前端界面：

- `public/` - 静态资源
  - `favicon.ico` - 网站图标
  - `images/` - 图片资源
- `src/` - 源代码
  - `utils/` - 工具函数
    - `api.js` - API请求客户端
    - `format.js` - 格式化工具
  - `components/` - 可复用组件
    - `FileUploader.jsx` - 文件上传组件
    - `LoginModal.jsx` - 登录模态框
    - `Header.jsx` - 页面头部组件
    - `Footer.jsx` - 页面底部组件
    - `ScanResult.jsx` - 扫描结果组件
  - `context/` - React上下文
    - `UserContext.jsx` - 用户上下文
  - `pages/` - 页面组件
    - `HomePage.jsx` - 首页
    - `ScanPage.jsx` - 扫描页面
    - `ResultsPage.jsx` - 结果页面
    - `HistoryPage.jsx` - 历史记录页面
    - `UserSettingsPage.jsx` - 用户设置页面
    - `AboutPage.jsx` - 关于页面
  - `App.jsx` - 应用程序入口组件
  - `main.jsx` - 主入口文件
- `dist/` - 构建输出目录
- `index.html` - HTML模板
- `package.json` - 项目依赖配置
- `vite.config.js` - Vite配置

### tools/ - 工具脚本

项目管理和维护工具：

- `launch.py` - 一键启动前端和后端服务器
- `init_db.py` - 初始化数据库
- `view_db_for_test.py` - 查看数据库内容
- `README_SCRIPTS.md` - 脚本使用指南

### docs/ - 项目文档

项目相关的文档：

- `overview/` - 项目概述文档
- `components/` - 组件文档
- `database/` - 数据库文档
- `optimization/` - 优化文档

### 根目录文件

- `requirements.txt` - Python依赖项
- `.env` - 环境变量配置
- `README.md` - 项目主要README文件