# 示例代码

本目录包含系统使用示例和演示代码，用于展示系统功能和API的使用方法。

## 目录结构

```
examples/
├── api_usage/         # API使用示例
│   └── auth_example.py  # 身份验证API使用示例
├── sample_apps/       # 示例应用程序
│   └── simple_scanner.py # 简易文件扫描器应用
├── routers/           # 路由示例
├── services/          # 服务示例
└── utils/             # 工具函数示例
```

## API使用示例

### auth_example.py

展示如何使用系统API进行用户认证、获取用户信息和更新用户资料。

使用方法：
```bash
python backend/examples/api_usage/auth_example.py
```

## 示例应用程序

### simple_scanner.py

一个简单的GUI应用程序，展示如何集成API进行文件扫描和结果展示。

使用方法：
```bash
python backend/examples/sample_apps/simple_scanner.py
```

该应用演示了：
- 用户认证
- 文件选择和上传
- 隐私设置
- 扫描结果展示

## 注意事项

- 示例代码主要用于学习和参考，可能不包含完整的错误处理和生产级别的安全措施
- 在实际项目中使用时，请根据需要调整和增强代码
- 部分示例可能需要先启动后端服务才能正常运行 