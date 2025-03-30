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
import { Card, Table, Tag, Button, Collapse, Typography, Tooltip, Progress, Divider, message } from 'antd';
// 导入Ant Design图标
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  InfoCircleOutlined,
  SafetyOutlined,
  LockOutlined,
  FileProtectOutlined,
  WarningOutlined,
  CopyOutlined,
  BankOutlined
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
  background-color:rgb(42, 39, 39);
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
 * @param {Object} props.results - 扫描结果数据
 * @param {boolean} props.isEnterpriseUser - 是否为企业用户
 * @returns {JSX.Element} 详细扫描结果组件
 */
const DetailedResults = ({ results, isEnterpriseUser }) => {
  // 当前活动标签页状态
  const [activeTab, setActiveTab] = useState('summary');
  
  // 确保results数据存在
  if (!results || !results.fileResults || results.fileResults.length === 0) {
    return (
      <Card>
        <Text>没有可用的扫描结果详情</Text>
      </Card>
    );
  }
  
  // 获取第一个文件的结果，用于单文件扫描详情
  const fileResult = results.fileResults[0];
  
  // 确定扫描状态
  let status = 'clean';
  if (fileResult.status === 'malicious') {
    status = fileResult.threatType ? 'infected' : 'suspicious';
  }
  
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
  const statusInfo = getStatusInfo(status);
  
  // 获取威胁等级
  const getThreatLevel = () => {
    if (status === 'clean') return 'none';
    if (results.enterpriseDetails?.riskLevel) {
      const riskLevel = results.enterpriseDetails.riskLevel.toLowerCase();
      return ['low', 'medium', 'high', 'critical'].includes(riskLevel) ? riskLevel : 'medium';
    }
    return status === 'infected' ? 'high' : 'medium';
  };
  
  const threatLevel = getThreatLevel();
  
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
   * 复制内容到剪贴板
   */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('已复制到剪贴板');
      },
      () => {
        message.error('复制失败，请手动复制');
      }
    );
  };
  
  // 构建文件详情数据
  const fileDetailsData = [
    { key: '1', property: '文件名', value: fileResult.fileName },
    { key: '2', property: '文件大小', value: typeof fileResult.fileSize === 'number' ? 
      `${(fileResult.fileSize / (1024 * 1024)).toFixed(2)} MB` : fileResult.fileSize },
    { key: '3', property: '文件类型', value: fileResult.fileType || getFileTypeFromName(fileResult.fileName) },
    { key: '4', property: '扫描时间', value: new Date(results.timestamp).toLocaleString() },
    { key: '5', property: '检测方法', value: fileResult.detectionMethod || '标准扫描' },
    { key: '6', property: 'SHA-256哈希值', value: fileResult.fileHash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
  ];
  
  /**
   * 从文件名获取文件类型
   * 
   * @param {string} fileName - 文件名
   * @returns {string} 文件类型描述
   */
  function getFileTypeFromName(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const fileTypes = {
      'pdf': 'PDF文档',
      'doc': 'Word文档',
      'docx': 'Word文档',
      'xls': 'Excel表格',
      'xlsx': 'Excel表格',
      'ppt': 'PowerPoint演示文稿',
      'pptx': 'PowerPoint演示文稿',
      'txt': '文本文件',
      'jpg': '图像文件',
      'jpeg': '图像文件',
      'png': '图像文件',
      'gif': '图像文件',
      'mp3': '音频文件',
      'mp4': '视频文件',
      'zip': '压缩文件',
      'rar': '压缩文件',
      'exe': '可执行文件',
      'dll': '动态链接库',
      'js': 'JavaScript文件',
      'py': 'Python文件',
      'html': 'HTML文件',
      'css': 'CSS文件'
    };
    
    return fileTypes[extension] || `${extension.toUpperCase()}文件`;
  }
  
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
      render: (text, record) => {
        // 为哈希值添加特殊处理
        if (record.property === 'SHA-256哈希值') {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text code ellipsis style={{ maxWidth: '300px' }}>{text}</Text>
              {text && text !== "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" && (
                <Tooltip title="复制哈希值">
                  <Button 
                    type="text" 
                    icon={<CopyOutlined />} 
                    size="small" 
                    onClick={() => copyToClipboard(text)}
                    style={{ marginLeft: 8 }}
                  />
                </Tooltip>
              )}
            </div>
          );
        }
        return text;
      },
    },
  ];
  
  /**
   * 根据扫描状态获取建议操作列表
   * 
   * @returns {Array} 建议操作文本数组
   */
  const getRecommendations = () => {
    // 如果有企业版的推荐操作，使用它们
    if (results.enterpriseDetails?.recommendedActions?.length > 0) {
      return results.enterpriseDetails.recommendedActions;
    }
    
    // 否则根据状态提供默认建议
    if (status === 'clean') {
      return [
        '您的文件是安全的，无需采取任何操作。',
        '继续保持良好的安全习惯，定期扫描您的文件。'
      ];
    } else if (status === 'infected') {
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
            <IconWrapper color={threatLevelColors[threatLevel]}>
              <SafetyOutlined />
            </IconWrapper>
            <Text strong>威胁等级</Text>
            <Progress 
              percent={getThreatProgress(threatLevel)} 
              showInfo={false} 
              strokeColor={threatLevelColors[threatLevel]}
              size="small"
              style={{ width: '80%', marginTop: '8px' }}
            />
            <Text style={{ textTransform: 'capitalize' }}>
              {threatLevel === 'none' ? '无威胁' : 
                threatLevel === 'low' ? '低' :
                threatLevel === 'medium' ? '中' :
                threatLevel === 'high' ? '高' : '严重'}
            </Text>
          </SummaryItem>
          
          {/* 隐私保护项 */}
          <SummaryItem>
            <IconWrapper color="var(--color-primary)">
              <LockOutlined />
            </IconWrapper>
            <Text strong>隐私保护</Text>
            <Text>{results.usedPSI ? '已启用' : '未启用'}</Text>
          </SummaryItem>
          
          {/* 检测结果项 */}
          <SummaryItem>
            <IconWrapper color={status === 'clean' ? '#52c41a' : '#f5222d'}>
              <FileProtectOutlined />
            </IconWrapper>
            <Text strong>检测结果</Text>
            <Text>{fileResult.threatType || (status !== 'clean' ? '未知威胁' : '未检测到威胁')}</Text>
          </SummaryItem>
        </ResultSummary>
        
        {/* 隐私保护信息区域 */}
        {results.usedPSI && (
          <PrivacyInfo>
            <Text strong><InfoCircleOutlined /> 隐私保护信息</Text>
            <Paragraph style={{ marginTop: '8px' }}>
              使用PSI协议进行检测，您的文件内容和哈希值未被直接暴露。
              {status !== 'clean' 
                ? ' 系统检测到文件可能存在风险，但您的隐私得到了保护。' 
                : ' 您的文件安全且隐私得到了保护。'}
            </Paragraph>
          </PrivacyInfo>
        )}
        
        {/* 企业版详情 - 仅对企业用户显示 */}
        {isEnterpriseUser && results.enterpriseDetails && (
          <PrivacyInfo style={{ backgroundColor: 'rgba(250, 173, 20, 0.1)', borderColor: '#faad14' }}>
            <Text strong><BankOutlined /> 企业安全分析</Text>
            <Paragraph style={{ marginTop: '8px' }}>
              批次ID: {results.enterpriseDetails.batchId} | 部门: {results.enterpriseDetails.departmentInfo || '安全部门'}
              {Object.keys(results.enterpriseDetails.threatCategories || {}).length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <Text strong>威胁分类:</Text>
                  <div>
                    {Object.entries(results.enterpriseDetails.threatCategories).map(([category, count]) => (
                      count > 0 && (
                        <Tag color="orange" key={category} style={{ margin: '2px' }}>
                          {category}: {count}
                        </Tag>
                      )
                    ))}
                  </div>
                </div>
              )}
            </Paragraph>
          </PrivacyInfo>
        )}
        
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
          <Button type="primary" onClick={() => window.history.back()}>
            返回
          </Button>
        </div>
      </ResultCard>
    </div>
  );
};

export default DetailedResults; 