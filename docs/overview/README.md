# 项目概述文档

本目录包含基于UPSI的恶意文件检测系统的概述文档，帮助开发者和用户快速了解项目的整体情况。

## 文档列表

- [**项目设计说明**](project_notes.md) - 详细介绍系统设计思路、技术亮点和核心功能
- [**目录结构**](directory_structure.md) - 项目文件和目录组织的详细说明
- [**技术栈**](#技术栈) - 项目使用的核心技术和框架

## 技术栈

### 前端技术

- **React**: 用于构建用户界面
- **Ant Design**: 提供现代化UI组件
- **React Router**: 实现页面路由
- **Axios**: 处理API请求
- **Styled Components**: CSS样式组件
- **Vite**: 用于构建和开发

### 后端技术

- **FastAPI**: 高性能Web框架
- **SQLAlchemy**: ORM数据库管理
- **Pydantic**: 数据验证和序列化
- **JWT认证**: 安全的用户认证
- **异步处理**: 高效处理并发请求

### 算法技术

- **非平衡PSI协议**: 保护用户隐私的核心技术
- **特征提取算法**: 高效提取文件特征
- **机器学习增强**: 提高检测准确率

## 系统架构简介

该系统由三个主要部分组成:

1. **前端**: 基于React和Ant Design的用户界面
2. **后端**: 使用FastAPI的API服务
3. **算法模块**: PSI算法实现

各模块之间的关系和数据流如下：

```
用户 <-> 前端UI <-> 后端API <-> 算法模块 <-> 数据库
```

## 快速链接

- [项目主页](../../README.md)
- [后端文档](../components/backend.md)
- [前端文档](../components/frontend.md)
- [算法文档](../components/algorithm.md)
- [数据库文档](../database/database.md) 