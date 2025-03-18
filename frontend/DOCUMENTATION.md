# 隐私保护恶意软件检测系统 - 前端文档

## 项目概述

本项目是一个基于PSI协议的隐私保护恶意软件检测系统，支持个人用户和企业用户。系统允许用户上传文件进行恶意软件扫描，同时保护用户隐私。

## 文件结构与功能

### 核心文件

| 文件 | 功能描述 |
|------|----------|
| `frontend/index.html` | 项目入口HTML文件，定义了页面的基本结构和元数据 |
| `frontend/src/main.jsx` | React应用的入口点，负责渲染根组件和设置路由 |
| `frontend/src/App.jsx` | 应用的主组件，包含路由配置和全局状态管理（UserContext） |
| `frontend/src/index.css` | 全局样式定义 |
| `frontend/vite.config.js` | Vite构建工具的配置文件 |
| `frontend/package.json` | 项目配置文件，定义了项目依赖、脚本和元数据 |
| `frontend/node_modules/` | 存放项目依赖的目录，由npm/yarn自动管理 |

### 页面组件 (`frontend/src/pages/`)

| 文件 | 功能描述 |
|------|----------|
| `HomePage.jsx` | 首页，展示系统介绍和主要功能入口 |
| `ScanPage.jsx` | 文件扫描页面，允许用户上传文件进行扫描，支持个人和企业用户不同的上传方式 |
| `ResultsPage.jsx` | 扫描结果页面，展示文件扫描的详细结果，为企业用户提供更详细的报告 |
| `HistoryPage.jsx` | 扫描历史页面，显示用户过去的扫描记录 |
| `UserSettingsPage.jsx` | 用户设置页面，允许用户管理个人信息和隐私设置 |
| `AboutPage.jsx` | 关于页面，介绍PSI协议和系统的隐私保护机制 |

### 组件 (`frontend/src/components/`)

| 文件 | 功能描述 |
|------|----------|
| `Header.jsx` | 页面顶部导航栏，包含导航菜单和用户登录/信息显示 |
| `Footer.jsx` | 页面底部，包含版权信息和链接 |
| `LoginModal.jsx` | 登录/注册模态框，支持个人和企业用户的切换和认证 |
| `FileUploader.jsx` | 文件上传组件，支持拖拽上传和批量上传，为企业用户提供特殊功能 |
| `ResultsDisplay.jsx` | 扫描结果展示组件，以可视化方式展示扫描结果 |
| `DetailedResults.jsx` | 详细结果组件，展示文件扫描的详细信息 |
| `ScanHistory.jsx` | 扫描历史组件，展示历史记录列表和详情 |
| `PrivacyExplainer.jsx` | 隐私说明组件，解释PSI协议如何保护用户隐私 |
| `PrivacySettings.jsx` | 隐私设置组件，允许用户配置隐私保护级别 |
| `LoadingAnimation.jsx` | 加载动画组件，在数据加载过程中显示 |

### 工具函数 (`frontend/src/utils/`)

此目录包含各种工具函数和辅助方法，用于处理文件、加密、API调用等。

## 文件生成方式说明

以下是对前端文件夹中文件生成方式的分类说明：

### 程序员手写的文件

这些文件由开发人员手动编写和维护，包含业务逻辑、组件定义、样式和配置等：

1. **核心文件**：
   - `frontend/index.html`
   - `frontend/src/main.jsx`
   - `frontend/src/App.jsx`
   - `frontend/src/index.css`
   - `frontend/vite.config.js`

2. **页面组件**（位于 `frontend/src/pages/`）：
   - `HomePage.jsx`
   - `ScanPage.jsx`
   - `ResultsPage.jsx`
   - `HistoryPage.jsx`
   - `UserSettingsPage.jsx`
   - `AboutPage.jsx`

3. **组件**（位于 `frontend/src/components/`）：
   - `Header.jsx`
   - `Footer.jsx`
   - `LoginModal.jsx`
   - `FileUploader.jsx`
   - `ResultsDisplay.jsx`
   - `DetailedResults.jsx`
   - `ScanHistory.jsx`
   - `PrivacyExplainer.jsx`
   - `PrivacySettings.jsx`
   - `LoadingAnimation.jsx`

4. **工具函数**（位于 `frontend/src/utils/`）：
   - 包含各种辅助方法和工具函数的文件。

5. **脚本和配置文件**：
   - `frontend/package.json`
   - 其他手动维护的配置文件。

### 系统生成的文件

这些文件由构建工具、依赖管理工具或脚本自动生成，通常不需要手动编辑：

1. **依赖锁定文件**：
   - `frontend/package-lock.json`：由 npm 自动生成，用于锁定依赖版本。

2. **依赖目录**：
   - `frontend/node_modules/`：由 npm 或 yarn 自动生成，存储项目依赖的实际代码。

3. **构建产物**：
   - `frontend/dist/`：由构建工具（如 Vite）生成，包含生产环境的静态文件。

4. **其他生成文件**：
   - 由 ESLint、Babel 或其他工具生成的临时文件或缓存文件（如 `.eslintcache`）。

## 重要配置文件详解

### package.json

`package.json` 是项目的配置文件，包含以下重要信息：

1. **基本信息**：
   - `name`: 项目名称 ("privacy-malware-detection-frontend")
   - `version`: 项目版本 ("0.1.0")
   - `private`: 标记为私有项目，防止意外发布到npm

2. **脚本命令**：
   - `dev`: 启动开发服务器 (`vite`)
   - `build`: 构建生产版本 (`vite build`)
   - `lint`: 运行代码检查 (`eslint`)
   - `preview`: 预览生产构建 (`vite preview`)

3. **依赖项**：
   - **生产依赖** (`dependencies`):
     - `@ant-design/icons`: Ant Design图标库
     - `antd`: Ant Design UI组件库
     - `axios`: HTTP客户端，用于API请求
     - `crypto-js`: 加密库，用于文件哈希计算
     - `echarts` & `echarts-for-react`: 数据可视化图表库
     - `moment`: 日期处理库
     - `react` & `react-dom`: React核心库
     - `react-router-dom`: React路由
     - `styled-components`: CSS-in-JS样式解决方案

   - **开发依赖** (`devDependencies`):
     - `@types/react` & `@types/react-dom`: React类型定义
     - `@vitejs/plugin-react`: Vite的React插件
     - `eslint` 及相关插件: 代码检查工具
     - `vite`: 前端构建工具

### package-lock.json

`package-lock.json` 是项目的锁定文件，用于记录当前安装的依赖及其精确版本信息。它具有以下重要作用：

1. **依赖锁定**：
   - 确保在不同环境中安装的依赖版本完全一致，避免因版本差异导致的潜在问题。
   - 锁定所有直接和间接依赖的具体版本号、解析路径和校验值。

2. **依赖树描述**：
   - 包含完整的依赖树信息，明确每个依赖的来源（如 `resolved` 字段）和完整性校验值（如 `integrity` 字段）。
   - 示例：
     ```json
     "node_modules/react": {
       "version": "18.2.0",
       "resolved": "https://registry.npmjs.org/react/-/react-18.2.0.tgz",
       "integrity": "sha512-..."
     }
```

### node_modules 目录

`node_modules` 是一个由npm或yarn自动创建和管理的目录，具有以下特点：

1. **功能**：存储项目所有依赖包的实际代码
2. **管理方式**：
   - 通过 `npm install` 或 `yarn` 命令自动创建和更新
   - 基于 `package.json` 中定义的依赖关系安装相应的包
   - 包括直接依赖和间接依赖（依赖的依赖）
3. **注意事项**：
   - 不应手动修改此目录中的文件
   - 不应将此目录添加到版本控制系统（如Git）中，通常在 `.gitignore` 文件中排除
   - 可能非常大，包含成千上万的文件
   - 可以随时删除并通过 `npm install` 重新创建
4. **依赖解析**：
   - Node.js使用此目录查找和加载模块
   - 使用嵌套结构存储依赖，允许不同版本的同一包共存

## 用户类型

系统支持两种类型的用户：

1. **个人用户**：
   - 可以上传单个或少量文件进行扫描
   - 获得基本的扫描结果报告

2. **企业用户**：
   - 可以批量上传多个文件进行扫描
   - 获得更详细的扫描报告，包括风险评估和建议操作
   - 特殊的UI标识和功能

## 主要功能流程

1. **用户认证**：
   - 用户可以选择以个人或企业身份登录/注册
   - 认证状态通过UserContext在全应用范围内共享

2. **文件扫描**：
   - 用户上传文件（个人用户通常上传单个文件，企业用户可批量上传）
   - 文件在本地进行哈希处理，保护用户隐私
   - 使用PSI协议进行扫描，只有恶意文件的信息会被服务器获知

3. **结果展示**：
   - 显示扫描结果，包括安全文件和恶意文件的数量
   - 企业用户获得更详细的报告，包括风险评估和建议操作
   - 结果可以保存到历史记录中

## 技术栈

- **React**：前端UI库
- **React Router**：页面路由
- **Ant Design**：UI组件库
- **Styled Components**：CSS-in-JS样式解决方案
- **Vite**：构建工具
- **CryptoJS**：加密库，用于文件哈希
- **Axios**：HTTP客户端，用于API请求
- **ECharts**：数据可视化图表库
- **Moment**：日期处理库

## 隐私保护机制

系统使用PSI（Private Set Intersection）协议来保护用户隐私：

1. 文件在本地进行哈希处理
2. 只有哈希值会被发送到服务器
3. 服务器使用PSI协议比对哈希值，只能知道恶意文件的信息
4. 非恶意文件的内容和信息对服务器完全不可见

## 部署说明

1. **环境要求**：
   - Node.js 16.x 或更高版本
   - npm 7.x 或更高版本（或yarn）

2. **安装步骤**：
   - 克隆代码库：`git clone [repository-url]`
   - 进入项目目录：`cd frontend`
   - 安装依赖：`npm install`

3. **运行命令**：
   - 开发模式运行：`npm run dev`
   - 构建生产版本：`npm run build`
   - 预览生产版本：`npm run preview`
   - 代码检查：`npm run lint`

4. **构建产物**：
   - 构建后的文件位于 `dist` 目录
   - 可以部署到任何静态文件服务器 