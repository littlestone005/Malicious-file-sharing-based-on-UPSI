/**
 * Vite配置文件
 * 
 * 这个文件定义了Vite构建工具的配置选项，包括：
 * 1. 插件配置
 * 2. 开发服务器设置
 * 3. API代理配置
 * 
 * Vite是一个现代前端构建工具，提供了更快的开发服务器启动和热模块替换(HMR)
 */

// 导入Vite的defineConfig函数，用于提供类型提示和自动补全
import { defineConfig } from 'vite'
// 导入React插件，使Vite能够处理JSX语法和React特性
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // 配置Vite插件
  plugins: [
    // 启用React插件，支持React组件的编译和热更新
    react()
  ],
  
  // 开发服务器配置
  server: {
    // 设置开发服务器端口为3000
    port: 3000,
    
    // API代理配置
    // 用于在开发环境中解决跨域问题
    proxy: {
      // 所有以/api开头的请求将被代理
      '/api': {
        // 目标服务器地址，这里是本地后端服务
        target: 'http://localhost:8000',
        // 更改请求头中的Origin，解决CORS问题
        changeOrigin: true,
        // 不验证SSL证书，用于开发环境
        secure: false,
      }
    }
  }
}) 