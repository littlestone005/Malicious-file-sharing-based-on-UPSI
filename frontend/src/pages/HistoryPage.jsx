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

import React from 'react';
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
  Divider
} from 'antd';
// 导入Ant Design图标
import { 
  HistoryOutlined, 
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  FileProtectOutlined
} from '@ant-design/icons';
// 导入扫描历史组件
import ScanHistory from '../components/ScanHistory';

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
  max-width: 1200px;
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
 * 扫描历史页面组件
 * 
 * 展示用户的扫描历史记录和统计数据
 * 
 * @returns {JSX.Element} 扫描历史页面组件
 */
const HistoryPage = () => {
  /**
   * 示例统计数据
   * 
   * 实际应用中应该从API获取
   * 包含总扫描次数、安全文件数、受感染文件数等信息
   */
  const stats = {
    totalScans: 42,
    cleanFiles: 38,
    infectedFiles: 2,
    suspiciousFiles: 2,
    privacyProtected: 40,
  };
  
  return (
    <HistoryContainer>
      {/* 面包屑导航 */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
          <span>首页</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <HistoryOutlined />
          <span>扫描历史</span>
        </Breadcrumb.Item>
      </Breadcrumb>
      
      {/* 页面标题和说明 */}
      <Title level={2}>扫描历史</Title>
      <Paragraph>
        查看您之前的文件扫描记录和结果。您可以筛选、搜索和导出这些记录。
      </Paragraph>
      
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
              />
            </StatisticItem>
          </Col>
        </Row>
        
        <Divider />
        
        {/* 隐私保护统计行 */}
        <Row>
          <Col span={24}>
            <StatisticItem>
              <Text>
                <FileProtectOutlined style={{ color: 'var(--color-primary)' }} /> 隐私保护扫描: 
                <Text strong> {stats.privacyProtected}</Text> / {stats.totalScans} ({Math.round(stats.privacyProtected / stats.totalScans * 100)}%)
              </Text>
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
        {/* 已检测到威胁标签页 */}
        <TabPane tab="已检测到威胁" key="infected">
          {/* 这里可以传递过滤参数给ScanHistory组件 */}
          <ScanHistory />
        </TabPane>
        {/* 可疑文件标签页 */}
        <TabPane tab="可疑文件" key="suspicious">
          <ScanHistory />
        </TabPane>
        {/* 安全文件标签页 */}
        <TabPane tab="安全文件" key="clean">
          <ScanHistory />
        </TabPane>
      </Tabs>
    </HistoryContainer>
  );
};

export default HistoryPage; 