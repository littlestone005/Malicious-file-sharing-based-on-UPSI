# 项目目录结构说明

本文档详细说明了项目的目录结构和各个文件的用途，帮助开发者快速理解代码组织。

## 根目录

```
├── algorithm/              # PSI算法实现模块
├── backend/                # FastAPI后端服务
├── frontend/               # React前端应用
├── migrations/             # 数据库迁移脚本
├── docs/                   # 项目文档
├── logs/                   # 日志文件夹
├── uploads/                # 上传文件存储
├── malware_detection.db    # 主数据库文件
├── alembic.ini             # Alembic迁移配置
├── .env                    # 环境变量
├── requirements.txt        # 项目依赖列表
├── run.sh                  # 启动脚本
├── README.md               # 项目主要说明
└── .gitignore              # Git忽略文件配置
```

## 文件和目录说明

### 核心模块

#### 1. algorithm/ - 算法模块
包含PSI（私有集合交集）协议的实现，用于隐私保护恶意文件检测。

```
algorithm/
├── psi/                  # PSI算法核心实现
│   ├── garbled_circuit.py # 混淆电路实现
│   ├── oblivious_transfer.py # 不经意传输实现
│   └── utils.py          # 工具函数
├── features/             # 特征提取
│   ├── byte_histogram.py # 字节直方图特征
│   ├── entropy.py        # 熵特征计算
│   └── pe_header.py      # PE头部特征
├── ml_models/           # 机器学习模型
├── scripts/             # 辅助脚本
├── tests/              # 测试文件
└── CMakeLists.txt      # 构建配置
```

#### 2. backend/ - 后端服务
FastAPI实现的后端服务，处理用户认证、文件上传和恶意软件检测。

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
├── routers/            # 路由处理器
├── schemas/           # 数据验证模式
├── services/          # 业务逻辑服务
├── utils/            # 工具函数
├── middleware/       # 中间件
├── scripts/          # 辅助脚本
│   └── optimize_db.py # 数据库优化脚本
├── tests/            # 单元测试
├── tests_for_demo_renamed/  # 演示用测试（仅用于演示）
├── scripts_for_test/  # 测试脚本（仅用于测试）
│   └── db/           # 数据库测试脚本
│       ├── view_db_for_test.py    # 数据库查看工具（测试用）
│       ├── create_and_view_db.py  # 数据库创建和查看（测试用）
│       └── test.db               # 测试数据库文件
├── uploads/         # 上传文件目录
├── logs/            # 日志目录
├── main.py          # 应用入口
├── psi_wrapper.py   # PSI协议包装器
└── requirements.txt # 依赖项
```

#### 3. frontend/ - 前端应用
基于React和Vite构建的前端应用程序，用于提供用户友好的恶意文件检测界面。

```
frontend/
├── public/                # 静态资源
├── src/                   # 源代码
│   ├── api/              # API请求
│   ├── components/       # 可复用组件
│   ├── contexts/         # React上下文
│   ├── hooks/            # 自定义钩子
│   ├── pages/            # 页面组件
│   ├── utils/            # 工具函数
│   ├── App.jsx           # 应用程序入口组件
│   └── main.jsx          # 主入口文件
├── tests/                # 测试文件
├── dist/                 # 构建输出目录（自动生成）
├── index.html            # HTML模板
├── package.json          # 项目依赖配置
├── vite.config.js        # Vite配置
└── .env                  # 环境变量
```

### 数据库相关

#### 4. migrations/ - 数据库迁移
使用Alembic管理的数据库版本控制和迁移脚本。

```
migrations/
├── versions/             # 迁移版本脚本
│   └── 1683a1b4c2d5_add_performance_indexes.py  # 添加性能索引的迁移
├── env.py                # 迁移环境配置
├── README                # 迁移说明
└── script.py.mako        # 迁移脚本模板
```

#### 5. 数据库文件
- `malware_detection.db` - 主SQLite数据库文件（运行时自动生成）
- `backend/scripts_for_test/db/test.db` - 测试数据库文件（用于测试）

### 文档和配置

#### 6. docs/ - 项目文档
包含项目设计、API文档和使用说明的文档目录。

```
docs/
├── project_notes.md      # 项目设计笔记（从Notepad.txt转换）
├── directory_structure.md  # 项目目录结构说明（本文档）
└── ... 其他文档
```

#### 7. 配置文件
- `.env` - 环境变量配置
- `alembic.ini` - Alembic数据库迁移配置
- `requirements.txt` - Python依赖列表
- `run.sh` - 项目启动脚本

### 数据和日志

#### 8. uploads/ - 上传文件存储
用户上传的文件临时存储目录，包含以下子目录：
- `uploads/scans/` - 扫描文件目录
- `uploads/temp/` - 临时文件目录

#### 9. logs/ - 日志文件夹
系统运行日志的存储目录，日志文件在运行时自动生成。

## 文件类型说明

### 演示和测试文件
以下文件和目录专门用于演示或测试，不用于生产环境：

1. **测试数据库和脚本**:
   - `backend/scripts_for_test/db/test.db` - 测试数据库
   - `backend/scripts_for_test/db/view_db_for_test.py` - 数据库查看测试工具
   - `backend/scripts_for_test/db/create_and_view_db.py` - 数据库创建测试脚本

2. **演示用测试**:
   - `backend/tests_for_demo_renamed/` - 用于演示的测试案例

### 自动生成的文件
以下文件和目录是系统运行时自动生成的，不需要手动创建或修改：

1. **构建输出**:
   - `frontend/dist/` - 前端构建输出目录

2. **数据文件**:
   - `logs/*.log` - 日志文件
   - `malware_detection.db` - 主数据库（首次运行时自动创建）

3. **缓存和临时文件**:
   - `__pycache__/` - Python缓存文件
   - `uploads/temp/` - 临时上传文件

## 开发指南

开发时，请遵循以下目录使用原则：

1. **核心功能**: 
   - 添加新功能时，请在相应的模块目录下创建文件
   - 遵循现有的命名和代码组织约定

2. **测试文件**:
   - 单元测试放在各模块的`tests/`目录下
   - 演示或特殊测试用例添加到`_for_test`后缀的目录

3. **文档**:
   - 将新功能的设计文档添加到`docs/`目录
   - 更新README.md以反映重要的变更

4. **数据库变更**:
   - 通过Alembic创建新的迁移脚本，而不是直接修改数据库
   - 将版本管理脚本放在`migrations/versions/`目录 