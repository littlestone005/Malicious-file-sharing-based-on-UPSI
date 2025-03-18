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
import React, { useState, createContext, useEffect } from 'react'
// 导入路由相关组件
import { Routes, Route } from 'react-router-dom'
// 导入Ant Design组件和主题
import { ConfigProvider, theme, Spin } from 'antd'
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
 * 主题配置，使用暗色主题算法
 */
const themeConfig = {
  token: {
    colorPrimary: '#1a5fb4',   // 深蓝色，代表安全感
    colorSuccess: '#2ec27e',  // 绿色，代表安全状态
    colorError: '#e01b24',   // 红色，代表危险/警告
    borderRadius: 8,
  },
  algorithm: theme.darkAlgorithm, // 暗色主题
};

/**
 * 应用容器样式组件
 */
const AppContainer = styled.div`
  min-height: 100vh;         // 确保整个应用至少有视口高度
  display: flex;            // 使用弹性布局
  flex-direction: column;  // 垂直方向排列
`;

/**
 * 内容区容器样式组件
 */
const ContentContainer = styled.main`
  flex: 1;
  padding: 20px;      // 内边距
  max-width: 1200px; // 最大宽度
  margin: 0 auto;   // 居中
  width: 100%;     // 宽度100%
`;

/**
 * 加载中容器样式组件
 */
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #141414;
`;

/**
 * 本地存储键名
 */
const USER_STORAGE_KEY = 'upsi_user_data';

/**
 * 应用主组件
 * 管理全局状态并构建应用的基本结构
 */
function App() {
  // 用户状态，存储当前登录用户的信息
  const [user, setUser] = useState(null);
  // 授权加载状态，控制初始加载时的UI显示
  const [authLoading, setAuthLoading] = useState(true);
  // 扫描结果状态，存储最近一次扫描的结果
  const [scanResults, setScanResults] = useState(null);

  /**
   * 设置用户并保存到本地存储
   * 
   * @param {Object|null} userData - 用户数据或null（登出时）
   */
  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      // 用户登录，保存用户数据到本地存储
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } else {
      // 用户登出，从本地存储中移除用户数据
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  /**
   * 从本地存储恢复用户会话
   * 
   * 在组件挂载时执行一次，尝试从localStorage恢复用户状态
   */
  useEffect(() => {
    const restoreUserSession = () => {
      // 从本地存储中获取用户数据
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      
      try {
        // 如果存在数据且可以解析，则恢复用户状态
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to restore user session:', error);
        // 如果解析失败，清除可能损坏的数据
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        // 无论成功与否，都将加载状态设置为false
        setAuthLoading(false);
      }
    };

    // 短暂延迟以确保页面过渡平滑
    const timer = setTimeout(() => {
      restoreUserSession();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // 如果认证状态正在加载，显示加载界面
  if (authLoading) {
    return (
      <LoadingContainer>
        <Spin size="large" tip="正在加载..." />
      </LoadingContainer>
    );
  }

  return (
    // 提供用户上下文，使所有子组件都能访问用户状态
    <UserContext.Provider value={{ user, setUser: handleSetUser }}>
      <ConfigProvider theme={themeConfig}>        {/* 配置Ant Design主题 */}
        <AppContainer>                            {/* 应用主容器 */}
          <Header />                              {/* 页面头部，包含导航和用户信息 */}
          <ContentContainer>                      {/* 内容区域，包含所有页面路由 */}
            
            <Routes>                              {/* 路由配置，定义URL路径与页面组件的映射关系 */}
              <Route path="/" element={<HomePage />} />                 {/* 首页路由 */}
              <Route path="/scan" element={<ScanPage setScanResults={setScanResults} />} />               {/* 扫描页面路由，传入setScanResults函数以便更新扫描结果 */}
              <Route path="/settings" element={<UserSettingsPage />} />                     {/* 用户设置页面路由 */}
              <Route path="/history" element={<HistoryPage />} />                           {/* 历史记录页面路由 */}
              <Route path="/results/:scanId" element={<ResultsPage scanResults={scanResults} />} />       {/* 结果页面路由，接收scanId参数并传入scanResults */}
              <Route path="/about" element={<AboutPage />} />           {/* 关于页面路由 */}
            </Routes>
            
          </ContentContainer>
          <Footer />                               {/* 页面底部，包含版权信息等 */}
        </AppContainer>
      </ConfigProvider>
    </UserContext.Provider>
  )
}

// 导出App组件，使其可以在main.jsx中使用
export default App 