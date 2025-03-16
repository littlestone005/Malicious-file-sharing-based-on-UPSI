import { Table, Tag, Card, Typography, Statistic, Row, Col, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LockOutlined, WarningOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import ReactECharts from 'echarts-for-react';

const { Title, Text } = Typography;

const ResultsCard = styled(Card)`
  margin-bottom: 20px;
`;

const StatsContainer = styled.div`
  margin-bottom: 30px;
`;

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

const ResultsDisplay = ({ results }) => {
  if (!results || !results.hashes || results.hashes.length === 0) {
    return <Alert message="No scan results available" type="info" />;
  }

  // For demo purposes, let's mark some files as malicious
  const processedResults = results.hashes.map((file, index) => {
    // Mark every third file as malicious for demonstration
    const isMalicious = index % 3 === 0;
    return {
      ...file,
      key: index,
      status: isMalicious ? 'malicious' : 'safe',
      threatType: isMalicious ? ['Trojan', 'Spyware'][index % 2] : null,
      confidence: isMalicious ? Math.floor(Math.random() * 30) + 70 : 0, // 70-99% confidence
    };
  });

  // Calculate statistics
  const totalFiles = processedResults.length;
  const maliciousFiles = processedResults.filter(file => file.status === 'malicious').length;
  const safeFiles = totalFiles - maliciousFiles;
  const maliciousPercentage = (maliciousFiles / totalFiles) * 100;

  // Chart options
  const pieChartOption = {
    tooltip: {
      trigger: 'item'
    },
    color: ['#2ec27e', '#e01b24'],
    series: [
      {
        name: 'Scan Results',
        type: 'pie',
        radius: ['40%', '70%'],
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

  // Table columns
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
      render: (threatType) => threatType ? <Tag color="warning">{threatType}</Tag> : '-',
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence) => confidence > 0 ? `${confidence}%` : '-',
    },
    {
      title: 'Hash (SHA-256)',
      dataIndex: 'hash',
      key: 'hash',
      render: (hash) => <Text code ellipsis>{hash}</Text>,
    },
  ];

  return (
    <div>
      {results.usePSI && (
        <PrivacyBadge>
          <LockOutlined style={{ marginRight: 10 }} />
          <div>
            <Text strong style={{ color: 'inherit' }}>Privacy Protection Active</Text>
            <div>Only malicious file information was shared with the server using PSI protocol</div>
          </div>
        </PrivacyBadge>
      )}

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

      {maliciousFiles > 0 && (
        <ResultsCard title="Results Distribution">
          <ReactECharts option={pieChartOption} style={{ height: '300px' }} />
        </ResultsCard>
      )}

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