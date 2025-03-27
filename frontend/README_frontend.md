# 基于UPSI的恶意文件检测系统 - 前端

基于React和Vite构建的前端应用程序，用于提供用户友好的恶意文件检测界面。

## 目录结构

```
frontend/
├── public/                # 静态资源
│   ├── favicon.ico       # 网站图标
│   └── images/           # 图片资源
├── src/                   # 源代码
│   ├── api/              # API请求
│   │   ├── auth.js       # 认证相关API
│   │   ├── detection.js  # 检测相关API
│   │   └── index.js      # API客户端设置
│   ├── components/       # 可复用组件
│   │   ├── FileUploader.jsx  # 文件上传组件
│   │   ├── LoginModal.jsx    # 登录模态框
│   │   ├── Header.jsx       # 页面头部组件
│   │   └── ScanResult.jsx  # 扫描结果组件
│   ├── contexts/         # React上下文
│   │   ├── AuthContext.jsx  # 认证上下文
│   │   └── ThemeContext.jsx # 主题上下文
│   ├── hooks/            # 自定义钩子
│   │   ├── useAuth.js    # 认证钩子
│   │   └── useDetection.js # 检测相关钩子
│   ├── pages/            # 页面组件
│   │   ├── HomePage.jsx  # 首页
│   │   ├── ScanPage.jsx  # 扫描页面
│   │   └── ResultsPage.jsx # 结果页面
│   ├── utils/            # 工具函数
│   │   ├── format.js     # 格式化工具
│   │   └── validation.js # 验证工具
│   ├── App.jsx           # 应用程序入口组件
│   └── main.jsx          # 主入口文件
├── tests/                # 测试文件
│   ├── components/       # 组件测试
│   └── pages/            # 页面测试
├── dist/                 # 构建输出目录
├── index.html            # HTML模板
├── package.json          # 项目依赖配置
├── vite.config.js        # Vite配置
└── .env                  # 环境变量
```

## 安装与设置

### 环境要求

- Node.js 14+ 
- npm 6+ 或 yarn 1.22+

### 安装依赖

```bash
# 使用npm
npm install

# 或使用yarn
yarn
```

### 开发环境启动

```bash
# 使用npm
npm run dev

# 或使用yarn
yarn dev
```

### 生产环境构建

```bash
# 使用npm
npm run build

# 或使用yarn
yarn build
```

## 配置

主要配置在`.env`文件中：

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_AUTH_STORAGE_KEY=upsi_auth
VITE_DEFAULT_PRIVACY=true
```

也可以通过创建`.env.local`覆盖这些设置。

## 主要功能

### 用户认证

由`AuthContext`提供全局认证状态管理：

- 用户登录/注册
- 记住登录状态
- 基于JWT的认证

### 文件上传与检测

`FileUploader`组件负责文件上传和扫描：

- 支持拖放
- 文件类型检查
- 大小限制
- 上传进度显示
- 隐私保护选项

### 结果展示

`ScanResult`组件展示检测结果：

- 威胁评分
- 详细分析结果
- 检测历史记录
- 导出报告

## 与后端API交互

前端使用Axios库与后端API交互，主要API模块：

### 认证API (api/auth.js)

```javascript
// 用户登录
login(username, password)

// 用户注册
register(username, email, password)

// 刷新token
refreshToken()

// 退出登录
logout()
```

### 检测API (api/detection.js)

```javascript
// 上传文件进行扫描
uploadFile(file, privateMode = true)

// 获取扫描结果
getScanResult(scanId)

// 获取扫描历史
getScanHistory(page = 1, limit = 10)

// 使用哈希值检测
detectHash(hash)
```

### API拦截器

前端配置了API拦截器处理：

- 自动添加认证令牌
- 令牌过期自动刷新
- 统一错误处理
- 请求/响应日志

## 最近更新

### 登录模态框集成

为改善用户体验，我们将登录功能改为模态框形式：

- 在`ScanPage`中集成`LoginModal`组件，当未登录用户尝试使用需要登录的功能时弹出
- `FileUploader`组件修改为接收`onLoginClick`回调，避免直接导航到登录页面
- 增加了记住登录状态功能

实现示例：

```jsx
// ScanPage.jsx
const ScanPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };
  
  return (
    <div className="scan-page">
      <h1>文件扫描</h1>
      <FileUploader 
        onLoginClick={handleLoginClick} 
        /* 其他属性 */
      />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};
```

### 性能优化

- 使用React.memo和useCallback减少不必要的重渲染
- 动态导入实现代码分割
- 资源延迟加载
- API结果缓存

### 响应式设计改进

- 适配移动设备
- CSS Grid和Flexbox布局
- 触控友好的操作

## 测试

测试文件位于`tests/`目录，使用Jest和React Testing Library：

```bash
# 运行所有测试
npm test

# 运行带有监视的测试
npm run test:watch
```

## 数据库交互

前端不直接与数据库交互，而是通过后端API进行所有数据操作：

1. **用户数据**：通过认证API和用户API管理
2. **扫描记录**：通过检测API进行查询和存储
3. **优化策略**：
   - 批量请求减少API调用次数
   - 客户端缓存减少重复请求
   - 分页加载提升性能

## 开发指南

### 添加新页面

1. 在`src/pages`创建新页面组件
2. 添加路由配置到`App.jsx`
3. 创建相关的API请求和状态管理

### 添加新组件

1. 在`src/components`创建新组件
2. 编写组件的单元测试
3. 在页面中使用组件

### 代码规范

- 使用ESLint和Prettier保持代码风格一致
- 组件使用函数式组件和Hooks
- 遵循React最佳实践

## 测试账号

- 测试用户: 用户名 `test`, 密码 `test123`
- 这些账号仅用于开发和测试环境，不应在生产环境中使用 