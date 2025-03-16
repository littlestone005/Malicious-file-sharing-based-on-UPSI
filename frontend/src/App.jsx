import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import styled from 'styled-components'

// Components
import Header from './components/Header'
import Footer from './components/Footer'

// Pages
import HomePage from './pages/HomePage'
import ScanPage from './pages/ScanPage'
import ResultsPage from './pages/ResultsPage'
import AboutPage from './pages/AboutPage'
import UserSettingsPage from './pages/UserSettingsPage'
import HistoryPage from './pages/HistoryPage'

// Theme configuration
const themeConfig = {
  token: {
    colorPrimary: '#1a5fb4', // Deep blue for security
    colorSuccess: '#2ec27e', // Green for safe status
    colorError: '#e01b24',   // Red for danger/warning
    borderRadius: 8,
  },
  algorithm: theme.darkAlgorithm, // Dark theme for security feel
};

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.main`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <AppContainer>
        <Header />
        <ContentContainer>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/settings" element={<UserSettingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/results/:scanId" element={<ResultsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </ContentContainer>
        <Footer />
      </AppContainer>
    </ConfigProvider>
  )
}

export default App 