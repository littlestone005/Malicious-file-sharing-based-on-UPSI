# 基于UPSI的恶意文件检测系统 - 前端

基于React和Vite构建的前端应用程序，用于提供用户友好的恶意文件检测界面。

## 目录结构

```
frontend/
├── public/                # 静态资源
│   ├── favicon.ico       # 网站图标
│   └── images/           # 图片资源
├── src/                   # 源代码
│   ├── utils/            # 工具函数
│   │   ├── api.js        # API请求客户端
│   │   └── format.js     # 格式化工具
│   ├── components/       # 可复用组件
│   │   ├── FileUploader.jsx  # 文件上传组件
│   │   ├── LoginModal.jsx    # 登录模态框
│   │   ├── Header.jsx        # 页面头部组件
│   │   ├── Footer.jsx        # 页面底部组件
│   │   └── ScanResult.jsx    # 扫描结果组件
│   ├── context/          # React上下文
│   │   └── UserContext.jsx   # 用户上下文
│   ├── pages/            # 页面组件
│   │   ├── HomePage.jsx      # 首页
│   │   ├── ScanPage.jsx      # 扫描页面
│   │   ├── ResultsPage.jsx   # 结果页面
│   │   ├── HistoryPage.jsx   # 历史记录页面
│   │   ├── UserSettingsPage.jsx  # 用户设置页面
│   │   └── AboutPage.jsx     # 关于页面
│   ├── App.jsx           # 应用程序入口组件
│   └── main.jsx          # 主入口文件
├── dist/                 # 构建输出目录
├── index.html            # HTML模板
├── package.json          # 项目依赖配置
└── vite.config.js        # Vite配置
```

## 安装与设置

### 环境要求

- Node.js 14+ 
- npm 6+ 或 yarn 1.22+

### 安装依赖

```bash
npm install
```

### 开发环境启动

```bash
npm run dev
```

## 主要功能

### 用户界面

系统提供了简洁直观的用户界面：

- 现代化的响应式设计
- 直观的导航菜单
- 暗色/亮色主题支持

### 用户认证

由`UserContext`提供全局认证状态管理：

- 用户登录/注册
- 记住登录状态
- 基于JWT的认证

### 文件上传与检测

`FileUploader`组件负责文件上传和扫描：

- 支持拖放
- 文件类型检查
- 上传进度显示
- 隐私保护选项

### 结果展示

`ScanResult`组件展示检测结果：

- 威胁评分
- 详细分析结果
- 检测历史记录

### 用户设置

`UserSettingsPage`组件提供用户配置功能：

- 个人资料设置
- 安全设置（密码修改）
- 界面语言偏好设置

## 与后端API交互

前端使用Axios库与后端API交互，主要API功能：

### 认证功能

- 用户登录
- 用户注册
- 获取当前用户信息
- 更新用户资料
- 退出登录

### 文件检测功能

- 上传文件进行扫描
- 获取扫描结果
- 获取扫描历史

## 界面特色

### 登录模态框

为改善用户体验，我们将登录功能设计为模态框形式：

- 当未登录用户尝试使用需要登录的功能时弹出
- 支持记住登录状态功能
- 无缝集成到扫描流程中

### 文件扫描界面

- 简洁的拖放区域
- 清晰的扫描进度指示
- 详细的结果分析展示
- 直观的威胁指示

### 用户设置界面

- 标签式布局，方便切换不同设置
- 表单验证，确保数据准确性
- 直观的提交反馈

## 核心技术

- **React**：用于构建用户界面
- **Ant Design**：提供UI组件库
- **Axios**：处理API请求
- **React Router**：实现页面路由
- **Styled Components**：CSS样式组件
- **Context API**：管理全局状态

## 安全特性

- JWT令牌认证
- API请求拦截
- 表单验证
- 会话管理 