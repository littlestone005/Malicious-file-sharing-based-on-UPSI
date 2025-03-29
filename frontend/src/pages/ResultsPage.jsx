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
  Tabs,
  Alert,
  message,
  Tooltip,
  Input
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
  BankOutlined,
  LoginOutlined,
  LockOutlined,
  CopyOutlined
} from '@ant-design/icons';
import DetailedResults from '../components/DetailedResults';
import { UserContext } from '../App';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const PageContainer = styled(Content)`
  padding: 24px;
  background:rgb(16, 17, 17);
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

/**
 * 登录提醒样式
 */
const LoginAlert = styled(Alert)`
  margin-bottom: 20px;
`;

/**
 * 登录提示容器样式
 */
const LoginPromptContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
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

const ResultsPage = ({ scanResults }) => {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  // 页面初始化状态
  const [initializing, setInitializing] = useState(true);
  
  // 判断用户是否已登录
  const isLoggedIn = !!user;
  const isEnterpriseUser = user?.userType === 'enterprise';

  /**
   * 页面初始化效果
   * 短暂延迟后将页面设置为已初始化状态，防止闪烁
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  /**
   * 导航到登录页面
   */
  const goToLogin = () => {
    navigate('/login', { state: { from: `/results/${scanId}` } });
  };

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
  
  // 复制到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('已复制到剪贴板');
      },
      () => {
        message.error('复制失败');
      }
    );
  };
  
  // 返回扫描页面
  const handleBack = () => {
    navigate('/scan');
  };
  
  // 导出报告
  const handleExport = () => {
    if (!isLoggedIn) {
      message.warning('请先登录以导出报告');
      return;
    }
    console.log('导出报告:', scanId);
    // 实际应用中应该调用API导出报告
  };
  
  // 分享结果
  const handleShare = () => {
    if (!isLoggedIn) {
      message.warning('请先登录以分享结果');
      return;
    }
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
          fileHash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b${i.toString().padStart(3, '0')}`,
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
        fileHash: file.hash || `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b${index.toString().padStart(3, '0')}`,
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
  
  // 如果页面正在初始化，显示加载状态
  if (initializing) {
    return (
      <Layout>
        <PageContainer>
          <ResultsContainer>
            <LoadingContainer>
              <Spin size="large" tip="加载中..." />
            </LoadingContainer>
          </ResultsContainer>
        </PageContainer>
      </Layout>
    );
  }
  
  // 渲染加载状态
  if (loading) {
    return (
      <Layout>
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
      </Layout>
    );
  }
  
  // 渲染错误状态
  if (error) {
    return (
      <Layout>
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
      </Layout>
    );
  }
  
  // 渲染扫描结果
  return (
    <Layout>
      <PageContainer>
        <ResultsContainer>
          {/* 未登录提醒 */}
          {!isLoggedIn && (
            <LoginAlert
              message="您尚未登录"
              description={
                <span>
                  请先登录以查看完整的扫描结果详情、保存结果到您的历史记录，以及获取更多功能。
                  <Button 
                    type="primary" 
                    icon={<LoginOutlined />} 
                    style={{ marginLeft: 10 }}
                    onClick={goToLogin}
                  >
                    立即登录
                  </Button>
                </span>
              }
              type="warning"
              showIcon
            />
          )}

          {/* 面包屑导航 */}
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
              <SafetyOutlined />
              <span>扫描结果</span>
            </Breadcrumb.Item>
          </Breadcrumb>
          
          {/* 标题和导航按钮 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              style={{ marginRight: 16 }} 
              onClick={handleBack}
            >
              返回
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              扫描结果 
              {results.isEnterpriseReport && (
                <EnterpriseTag color="gold" count={<span style={{ color: '#fff' }}><BankOutlined /> 企业版</span>} />
              )}
            </Title>
          </div>
          
          <Paragraph>
            扫描ID: {results.scanId} | 扫描时间: {new Date(results.timestamp).toLocaleString()}
            {!isLoggedIn && ' | 登录后可保存结果并进行更多操作'}
          </Paragraph>
          
          {/* 导出和分享按钮 */}
          <ActionButtons>
            <Button 
              type="default" 
              onClick={handleBack}
            >
              新的扫描
            </Button>
            <Space>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleExport}
                disabled={!isLoggedIn}
              >
                导出报告
              </Button>
              <Button 
                type="primary" 
                icon={<ShareAltOutlined />} 
                onClick={handleShare}
                disabled={!isLoggedIn}
              >
                分享结果
              </Button>
            </Space>
          </ActionButtons>
          
          {/* 状态卡片 - 基本信息始终显示 */}
          <StatusCard>
            <Title level={3} style={{ color: results.maliciousFiles > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
              {results.maliciousFiles > 0 ? (
                <><CloseCircleOutlined /> 检测到威胁</>
              ) : (
                <><CheckCircleOutlined /> 未检测到威胁</>
              )}
            </Title>
            <Paragraph>
              {results.usedPSI ? '已启用隐私保护扫描 (PSI)' : '标准扫描模式'}
            </Paragraph>
          </StatusCard>
          
          {/* 根据登录状态显示不同内容 */}
          {isLoggedIn ? (
            <>
              {/* 扫描统计 */}
              <ResultsCard>
                <StatsRow gutter={16}>
                  <Col xs={24} md={8}>
                    <Statistic 
                      title="已扫描文件" 
                      value={results.totalFiles} 
                      prefix={<FileOutlined />} 
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Statistic 
                      title="安全文件" 
                      value={results.safeFiles} 
                      valueStyle={{ color: 'var(--color-success)' }}
                      prefix={<CheckCircleOutlined />} 
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Statistic 
                      title="受感染文件" 
                      value={results.maliciousFiles} 
                      valueStyle={{ color: 'var(--color-error)' }}
                      prefix={<CloseCircleOutlined />} 
                    />
                  </Col>
                </StatsRow>
              </ResultsCard>
              
              {/* 详细结果 */}
              <DetailedResults 
                results={results} 
                isEnterpriseUser={results.isEnterpriseReport} 
              />
            </>
          ) : (
            <LoginPromptContainer>
              <LockOutlined style={{ fontSize: '64px', color: 'var(--color-warning)', marginBottom: '20px' }} />
              <Title level={3}>需要登录才能查看完整扫描结果</Title>
              <Paragraph style={{ fontSize: '16px', maxWidth: '500px', margin: '0 auto 20px' }}>
                登录后您可以查看详细的扫描结果、威胁分析、保存结果到您的历史记录，
                以及下载完整报告或分享结果。
              </Paragraph>
              <Paragraph type="secondary">
                {results.totalFiles}个文件中检测到{results.maliciousFiles}个威胁
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                icon={<LoginOutlined />}
                onClick={goToLogin}
              >
                登录查看完整结果
              </Button>
            </LoginPromptContainer>
          )}
        </ResultsContainer>
      </PageContainer>
    </Layout>
  );
};

export default ResultsPage; 