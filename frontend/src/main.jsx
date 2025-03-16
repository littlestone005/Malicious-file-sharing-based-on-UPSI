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

// 创建React根元素，并将其挂载到ID为'root'的DOM元素上
// 这个DOM元素在index.html中定义
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode是一个开发工具，用于突出显示应用中潜在问题
  // 它会执行额外的检查和警告，但只在开发模式下生效
  <React.StrictMode>
    {/* BrowserRouter提供路由上下文，使应用中的路由功能可用 */}
    <BrowserRouter>
      {/* App是应用的主组件，包含所有其他组件和路由配置 */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
) 