import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Layout, 
  Typography, 
  Breadcrumb, 
  Button, 
  Spin, 
  Result,
  Space,
  Card,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  Divider,
  Badge,
  Tabs
} from 'antd';
import { 
  HomeOutlined, 
  FileSearchOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
  BankOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DetailedResults from '../components/DetailedResults';
import { UserContext } from '../App';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const PageContainer = styled(Content)`
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px - 70px);
`;

const ResultsContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const StatusCard = styled(Card)`
  margin-bottom: 24px;
  text-align: center;
`;

const ResultsCard = styled(Card)`
  margin-bottom: 24px;
`;

const StatsRow = styled(Row)`
  margin: 24px 0;
`;

const EnterpriseTag = styled(Badge)`
  margin-left: 10px;
`;

const ResultsPage = ({ scanResults }) => {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  
  const isEnterpriseUser = user?.userType === 'enterprise';

  useEffect(() => {
    // 模拟从API获取结果
    // 在实际应用中，这将是一个API调用，使用scanId获取结果
    setTimeout(() => {
      // 生成模拟结果
      const mockResults = generateMockResults(scanResults, isEnterpriseUser);
      setResults(mockResults);
      setLoading(false);
    }, 1000);
  }, [scanId, scanResults, isEnterpriseUser]);
  
  // 返回扫描页面
  const handleBack = () => {
    navigate('/scan');
  };
  
  // 导出报告
  const handleExport = () => {
    console.log('导出报告:', scanId);
    // 实际应用中应该调用API导出报告
  };
  
  // 分享结果
  const handleShare = () => {
    console.log('分享结果:', scanId);
    // 实际应用中应该实现分享功能
  };
  
  // 生成模拟结果
  const generateMockResults = (scanData, isEnterprise) => {
    if (!scanData) {
      // 如果没有扫描数据，生成一些模拟数据
      const totalFiles = isEnterprise ? 15 : 3;
      const maliciousCount = isEnterprise ? 2 : 1;
      
      const fileResults = [];
      for (let i = 0; i < totalFiles; i++) {
        const isMalicious = i < maliciousCount;
        fileResults.push({
          key: i,
          fileName: `file_${i}.${i % 2 === 0 ? 'exe' : 'dll'}`,
          fileSize: Math.floor(Math.random() * 10000000),
          status: isMalicious ? 'malicious' : 'safe',
          threatType: isMalicious ? ['Trojan', 'Spyware'][i % 2] : null,
          confidence: isMalicious ? Math.floor(Math.random() * 30) + 70 : null,
          detectionMethod: isMalicious ? 'PSI' : null,
        });
      }
      
      return {
        scanId: scanId || 'mock-scan-id',
        timestamp: new Date().toISOString(),
        totalFiles,
        maliciousFiles: maliciousCount,
        safeFiles: totalFiles - maliciousCount,
        fileResults,
        usedPSI: true,
        isEnterpriseReport: isEnterprise,
        enterpriseDetails: isEnterprise ? {
          batchId: `BATCH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          departmentInfo: '安全部门',
          threatCategories: {
            'Trojan': 1,
            'Spyware': 1,
            'Ransomware': 0,
            'Adware': 0
          },
          riskLevel: 'Medium',
          recommendedActions: [
            '隔离受感染的系统',
            '更新所有安全软件',
            '进行全面系统扫描'
          ]
        } : null
      };
    }
    
    // 使用实际的扫描数据生成结果
    const fileHashes = scanData.hashes || [];
    const totalFiles = fileHashes.length;
    
    // 随机选择一些文件标记为恶意软件（用于演示）
    const maliciousCount = Math.min(Math.floor(totalFiles * 0.2) + 1, 3);
    
    const fileResults = fileHashes.map((file, index) => {
      const isMalicious = index < maliciousCount;
      return {
        key: index,
        fileName: file.fileName,
        fileSize: file.fileSize,
        status: isMalicious ? 'malicious' : 'safe',
        threatType: isMalicious ? ['Trojan', 'Spyware', 'Ransomware'][index % 3] : null,
        confidence: isMalicious ? Math.floor(Math.random() * 30) + 70 : null,
        detectionMethod: isMalicious ? 'PSI' : null,
      };
    });
    
    return {
      scanId: scanId || 'generated-scan-id',
      timestamp: new Date().toISOString(),
      totalFiles,
      maliciousFiles: maliciousCount,
      safeFiles: totalFiles - maliciousCount,
      fileResults,
      usedPSI: scanData.usePSI,
      isEnterpriseReport: isEnterprise,
      enterpriseDetails: isEnterprise ? {
        batchId: `BATCH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        departmentInfo: '安全部门',
        threatCategories: {
          'Trojan': Math.floor(maliciousCount / 3) || 1,
          'Spyware': Math.floor(maliciousCount / 3) || 1,
          'Ransomware': Math.floor(maliciousCount / 3) || 0,
          'Adware': 0
        },
        riskLevel: maliciousCount > 1 ? 'High' : 'Medium',
        recommendedActions: [
          '隔离受感染的系统',
          '更新所有安全软件',
          '进行全面系统扫描'
        ]
      } : null
    };
  };
  
  // 渲染加载状态
  if (loading) {
    return (
      <Layout>
        <Header />
        <PageContainer>
          <ResultsContainer>
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 20 }}>
                <Text>正在加载扫描结果...</Text>
              </div>
            </div>
          </ResultsContainer>
        </PageContainer>
        <Footer />
      </Layout>
    );
  }
  
  // 渲染错误状态
  if (error) {
    return (
      <Layout>
        <Header />
        <PageContainer>
          <ResultsContainer>
            <Result
              status="error"
              title="加载失败"
              subTitle={error}
              extra={
                <Button type="primary" onClick={handleBack}>
                  返回
                </Button>
              }
            />
          </ResultsContainer>
        </PageContainer>
        <Footer />
      </Layout>
    );
  }
  
  const columns = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text) => <span><FileOutlined style={{ marginRight: 8 }} />{text}</span>,
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size) => {
        const kb = size / 1024;
        const mb = kb / 1024;
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'malicious') {
          return <Tag color="error" icon={<CloseCircleOutlined />}>恶意软件</Tag>;
        }
        return <Tag color="success" icon={<CheckCircleOutlined />}>安全</Tag>;
      },
    },
    {
      title: '威胁类型',
      dataIndex: 'threatType',
      key: 'threatType',
      render: (type) => type ? <Tag color="volcano">{type}</Tag> : '-',
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence) => confidence ? `${confidence}%` : '-',
    },
  ];

  // 企业版额外的列
  const enterpriseColumns = [
    ...columns,
    {
      title: '检测方法',
      dataIndex: 'detectionMethod',
      key: 'detectionMethod',
      render: (method) => method ? <Tag color="blue">{method}</Tag> : '-',
    }
  ];

  return (
    <Layout>
      <Header />
      
      <PageContainer>
        <ResultsContainer>
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
              <span>首页</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/scan">
              <FileSearchOutlined />
              <span>扫描</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span>扫描结果</span>
            </Breadcrumb.Item>
          </Breadcrumb>
          
          <ActionButtons>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
            >
              返回
            </Button>
            
            <Space>
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                导出报告
              </Button>
              
              <Button 
                icon={<ShareAltOutlined />}
                onClick={handleShare}
              >
                分享
              </Button>
            </Space>
          </ActionButtons>
          
          <Title level={2}>
            扫描结果
            {results.isEnterpriseReport && (
              <EnterpriseTag color="gold" count={<span style={{ color: '#fff' }}><BankOutlined /> 企业版</span>} />
            )}
          </Title>
          <Paragraph>
            扫描ID: {results.scanId} | 时间: {new Date(results.timestamp).toLocaleString()}
            {results.isEnterpriseReport && ` | 批次ID: ${results.enterpriseDetails.batchId}`}
          </Paragraph>

          <StatusCard>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {results.maliciousFiles > 0 ? (
                <WarningOutlined style={{ color: 'var(--color-error)' }} />
              ) : (
                <SafetyOutlined style={{ color: 'var(--color-success)' }} />
              )}
            </div>
            <Title level={3}>
              {results.maliciousFiles > 0 
                ? `检测到 ${results.maliciousFiles} 个恶意文件` 
                : '未检测到恶意软件'}
            </Title>
            <Paragraph>
              {results.usedPSI 
                ? '使用PSI协议进行扫描，保护了您的隐私。' 
                : '使用标准扫描完成。'}
            </Paragraph>
          </StatusCard>

          <StatsRow gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="总文件数" 
                  value={results.totalFiles} 
                  prefix={<FileOutlined />} 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="安全文件" 
                  value={results.safeFiles} 
                  valueStyle={{ color: 'var(--color-success)' }}
                  prefix={<CheckCircleOutlined />} 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="恶意文件" 
                  value={results.maliciousFiles} 
                  valueStyle={{ color: 'var(--color-error)' }}
                  prefix={<CloseCircleOutlined />} 
                />
              </Card>
            </Col>
          </StatsRow>

          {results.isEnterpriseReport ? (
            <Tabs defaultActiveKey="files">
              <TabPane tab="文件扫描结果" key="files">
                <ResultsCard>
                  <Table 
                    columns={enterpriseColumns} 
                    dataSource={results.fileResults} 
                    pagination={results.fileResults.length > 10}
                  />
                </ResultsCard>
              </TabPane>
              <TabPane tab="企业报告" key="enterprise">
                <ResultsCard>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card title="风险评估">
                        <Statistic 
                          title="风险等级" 
                          value={results.enterpriseDetails.riskLevel} 
                          valueStyle={{ 
                            color: results.enterpriseDetails.riskLevel === 'High' 
                              ? 'var(--color-error)' 
                              : 'var(--color-warning)' 
                          }}
                        />
                        <Divider />
                        <Title level={4}>威胁类别分布</Title>
                        {Object.entries(results.enterpriseDetails.threatCategories).map(([category, count]) => (
                          <div key={category} style={{ marginBottom: 8 }}>
                            <Text>{category}: </Text>
                            {Array(count).fill().map((_, i) => (
                              <Tag key={i} color="error">■</Tag>
                            ))}
                            {count === 0 && <Tag color="default">0</Tag>}
                          </div>
                        ))}
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="建议操作">
                        <ul>
                          {results.enterpriseDetails.recommendedActions.map((action, index) => (
                            <li key={index} style={{ marginBottom: 12 }}>
                              <Text>{action}</Text>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </Col>
                  </Row>
                </ResultsCard>
              </TabPane>
            </Tabs>
          ) : (
            <ResultsCard>
              <Table 
                columns={columns} 
                dataSource={results.fileResults} 
                pagination={false}
              />
            </ResultsCard>
          )}
        </ResultsContainer>
      </PageContainer>
      
      <Footer />
    </Layout>
  );
};

export default ResultsPage; 