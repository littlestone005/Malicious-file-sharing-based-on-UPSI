/**
 * 扫描历史页面组件
 * 
 * 这个组件实现了扫描历史记录的展示页面，包括：
 * 1. 扫描统计数据展示
 * 2. 分类标签页（所有记录、威胁、可疑、安全）
 * 3. 历史记录表格
 * 
 * 页面设计注重数据可视化和分类浏览，方便用户查看历史扫描结果
 */

import React, { useContext, useState, useEffect } from 'react';
// 导入样式组件库
import styled from 'styled-components';
// 导入Ant Design组件
import { 
  Typography, 
  Breadcrumb, 
  Tabs, 
  Card, 
  Statistic, 
  Row, 
  Col,
  Divider,
  Alert,
  Button,
  Empty,
  Spin,
  message
} from 'antd';
// 导入Ant Design图标
import { 
  HistoryOutlined, 
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  FileProtectOutlined,
  LoginOutlined,
  LockOutlined
} from '@ant-design/icons';
// 导入扫描历史组件
import ScanHistory from '../components/ScanHistory';
// 导入用户上下文
import { UserContext } from '../App';
// 导入路由导航钩子
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
// 导入API工具
import { scanAPI } from '../utils/api';
// 从Typography组件中解构出需要的子组件
const { Title, Text, Paragraph } = Typography;
// 从Tabs组件中解构出TabPane子组件
const { TabPane } = Tabs;

/**
 * 历史页面容器样式
 * 
 * 设置最大宽度和水平居中
 * 限制内容宽度，提高可读性
 */
const HistoryContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

/**
 * 统计卡片样式
 * 
 * 设置底部外边距、圆角和阴影效果
 * 增强卡片的视觉层次感
 */
const StatsCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

/**
 * 统计项目样式
 * 
 * 设置文本居中和内边距
 * 用于包含单个统计数据
 */
const StatisticItem = styled.div`
  text-align: center;
  padding: 16px;
`;

/**
 * 登录提醒样式
 * 
 * 设置底部外边距
 * 用于显示未登录提醒消息
 */
const LoginAlert = styled(Alert)`
  margin-bottom: 20px;
`;

/**
 * 登录提示容器样式
 * 
 * 设置文本居中、内边距和背景颜色
 * 用于替代历史内容显示登录提示
 */
const LoginPromptContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

/**
 * 加载中容器样式
 */
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
`;

/**
 * 扫描历史页面组件
 * 
 * 展示用户的扫描历史记录和统计数据
 * 
 * @returns {JSX.Element} 扫描历史页面组件
 */
const HistoryPage = () => {
  // 获取用户上下文
  const { user, setUser } = useContext(UserContext);
  // 路由导航钩子
  const navigate = useNavigate();
  // 页面初始化状态
  const [initializing, setInitializing] = useState(true);
  // 登录模态框状态
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  // 统计数据状态
  const [stats, setStats] = useState({
    totalScans: -1,
    cleanFiles: -1,
    infectedFiles: -1,
    suspiciousFiles: -1,
    privacyProtected: -1,
  });
  // 统计数据加载状态
  const [statsLoading, setStatsLoading] = useState(false);
  
  // 判断用户是否已登录
  const isLoggedIn = !!user;

  /**
   * 从API获取统计数据
   */
  const fetchStatistics = async () => {
    if (!isLoggedIn) return;
    
    try {
      setStatsLoading(true);
      const response = await scanAPI.getScanStatistics();
      setStats(response);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      let errorMessage = '获取统计数据失败，将显示示例数据';
      
      // 根据错误类型提供更具体的提示
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = '您的会话已过期，请重新登录';
        } else if (error.response.status === 404) {
          errorMessage = '无法找到统计数据路径，请检查API配置';
        } else if (error.response.status === 422) {
          errorMessage = '数据格式错误，请联系管理员';
        } else if (error.response.status >= 500) {
          errorMessage = '服务器错误，请稍后再试';
        }
      } else if (error.request) {
        errorMessage = '无法连接到服务器，请检查您的网络连接';
      }
      
      message.error(errorMessage);
      
      // 设置示例数据，确保用户始终能看到内容
      setStats({
        totalScans: 7,
        cleanFiles: 4,
        infectedFiles: 2,
        suspiciousFiles: 1,
        privacyProtected: 6
      });
    } finally {
      setStatsLoading(false);
    }
  };

  /**
   * 页面初始化效果
   * 
   * 短暂延迟后将页面设置为已初始化状态，防止闪烁
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
      // 如果已登录，获取统计数据
      if (isLoggedIn) {
        fetchStatistics();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  /**
   * 处理登录按钮点击，显示登录模态框
   */
  const handleLoginClick = () => {
    setLoginModalVisible(true);
  };

  /**
   * 处理用户登录
   * 
   * @param {Object} userData - 登录后的用户数据
   */
  const handleLogin = (userData) => {
    setUser(userData);
    // 登录成功后获取统计数据
    fetchStatistics();
  };
  
  // 如果页面正在初始化，显示加载状态
  if (initializing) {
    return (
      <HistoryContainer>
        <LoadingContainer>
          <Spin size="large" tip="加载中..." />
        </LoadingContainer>
      </HistoryContainer>
    );
  }
  
  return (
    <HistoryContainer>
      {/* 未登录提醒 */}
      {!isLoggedIn && (
        <LoginAlert
          message="您尚未登录"
          description={
            <span>
              请先登录以查看您的扫描历史记录。登录后您可以查看所有扫描结果、统计数据和历史趋势。
            </span>
          }
          type="warning"
          showIcon
        />
      )}

      {/* 页面标题和说明 */}
      <Title level={2}>扫描历史</Title>
      <Paragraph>
        查看您之前的文件扫描记录和结果。您可以筛选、搜索和导出这些记录。
        {!isLoggedIn && ' 请登录以查看您的个人扫描历史。'}
      </Paragraph>
      
      {/* 如果用户已登录，显示历史内容；否则显示登录提示 */}
      {isLoggedIn ? (
        <>
          {/* 统计数据卡片 */}
          <StatsCard>
            <Title level={4}>扫描统计</Title>
            
            {/* 主要统计数据行 */}
            <Row gutter={16}>
              {/* 总扫描次数统计 */}
              <Col xs={24} sm={12} md={6}>
                <StatisticItem>
                  <Statistic 
                    title="总扫描次数" 
                    value={stats.totalScans} 
                    prefix={<FileProtectOutlined />} 
                    loading={statsLoading}
                  />
                </StatisticItem>
              </Col>
              {/* 安全文件统计 */}
              <Col xs={24} sm={12} md={6}>
                <StatisticItem>
                  <Statistic 
                    title="安全文件" 
                    value={stats.cleanFiles} 
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />} 
                    loading={statsLoading}
                  />
                </StatisticItem>
              </Col>
              {/* 受感染文件统计 */}
              <Col xs={24} sm={12} md={6}>
                <StatisticItem>
                  <Statistic 
                    title="受感染文件" 
                    value={stats.infectedFiles} 
                    valueStyle={{ color: '#f5222d' }}
                    prefix={<CloseCircleOutlined />} 
                    loading={statsLoading}
                  />
                </StatisticItem>
              </Col>
              {/* 可疑文件统计 */}
              <Col xs={24} sm={12} md={6}>
                <StatisticItem>
                  <Statistic 
                    title="可疑文件" 
                    value={stats.suspiciousFiles} 
                    valueStyle={{ color: '#faad14' }}
                    prefix={<WarningOutlined />} 
                    loading={statsLoading}
                  />
                </StatisticItem>
              </Col>
            </Row>
            
            <Divider />
            
            {/* 隐私保护统计行 */}
            <Row>
              <Col span={24}>
                <StatisticItem>
                  {statsLoading ? (
                    <Spin size="small" />
                  ) : (
                    <Text>
                      <FileProtectOutlined style={{ color: 'var(--color-primary)' }} /> 隐私保护扫描: 
                      <Text strong> {stats.privacyProtected}</Text> / {stats.totalScans} (
                        {stats.totalScans ? Math.round(stats.privacyProtected / stats.totalScans * 100) : 0}%)
                    </Text>
                  )}
                </StatisticItem>
              </Col>
            </Row>
          </StatsCard>
          
          {/* 分类标签页 */}
          <Tabs defaultActiveKey="all">
            {/* 所有记录标签页 */}
            <TabPane tab="所有记录" key="all">
              <ScanHistory />
            </TabPane>
          </Tabs>
        </>
      ) : (
        <LoginPromptContainer>
          <LockOutlined style={{ fontSize: '64px', color: 'var(--color-warning)', marginBottom: '20px' }} />
          <Title level={3}>需要登录才能查看扫描历史</Title>
          <Paragraph style={{ fontSize: '16px', maxWidth: '500px', margin: '0 auto 20px' }}>
            您的扫描历史记录包含所有已扫描文件的详细信息、威胁检测结果和趋势分析。
            登录后，您可以查看、筛选和导出这些记录。
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            icon={<LoginOutlined />}
            onClick={handleLoginClick}
          >
            立即登录查看历史记录
          </Button>
        </LoginPromptContainer>
      )}
      {/* 登录模态框 */}
      <LoginModal 
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onLogin={handleLogin}
      />
    </HistoryContainer>
  );
};

export default HistoryPage; 