# 基于UPSI的恶意文件检测系统

基于非平衡私有集合交集 (UPSI) 协议的恶意文件检测系统，确保用户隐私的同时提供高效的恶意软件检测。

## 系统架构

该系统由四个主要部分组成:

1. **前端**: React和Vite构建的用户界面，提供文件上传、结果展示和用户管理
2. **后端**: FastAPI实现的API服务，处理请求、业务逻辑和数据管理
3. **算法模块**: 私有集合交集(PSI)算法实现，用于隐私保护恶意软件检测
4. **数据库**: 存储用户信息、恶意软件特征和扫描记录，使用SQLite(默认)或PostgreSQL(可选)

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 14+
- NPM 6+ 或 Yarn 1.22+
- SQLite (默认) 或 PostgreSQL (可选)

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

1. 启动后端
   ```bash
   cd backend
   python main.py
   ```

2. 启动前端
   ```bash
   cd frontend
   npm run dev
   ```

3. 访问应用
   打开浏览器访问: http://localhost:3000

## 优化后的项目结构

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
│   ├── scripts/           # 实用脚本
│   │   └── view_db_for_test.py  # 数据库查看测试工具
│   ├── tests/             # 单元测试
│   ├── tests_for_demo_renamed/  # 演示用测试
│   ├── scripts_for_test/  # 测试脚本
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
├── migrations/             # 数据库迁移脚本
│   └── versions/          # 迁移版本
└── docs/                   # 文档
```

## 数据库结构

系统使用SQLAlchemy ORM管理以下主要表:

### 用户表 (users)

存储用户信息和认证数据:
- id: 主键
- username: 用户名
- email: 电子邮件
- password_hash: 密码哈希
- created_at: 创建时间
- last_login: 最后登录时间

### 已知威胁表 (known_threats)

存储恶意软件特征:
- id: 主键
- hash: 文件哈希
- threat_type: 威胁类型
- severity: 严重程度
- first_seen: 首次发现时间
- description: 威胁描述

### 扫描记录表 (scan_records)

存储扫描历史:
- id: 主键
- user_id: 用户ID (外键)
- file_name: 文件名
- file_hash: 文件哈希
- file_size: 文件大小
- scan_date: 扫描时间
- status: 扫描状态
- privacy_enabled: 隐私保护启用状态
- result: 扫描结果 (JSON)

## 数据库管理工具

- **初始化脚本**: `backend/database/init_db.py` - 创建初始数据库并填充测试数据
- **迁移脚本**: `migrations/versions/` - 数据库版本迁移
- **查看工具**: `backend/scripts/view_db_for_test.py` - 查看数据库内容的测试工具
- **优化工具**: `backend/scripts/optimize_db.py` - 数据库优化脚本

## 数据库优化

系统包含以下数据库优化功能:

### 索引优化

为提高查询性能，系统创建了以下索引:
- `users`: username, email
- `known_threats`: hash, threat_type
- `scan_records`: user_id, file_hash, scan_date

### 连接池管理

使用SQLAlchemy的连接池功能优化数据库连接:
- 自定义连接池大小
- 连接超时和回收策略
- 连接前检查 (pre-ping)

### 性能监控

- 慢查询日志
- 查询性能分析
- 执行统计

### 优化脚本

提供数据库维护脚本，支持:
- 清理旧扫描记录
- 重建索引
- 执行VACUUM操作压缩数据库
- 分析表以优化查询计划

用法:
```bash
python backend/scripts/optimize_db.py --vacuum --clean-days 30
```

## 私有集合交集 (PSI) 协议

PSI协议允许两方计算集合交集，同时不泄露各自集合的其他元素:
- 客户端提供文件特征集合
- 服务器提供已知恶意软件特征集合
- 双方通过PSI协议计算交集，确定文件是否包含恶意特征

系统支持三种隐私级别，平衡不同程度的隐私保护和性能需求。

## 测试与演示

系统包含以下测试和演示功能：

- **数据库查看工具**: `backend/scripts/view_db_for_test.py` - 用于测试和演示查看数据库内容
- **演示测试目录**: `backend/tests_for_demo_renamed/` - 包含演示相关的测试案例
- **测试脚本目录**: `backend/scripts_for_test/` - 专用于测试的辅助脚本
- **测试账号**: 用户名 `admin`, 密码 `admin` - 默认管理员账号
- **预置恶意软件特征**: 在`core/config.py`文件中配置的已知恶意软件哈希值样本

## 开发指南

### 后端

1. 添加新路由: 
   - 在`backend/routers/`创建新路由文件
   - 在`main.py`中注册路由

2. 添加新模型:
   - 在`backend/models/`中定义模型
   - 使用Alembic创建迁移

### 前端

1. 添加新组件:
   - 在`frontend/src/components/`创建组件
   - 添加样式和测试

2. 添加新页面:
   - 在`frontend/src/pages/`创建页面组件
   - 在路由配置中注册

## 贡献

欢迎贡献! 请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 获取更多信息。

## 许可证

本项目基于MIT许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。
