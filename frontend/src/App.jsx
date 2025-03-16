/**
 * 应用程序根组件
 * 
 * 这个文件定义了应用的主要结构和布局，包括：
 * 1. 全局状态管理（用户上下文）
 * 2. 主题配置
 * 3. 路由设置
 * 4. 基本布局结构（头部、内容区、底部）
 */

// 导入React核心库和必要的钩子
import React, { useState, createContext } from 'react'
// 导入路由相关组件
import { Routes, Route } from 'react-router-dom'
// 导入Ant Design组件和主题
import { ConfigProvider, theme } from 'antd'
// 导入样式组件库
import styled from 'styled-components'

// 导入布局组件
import Header from './components/Header'
import Footer from './components/Footer'

// 导入页面组件
import HomePage from './pages/HomePage'
import ScanPage from './pages/ScanPage'
import ResultsPage from './pages/ResultsPage'
import AboutPage from './pages/AboutPage'
import UserSettingsPage from './pages/UserSettingsPage'
import HistoryPage from './pages/HistoryPage'

/**
 * 创建用户上下文
 * 
 * 这个上下文用于在整个应用中共享用户状态，
 * 使得任何组件都可以访问和修改用户信息，而不需要通过props传递
 */
export const UserContext = createContext(null);

/**
 * 主题配置
 * 
 * 定义应用的颜色方案和视觉风格
 * - colorPrimary: 主色调，用于强调和品牌识别
 * - colorSuccess: 成功状态的颜色，用于安全文件指示
 * - colorError: 错误状态的颜色，用于危险/警告指示
 * - borderRadius: 边框圆角大小
 * 
 * 使用暗色主题算法，营造安全感和专业感
 */
const themeConfig = {
  token: {
    colorPrimary: '#1a5fb4', // 深蓝色，代表安全感
    colorSuccess: '#2ec27e', // 绿色，代表安全状态
    colorError: '#e01b24',   // 红色，代表危险/警告
    borderRadius: 8,
  },
  algorithm: theme.darkAlgorithm, // 暗色主题，增强安全感
};

/**
 * 应用容器样式组件
 * 
 * 设置应用的最小高度为视口高度，
 * 使用flex布局确保即使内容较少，页脚也会固定在底部
 */
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

/**
 * 内容区容器样式组件
 * 
 * 设置内容区域的样式：
 * - flex: 1 使其占据除头部和底部外的所有空间
 * - padding: 内边距
 * - max-width: 最大宽度限制，确保在大屏幕上内容不会过宽
 * - margin: 水平居中
 */
const ContentContainer = styled.main`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

/**
 * 应用主组件
 * 
 * 管理全局状态并构建应用的基本结构
 */
function App() {
  // 用户状态，存储当前登录用户的信息
  const [user, setUser] = useState(null);
  // 扫描结果状态，存储最近一次扫描的结果
  const [scanResults, setScanResults] = useState(null);

  return (
    // 提供用户上下文，使所有子组件都能访问用户状态
    <UserContext.Provider value={{ user, setUser }}>
      {/* 配置Ant Design主题 */}
      <ConfigProvider theme={themeConfig}>
        {/* 应用主容器 */}
        <AppContainer>
          {/* 页面头部，包含导航和用户信息 */}
          <Header />
          {/* 内容区域，包含所有页面路由 */}
          <ContentContainer>
            {/* 路由配置，定义URL路径与页面组件的映射关系 */}
            <Routes>
              {/* 首页路由 */}
              <Route path="/" element={<HomePage />} />
              {/* 扫描页面路由，传入setScanResults函数以便更新扫描结果 */}
              <Route path="/scan" element={<ScanPage setScanResults={setScanResults} />} />
              {/* 用户设置页面路由 */}
              <Route path="/settings" element={<UserSettingsPage />} />
              {/* 历史记录页面路由 */}
              <Route path="/history" element={<HistoryPage />} />
              {/* 结果页面路由，接收scanId参数并传入scanResults */}
              <Route path="/results/:scanId" element={<ResultsPage scanResults={scanResults} />} />
              {/* 关于页面路由 */}
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </ContentContainer>
          {/* 页面底部，包含版权信息等 */}
          <Footer />
        </AppContainer>
      </ConfigProvider>
    </UserContext.Provider>
  )
}

// 导出App组件，使其可以在main.jsx中使用
export default App 