/**
 * 应用程序入口文件
 * 
 * 这个文件是React应用的主入口点，负责初始化React应用并将其挂载到DOM中。
 * 它设置了应用的基本结构，包括React严格模式和路由系统。
 */

// 导入React核心库，用于创建和管理React组件
import React from 'react'
// 导入ReactDOM客户端渲染API，用于将React组件渲染到DOM中
import ReactDOM from 'react-dom/client'
// 导入BrowserRouter组件，提供基于HTML5 History API的路由功能
import { BrowserRouter } from 'react-router-dom'
// 导入应用的根组件
import App from './App.jsx'
// 导入全局样式
import './index.css'

// 创建React根元素，并将其挂载到id为'root'的DOM元素上（只返回第一个root元素）
// 这个DOM元素在index.html中定义
ReactDOM.createRoot(document.getElementById('root')).render(
  // 使用React.StrictMode组件包裹应用，用于检测可能的错误和警告
  <React.StrictMode>
    {/* BrowserRouter提供路由上下文，使应用中的路由功能可用 */}
    <BrowserRouter>
      {/* App是应用的主组件，包含所有其他组件和路由配置 */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
) 