import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, Table, Tag, Button, Collapse, Typography, Tooltip, Progress, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  InfoCircleOutlined,
  SafetyOutlined,
  LockOutlined,
  FileProtectOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const ResultCard = styled(Card)`
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const StatusTag = styled(Tag)`
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ResultSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
`;

const SummaryItem = styled.div`
  flex: 1;
  min-width: 200px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const IconWrapper = styled.div`
  font-size: 24px;
  margin-bottom: 10px;
  color: ${props => props.color || 'var(--color-primary)'};
`;

const PrivacyInfo = styled.div`
  background-color: rgba(24, 144, 255, 0.1);
  border-left: 4px solid var(--color-primary);
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
`;

const DetailedResults = ({ scanResults, fileName }) => {
  const [activeTab, setActiveTab] = useState('summary');
  
  // 示例数据 - 实际应用中应该从props接收
  const results = scanResults || {
    status: 'clean', // 'clean', 'infected', 'suspicious'
    fileName: fileName || 'example.exe',
    fileSize: '2.4 MB',
    scanTime: '2023-11-15 14:30:22',
    threatName: null,
    threatLevel: 'none', // 'none', 'low', 'medium', 'high', 'critical'
    privacyProtected: true,
    hashMatches: 0,
    totalHashes: 1000000,
    scanDuration: '1.2 秒',
    detectionMethod: 'PSI协议',
    fileType: 'Windows可执行文件',
    recommendations: [],
  };
  
  // 根据扫描状态确定颜色和图标
  const getStatusInfo = (status) => {
    switch(status) {
      case 'clean':
        return { 
          color: 'success', 
          icon: <CheckCircleOutlined />, 
          text: '安全' 
        };
      case 'infected':
        return { 
          color: 'error', 
          icon: <CloseCircleOutlined />, 
          text: '已检测到威胁' 
        };
      case 'suspicious':
        return { 
          color: 'warning', 
          icon: <WarningOutlined />, 
          text: '可疑' 
        };
      default:
        return { 
          color: 'default', 
          icon: <InfoCircleOutlined />, 
          text: '未知' 
        };
    }
  };
  
  const statusInfo = getStatusInfo(results.status);
  
  // 威胁等级对应的颜色
  const threatLevelColors = {
    none: '#52c41a',
    low: '#faad14',
    medium: '#fa8c16',
    high: '#f5222d',
    critical: '#a8071a'
  };
  
  // 威胁等级进度条
  const getThreatProgress = (level) => {
    const levels = { none: 0, low: 25, medium: 50, high: 75, critical: 100 };
    return levels[level] || 0;
  };
  
  // 文件详情表格列
  const fileDetailsColumns = [
    {
      title: '属性',
      dataIndex: 'property',
      key: 'property',
      width: '30%',
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
    },
  ];
  
  // 文件详情数据
  const fileDetailsData = [
    { key: '1', property: '文件名', value: results.fileName },
    { key: '2', property: '文件大小', value: results.fileSize },
    { key: '3', property: '文件类型', value: results.fileType },
    { key: '4', property: '扫描时间', value: results.scanTime },
    { key: '5', property: '扫描持续时间', value: results.scanDuration },
    { key: '6', property: '检测方法', value: results.detectionMethod },
  ];
  
  // 获取建议列表
  const getRecommendations = () => {
    if (results.status === 'clean') {
      return [
        '您的文件是安全的，无需采取任何操作。',
        '继续保持良好的安全习惯，定期扫描您的文件。'
      ];
    } else if (results.status === 'infected') {
      return [
        '立即隔离或删除受感染的文件。',
        '运行完整的系统扫描以检查其他可能的感染。',
        '更新您的防病毒软件和操作系统。',
        '检查您最近下载的其他文件。'
      ];
    } else {
      return [
        '谨慎处理此文件，建议在隔离环境中运行。',
        '如果不确定，请勿打开此文件。',
        '考虑提交给专业安全分析。'
      ];
    }
  };
  
  return (
    <div>
      <ResultCard>
        <ResultHeader>
          <Title level={4}>扫描结果</Title>
          <StatusTag 
            icon={statusInfo.icon} 
            color={statusInfo.color}
          >
            {statusInfo.text}
          </StatusTag>
        </ResultHeader>
        
        <ResultSummary>
          <SummaryItem>
            <IconWrapper color={threatLevelColors[results.threatLevel]}>
              <SafetyOutlined />
            </IconWrapper>
            <Text strong>威胁等级</Text>
            <Progress 
              percent={getThreatProgress(results.threatLevel)} 
              showInfo={false} 
              strokeColor={threatLevelColors[results.threatLevel]}
              size="small"
              style={{ width: '80%', marginTop: '8px' }}
            />
            <Text>{results.threatLevel === 'none' ? '无威胁' : results.threatLevel}</Text>
          </SummaryItem>
          
          <SummaryItem>
            <IconWrapper color="var(--color-primary)">
              <LockOutlined />
            </IconWrapper>
            <Text strong>隐私保护</Text>
            <Text>{results.privacyProtected ? '已启用' : '未启用'}</Text>
          </SummaryItem>
          
          <SummaryItem>
            <IconWrapper color={results.status === 'clean' ? '#52c41a' : '#f5222d'}>
              <FileProtectOutlined />
            </IconWrapper>
            <Text strong>检测结果</Text>
            <Text>{results.threatName || '未检测到威胁'}</Text>
          </SummaryItem>
        </ResultSummary>
        
        <PrivacyInfo>
          <Text strong><InfoCircleOutlined /> 隐私保护信息</Text>
          <Paragraph style={{ marginTop: '8px' }}>
            使用PSI协议进行检测，您的文件内容和哈希值未被直接暴露。在{results.totalHashes.toLocaleString()}个已知恶意软件哈希中，
            {results.hashMatches > 0 
              ? `发现${results.hashMatches}个匹配项。` 
              : '未发现匹配项。'}
          </Paragraph>
        </PrivacyInfo>
        
        <Collapse defaultActiveKey={['1']}>
          <Panel header="文件详情" key="1">
            <Table 
              columns={fileDetailsColumns} 
              dataSource={fileDetailsData} 
              pagination={false}
              size="small"
            />
          </Panel>
          
          <Panel header="建议操作" key="2">
            <ul>
              {getRecommendations().map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </Panel>
        </Collapse>
        
        <Divider />
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button type="default">
            导出报告
          </Button>
          <Button type="primary">
            返回
          </Button>
        </div>
      </ResultCard>
    </div>
  );
};

export default DetailedResults; 