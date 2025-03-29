# 前端组件文档

本文档详细介绍基于UPSI的恶意文件检测系统的前端架构和组件。

## 架构概述

前端应用基于React和Vite构建，使用Ant Design组件库提供统一的UI界面。采用组件化设计，结合上下文API进行状态管理，实现了响应式的用户界面。

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

## 核心组件

### FileUploader 组件

文件上传组件是系统的核心功能之一，支持以下特性：

- **拖放上传**: 支持拖放文件到指定区域
- **文件类型验证**: 自动验证文件类型和大小
- **进度显示**: 显示上传和处理进度
- **隐私设置**: 提供隐私保护级别选择

```jsx
<FileUploader
  onUploadComplete={handleUploadComplete}
  privacyLevel={privacyLevel}
  onPrivacyLevelChange={setPrivacyLevel}
  maxSize={50 * 1024 * 1024} // 50MB
  acceptedFileTypes={['application/x-msdownload', 'application/octet-stream']}
/>
```

### ScanResult 组件

扫描结果组件负责展示文件分析结果：

- **威胁等级**: 使用色彩和图标直观显示威胁等级
- **详细分析**: 提供文件特征和威胁详情
- **操作建议**: 根据扫描结果提供安全建议
- **分享和导出**: 支持结果分享和导出

```jsx
<ScanResult
  result={scanResult}
  isLoading={isLoading}
  fileName={fileName}
  scanDate={scanDate}
  onExport={handleExport}
/>
```

### LoginModal 组件

登录模态框提供用户认证界面：

- **表单验证**: 实时表单验证
- **多种登录方式**: 用户名/邮箱登录
- **记住登录**: 保存登录状态
- **错误处理**: 友好的错误提示

```jsx
<LoginModal
  visible={showLogin}
  onClose={() => setShowLogin(false)}
  onLoginSuccess={handleLoginSuccess}
  defaultUsername={lastUsername}
/>
```

## 页面组件

### HomePage

系统的首页，提供以下内容：

- 项目介绍和功能概述
- 快速开始指南
- 最新动态和公告
- 快速操作入口

### ScanPage

文件扫描页面，包含：

- 文件上传区域
- 隐私设置选项
- 扫描历史快捷入口
- 扫描进度显示

### ResultsPage

扫描结果页面，展示：

- 扫描结果摘要
- 详细威胁信息
- 文件特征分析
- 安全操作建议

### HistoryPage

历史记录页面，提供：

- 扫描历史列表
- 筛选和搜索功能
- 结果查看和比较
- 导出和分享选项

### UserSettingsPage

用户设置页面，包含：

- 个人资料设置
- 安全设置（密码修改）
- 隐私偏好设置
- 通知设置

## 状态管理

系统使用React Context API进行状态管理：

### UserContext

用户上下文管理用户状态：

- 用户登录状态
- 用户信息和权限
- 认证令牌管理
- 登录和注销功能

```jsx
const { user, login, logout, isAuthenticated } = useUserContext();
```

## 与后端API交互

### API客户端

`utils/api.js`中封装了与后端交互的API客户端：

- 基于Axios构建
- 统一的错误处理
- 请求拦截器添加认证令牌
- 响应拦截器处理常见错误

### 主要API调用

```javascript
// 用户登录
const login = async (username, password) => {
  return api.post('/auth/login', { username, password });
};

// 文件上传和扫描
const scanFile = async (file, privacyLevel) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('privacy_level', privacyLevel);
  return api.post('/detection/scan', formData);
};

// 获取扫描结果
const getScanResult = async (scanId) => {
  return api.get(`/detection/result/${scanId}`);
};

// 获取扫描历史
const getScanHistory = async (filters) => {
  return api.get('/scan/history', { params: filters });
};
```

## UI设计和用户体验

### 响应式设计

系统界面采用响应式设计，适配不同屏幕大小：

- 移动设备优化布局
- 断点适配不同尺寸屏幕
- 触摸友好的交互设计

### 主题和样式

使用Ant Design组件库和Styled Components：

- 统一的设计语言
- 亮色/暗色主题支持
- 可定制的主题配置

### 交互反馈

丰富的交互反馈提高用户体验：

- 操作成功/失败提示
- 加载状态指示器
- 动画过渡效果
- 引导性提示

## 构建和部署

### 开发环境

```bash
# 启动开发服务器
npm run dev
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 环境配置

使用环境变量配置不同环境：

- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置

## 性能优化

- **代码分割**: 路由级别的代码分割
- **懒加载**: 组件和资源的按需加载
- **缓存策略**: API响应和资源缓存
- **图片优化**: 图片压缩和适当大小
- **虚拟列表**: 大数据列表的高效渲染

## 扩展性

前端设计考虑了可扩展性：

- **组件化设计**: 易于添加新功能
- **插件化结构**: 支持功能扩展
- **主题定制**: 支持UI定制和白标
- **国际化**: 内置多语言支持架构 