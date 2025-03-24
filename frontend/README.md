# 基于UPSI的恶意文件检测系统 - 前端

基于React的前端应用，提供用户友好的界面进行文件上传、检测和结果查看。

## 目录结构

```
frontend/
├── src/                    # 源代码目录
│   ├── components/         # React组件
│   │   ├── Header.jsx     # 页面头部组件
│   │   ├── LoginModal.jsx # 登录模态框组件
│   │   └── FileUpload.jsx # 文件上传组件
│   ├── pages/             # 页面组件
│   │   ├── Home.jsx       # 首页
│   │   └── Results.jsx    # 结果页
│   ├── utils/             # 工具函数
│   │   └── api.js         # API请求封装
│   ├── contexts/          # React上下文
│   │   └── UserContext.jsx # 用户上下文
│   └── App.jsx            # 主应用组件
├── public/                 # 静态资源
│   └── favicon.ico        # 网站图标
├── package.json           # 项目依赖配置
└── vite.config.js         # Vite配置文件
```

## 安装与设置

### 环境要求

- Node.js 16+
- npm 7+

### 安装依赖

```bash
npm install
```

### 配置

在`.env`文件中可以设置环境变量，主要配置项：

- `VITE_API_BASE_URL`: API基础URL，默认为`http://localhost:8000/api/v1`

## 运行开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 上运行。

## 构建生产版本

```bash
npm run build
```

构建后的文件将位于`dist`目录中。

## 主要功能

### 用户认证
- 登录/注册模态框
- 个人/企业账户类型
- 会话管理

### 文件上传
- 拖放文件上传
- 多文件支持
- 文件类型验证

### 扫描控制
- 隐私模式切换（PSI启用/禁用）
- 扫描进度指示
- 失败重试

### 结果展示
- 扫描结果可视化
- 恶意文件高亮显示
- 详细威胁信息

## 开发指南

### 添加新组件

1. 在`src/components/`目录下创建组件文件
2. 导入并使用所需的依赖
3. 导出组件并在适当的地方导入使用

### 添加新页面

1. 在`src/pages/`目录下创建页面组件
2. 在`App.jsx`中定义相应的路由
3. 确保页面组件正确连接到相关API

### 样式指南

使用styled-components进行组件样式设计，保持一致的设计语言：

- 主色：#1890ff（蓝色）
- 成功色：#52c41a（绿色）
- 警告色：#faad14（黄色）
- 错误色：#f5222d（红色）

## 演示功能

- 示例用户账号: 用户名 `testuser`, 密码 `test123`
- 预置的文件哈希示例，可以用于测试检测功能 