import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Layout, 
  Typography, 
  Breadcrumb, 
  Button, 
  Spin, 
  Result,
  Space
} from 'antd';
import { 
  HomeOutlined, 
  FileSearchOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DetailedResults from '../components/DetailedResults';

const { Content } = Layout;
const { Title, Text } = Typography;

const PageContainer = styled(Content)`
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px - 70px);
`;

const ResultsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ResultsPage = () => {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  
  // 模拟从API获取扫描结果
  useEffect(() => {
    // 实际应用中应该调用API获取结果
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟扫描结果数据
        const mockResults = {
          id: scanId,
          status: Math.random() > 0.7 ? 'infected' : (Math.random() > 0.5 ? 'suspicious' : 'clean'),
          fileName: 'example-file.exe',
          fileSize: '2.4 MB',
          scanTime: new Date().toISOString(),
          threatName: Math.random() > 0.7 ? 'Trojan.Win32.Generic' : null,
          threatLevel: Math.random() > 0.7 ? 'high' : (Math.random() > 0.5 ? 'medium' : 'none'),
          privacyProtected: true,
          hashMatches: Math.random() > 0.7 ? 1 : 0,
          totalHashes: 1000000,
          scanDuration: '1.2 秒',
          detectionMethod: 'PSI协议',
          fileType: 'Windows可执行文件',
        };
        
        setScanResults(mockResults);
        setLoading(false);
      } catch (err) {
        setError('无法加载扫描结果。请稍后再试。');
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [scanId]);
  
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
          
          <DetailedResults scanResults={scanResults} fileName={scanResults.fileName} />
        </ResultsContainer>
      </PageContainer>
      
      <Footer />
    </Layout>
  );
};

export default ResultsPage; 