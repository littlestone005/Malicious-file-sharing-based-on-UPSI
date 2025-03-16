import React from 'react';
import styled from 'styled-components';
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
import { 
  HistoryOutlined, 
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  FileProtectOutlined
} from '@ant-design/icons';
import ScanHistory from '../components/ScanHistory';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const HistoryContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const StatsCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const StatisticItem = styled.div`
  text-align: center;
  padding: 16px;
`;

const HistoryPage = () => {
  // 示例统计数据
  const stats = {
    totalScans: 42,
    cleanFiles: 38,
    infectedFiles: 2,
    suspiciousFiles: 2,
    privacyProtected: 40,
  };
  
  return (
    <HistoryContainer>
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
      
      <Title level={2}>扫描历史</Title>
      <Paragraph>
        查看您之前的文件扫描记录和结果。您可以筛选、搜索和导出这些记录。
      </Paragraph>
      
      <StatsCard>
        <Title level={4}>扫描统计</Title>
        
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <StatisticItem>
              <Statistic 
                title="总扫描次数" 
                value={stats.totalScans} 
                prefix={<FileProtectOutlined />} 
              />
            </StatisticItem>
          </Col>
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
      
      <Tabs defaultActiveKey="all">
        <TabPane tab="所有记录" key="all">
          <ScanHistory />
        </TabPane>
        <TabPane tab="已检测到威胁" key="infected">
          {/* 这里可以传递过滤参数给ScanHistory组件 */}
          <ScanHistory />
        </TabPane>
        <TabPane tab="可疑文件" key="suspicious">
          <ScanHistory />
        </TabPane>
        <TabPane tab="安全文件" key="clean">
          <ScanHistory />
        </TabPane>
      </Tabs>
    </HistoryContainer>
  );
};

export default HistoryPage; 