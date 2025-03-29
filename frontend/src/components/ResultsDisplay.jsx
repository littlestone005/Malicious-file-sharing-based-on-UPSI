/**
 * 扫描结果显示组件
 * 
 * 这个组件负责展示文件扫描的结果，包括：
 * 1. 安全/恶意文件统计信息
 * 2. 结果分布图表
 * 3. 详细的文件扫描结果表格
 * 4. 隐私保护状态指示
 * 
 * 组件会根据扫描结果动态生成统计数据和可视化图表
 */

// 导入Ant Design组件
import { Table, Tag, Card, Typography, Statistic, Row, Col, Alert, Button, Tooltip, message } from 'antd';
// 导入Ant Design图标
import { CheckCircleOutlined, CloseCircleOutlined, LockOutlined, WarningOutlined, CopyOutlined } from '@ant-design/icons';
// 导入样式组件库
import styled from 'styled-components';
// 导入ECharts图表组件
import ReactECharts from 'echarts-for-react';

// 从Typography组件中解构出需要的子组件
const { Title, Text } = Typography;

/**
 * 结果卡片样式
 * 
 * 设置底部外边距，用于各个结果区域的显示
 */
const ResultsCard = styled(Card)`
  margin-bottom: 20px;
`;

/**
 * 统计信息容器样式
 * 
 * 设置底部外边距，用于包含统计卡片
 */
const StatsContainer = styled.div`
  margin-bottom: 30px;
`;

/**
 * 隐私保护标识样式
 * 
 * 使用flex布局对齐图标和文本
 * 设置背景色、边框、圆角和颜色，突出显示隐私保护状态
 */
const PrivacyBadge = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: rgba(46, 194, 126, 0.1);
  border-radius: 8px;
  border: 1px solid var(--color-success);
  color: var(--color-success);
`;

/**
 * 扫描结果显示组件
 * 
 * @param {Object} props - 组件属性
 * @param {Object} props.results - 扫描结果数据，包含文件哈希和隐私设置
 * @returns {JSX.Element} 扫描结果显示组件
 */
const ResultsDisplay = ({ results }) => {
  // 检查是否有有效的扫描结果
  if (!results || !results.hashes || results.hashes.length === 0) {
    return <Alert message="No scan results available" type="info" />;
  }

  /**
   * 处理扫描结果数据
   * 
   * 为演示目的，将每三个文件标记为恶意文件
   * 在实际应用中，这些数据会来自后端API
   */
  const processedResults = results.hashes.map((file, index) => {
    // 标记每三个文件中的一个为恶意文件（仅用于演示）
    const isMalicious = index % 3 === 0;
    return {
      ...file,
      key: index,
      status: isMalicious ? 'malicious' : 'safe',
      threatType: isMalicious ? ['Trojan', 'Spyware'][index % 2] : null,
      confidence: isMalicious ? Math.floor(Math.random() * 30) + 70 : 0, // 70-99% 置信度
    };
  });

  // 计算统计数据
  const totalFiles = processedResults.length;
  const maliciousFiles = processedResults.filter(file => file.status === 'malicious').length;
  const safeFiles = totalFiles - maliciousFiles;
  const maliciousPercentage = (maliciousFiles / totalFiles) * 100;

  /**
   * 饼图配置选项
   * 
   * 配置ECharts饼图的样式、颜色和数据
   * 显示安全文件和恶意文件的比例
   */
  const pieChartOption = {
    tooltip: {
      trigger: 'item'
    },
    color: ['#2ec27e', '#e01b24'], // 绿色表示安全，红色表示恶意
    series: [
      {
        name: 'Scan Results',
        type: 'pie',
        radius: ['40%', '70%'], // 环形图内外半径
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#1c1c1c',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: safeFiles, name: 'Safe Files' },
          { value: maliciousFiles, name: 'Malicious Files' }
        ]
      }
    ]
  };

  /**
   * 复制内容到剪贴板
   * 
   * @param {string} text - 要复制的文本内容
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

  /**
   * 表格列配置
   * 
   * 定义详细结果表格的列和数据渲染方式
   */
  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      // 根据状态渲染不同颜色和图标的标签
      render: (status) => (
        <Tag color={status === 'safe' ? 'success' : 'error'} icon={status === 'safe' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Threat Type',
      dataIndex: 'threatType',
      key: 'threatType',
      // 仅为恶意文件显示威胁类型
      render: (threatType) => threatType ? <Tag color="warning">{threatType}</Tag> : '-',
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      // 仅为恶意文件显示置信度
      render: (confidence) => confidence > 0 ? `${confidence}%` : '-',
    },
    {
      title: 'Hash (SHA-256)',
      dataIndex: 'hash',
      key: 'hash',
      // 改进哈希值显示，添加复制按钮
      render: (hash) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text code ellipsis style={{ maxWidth: '200px' }}>{hash}</Text>
          <Tooltip title="复制哈希值">
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              size="small" 
              onClick={() => copyToClipboard(hash)}
              style={{ marginLeft: 8 }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* 隐私保护标识：仅在使用PSI协议时显示 */}
      {results.usePSI && (
        <PrivacyBadge>
          <LockOutlined style={{ marginRight: 10 }} />
          <div>
            <Text strong style={{ color: 'inherit' }}>Privacy Protection Active</Text>
            <div>Only malicious file information was shared with the server using PSI protocol</div>
          </div>
        </PrivacyBadge>
      )}

      {/* 统计信息卡片：显示总文件数、安全文件数和恶意文件数 */}
      <StatsContainer>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <ResultsCard>
              <Statistic 
                title="Total Files Scanned" 
                value={totalFiles} 
                valueStyle={{ color: 'var(--color-primary)' }}
              />
            </ResultsCard>
          </Col>
          <Col xs={24} sm={8}>
            <ResultsCard>
              <Statistic 
                title="Safe Files" 
                value={safeFiles} 
                valueStyle={{ color: 'var(--color-success)' }}
                prefix={<CheckCircleOutlined />} 
              />
            </ResultsCard>
          </Col>
          <Col xs={24} sm={8}>
            <ResultsCard>
              <Statistic 
                title="Malicious Files" 
                value={maliciousFiles} 
                valueStyle={{ color: 'var(--color-danger)' }}
                prefix={<WarningOutlined />} 
              />
            </ResultsCard>
          </Col>
        </Row>
      </StatsContainer>

      {/* 结果分布图表：仅在存在恶意文件时显示 */}
      {maliciousFiles > 0 && (
        <ResultsCard title="Results Distribution">
          <ReactECharts option={pieChartOption} style={{ height: '300px' }} />
        </ResultsCard>
      )}

      {/* 详细结果表格：显示所有文件的扫描结果 */}
      <ResultsCard title="Detailed Results">
        <Table 
          columns={columns} 
          dataSource={processedResults} 
          pagination={false}
          rowClassName={(record) => record.status === 'malicious' ? 'malicious-row' : ''}
        />
      </ResultsCard>
    </div>
  );
};

export default ResultsDisplay; 