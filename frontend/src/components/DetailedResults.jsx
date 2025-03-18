/**
 * 详细扫描结果组件
 * 
 * 这个组件展示单个文件的详细扫描结果，包括：
 * 1. 扫描状态摘要（安全、感染或可疑）
 * 2. 威胁等级和隐私保护信息
 * 3. 文件详细属性
 * 4. 建议操作
 * 5. 报告导出功能
 * 
 * 组件根据扫描结果动态调整显示内容和视觉样式
 */

import React, { useState } from 'react';
// 导入样式组件库
import styled from 'styled-components';
// 导入Ant Design组件
import { Card, Table, Tag, Button, Collapse, Typography, Tooltip, Progress, Divider } from 'antd';
// 导入Ant Design图标
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  InfoCircleOutlined,
  SafetyOutlined,
  LockOutlined,
  FileProtectOutlined,
  WarningOutlined
} from '@ant-design/icons';

// 从Typography组件中解构出需要的子组件
const { Title, Text, Paragraph } = Typography;
// 从Collapse组件中解构出Panel子组件
const { Panel } = Collapse;

/**
 * 结果卡片样式
 * 
 * 设置底部外边距、圆角和阴影效果
 * 增强卡片的视觉层次感
 */
const ResultCard = styled(Card)`
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

/**
 * 状态标签样式
 * 
 * 自定义Tag组件的字体大小、内边距和圆角
 * 使状态标签更加突出
 */
const StatusTag = styled(Tag)`
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
`;

/**
 * 结果头部样式
 * 
 * 使用flex布局使标题和状态标签分别位于左右两侧
 * 设置底部外边距
 */
const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

/**
 * 结果摘要容器样式
 * 
 * 使用flex布局和flex-wrap实现响应式布局
 * 设置间距和底部外边距
 */
const ResultSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
`;

/**
 * 摘要项目样式
 * 
 * 设置flex布局、最小宽度、内边距和背景色
 * 使用flex: 1确保项目平均分配空间
 * 居中对齐内容
 */
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

/**
 * 图标包装器样式
 * 
 * 设置图标大小、底部外边距和颜色
 * 通过props.color接收不同的颜色值
 */
const IconWrapper = styled.div`
  font-size: 24px;
  margin-bottom: 10px;
  color: ${props => props.color || 'var(--color-primary)'};
`;

/**
 * 隐私信息样式
 * 
 * 设置背景色、左侧边框、内边距、外边距和圆角
 * 用于突出显示隐私保护相关信息
 */
const PrivacyInfo = styled.div`
  background-color: rgba(24, 144, 255, 0.1);
  border-left: 4px solid var(--color-primary);
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
`;

/**
 * 详细扫描结果组件
 * 
 * @param {Object} props - 组件属性
 * @param {Object} props.scanResults - 扫描结果数据
 * @param {string} props.fileName - 文件名称
 * @returns {JSX.Element} 详细扫描结果组件
 */
const DetailedResults = ({ scanResults, fileName }) => {
  // 当前活动标签页状态
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
  
  /**
   * 根据扫描状态获取对应的颜色、图标和文本
   * 
   * @param {string} status - 扫描状态：'clean', 'infected', 'suspicious'
   * @returns {Object} 包含颜色、图标和文本的对象
   */
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
  
  // 获取当前扫描状态的信息
  const statusInfo = getStatusInfo(results.status);
  
  /**
   * 威胁等级对应的颜色映射
   * 从无威胁（绿色）到严重威胁（深红色）
   */
  const threatLevelColors = {
    none: '#52c41a',    // 绿色 - 无威胁
    low: '#faad14',     // 黄色 - 低威胁
    medium: '#fa8c16',  // 橙色 - 中等威胁
    high: '#f5222d',    // 红色 - 高威胁
    critical: '#a8071a' // 深红色 - 严重威胁
  };
  
  /**
   * 获取威胁等级对应的进度条百分比
   * 
   * @param {string} level - 威胁等级
   * @returns {number} 进度条百分比值
   */
  const getThreatProgress = (level) => {
    const levels = { none: 0, low: 25, medium: 50, high: 75, critical: 100 };
    return levels[level] || 0;
  };
  
  /**
   * 文件详情表格列配置
   */
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
  
  /**
   * 文件详情表格数据
   */
  const fileDetailsData = [
    { key: '1', property: '文件名', value: results.fileName },
    { key: '2', property: '文件大小', value: results.fileSize },
    { key: '3', property: '文件类型', value: results.fileType },
    { key: '4', property: '扫描时间', value: results.scanTime },
    { key: '5', property: '扫描持续时间', value: results.scanDuration },
    { key: '6', property: '检测方法', value: results.detectionMethod },
  ];
  
  /**
   * 根据扫描状态获取建议操作列表
   * 
   * @returns {Array} 建议操作文本数组
   */
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
        {/* 结果头部：标题和状态标签 */}
        <ResultHeader>
          <Title level={4}>扫描结果</Title>
          <StatusTag 
            icon={statusInfo.icon} 
            color={statusInfo.color}
          >
            {statusInfo.text}
          </StatusTag>
        </ResultHeader>
        
        {/* 结果摘要：威胁等级、隐私保护和检测结果 */}
        <ResultSummary>
          {/* 威胁等级项 */}
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
          
          {/* 隐私保护项 */}
          <SummaryItem>
            <IconWrapper color="var(--color-primary)">
              <LockOutlined />
            </IconWrapper>
            <Text strong>隐私保护</Text>
            <Text>{results.privacyProtected ? '已启用' : '未启用'}</Text>
          </SummaryItem>
          
          {/* 检测结果项 */}
          <SummaryItem>
            <IconWrapper color={results.status === 'clean' ? '#52c41a' : '#f5222d'}>
              <FileProtectOutlined />
            </IconWrapper>
            <Text strong>检测结果</Text>
            <Text>{results.threatName || '未检测到威胁'}</Text>
          </SummaryItem>
        </ResultSummary>
        
        {/* 隐私保护信息区域 */}
        <PrivacyInfo>
          <Text strong><InfoCircleOutlined /> 隐私保护信息</Text>
          <Paragraph style={{ marginTop: '8px' }}>
            使用PSI协议进行检测，您的文件内容和哈希值未被直接暴露。在{results.totalHashes.toLocaleString()}个已知恶意软件哈希中，
            {results.hashMatches > 0 
              ? `发现${results.hashMatches}个匹配项。` 
              : '未发现匹配项。'}
          </Paragraph>
        </PrivacyInfo>
        
        {/* 可折叠面板：文件详情和建议操作 */}
        <Collapse defaultActiveKey={['1']}>
          {/* 文件详情面板 */}
          <Panel header="文件详情" key="1">
            <Table 
              columns={fileDetailsColumns} 
              dataSource={fileDetailsData} 
              pagination={false}
              size="small"
            />
          </Panel>
          
          {/* 建议操作面板 */}
          <Panel header="建议操作" key="2">
            <ul>
              {getRecommendations().map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </Panel>
        </Collapse>
        
        <Divider />
        
        {/* 底部按钮区域 */}
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