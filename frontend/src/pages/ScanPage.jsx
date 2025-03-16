import { useState } from 'react';
import { Typography, Card, Steps, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FileAddOutlined, ScanOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import FileUploader from '../components/FileUploader';

const { Title, Paragraph } = Typography;

const ScanContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const StepsContainer = styled.div`
  margin: 30px 0;
`;

const ContentCard = styled(Card)`
  margin: 30px 0;
`;

const ScanPage = ({ setScanResults }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilesProcessed = (results) => {
    setScanResults(results);
    setCurrentStep(2);
    
    // 短暂延迟后导航到结果页面
    setTimeout(() => {
      navigate('/results');
    }, 1000);
  };

  const steps = [
    {
      title: '选择文件',
      icon: <FileAddOutlined />,
      content: (
        <FileUploader 
          onFilesProcessed={handleFilesProcessed}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ),
    },
    {
      title: '扫描中',
      icon: <ScanOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <ScanOutlined style={{ fontSize: '48px', color: 'var(--color-primary)' }} spin />
          <Title level={3} style={{ marginTop: '20px' }}>正在扫描文件...</Title>
          <Paragraph>
            您的文件正在使用PSI协议进行扫描，以保护您的隐私。
            只有关于恶意文件的信息才会被揭示。
          </Paragraph>
        </div>
      ),
    },
    {
      title: '结果',
      icon: <SafetyCertificateOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <SafetyCertificateOutlined style={{ fontSize: '48px', color: 'var(--color-success)' }} />
          <Title level={3} style={{ marginTop: '20px' }}>扫描完成！</Title>
          <Paragraph>
            您的扫描已成功完成。正在跳转到结果页面...
          </Paragraph>
        </div>
      ),
    },
  ];

  return (
    <ScanContainer>
      <Title level={2}>扫描文件检测恶意软件</Title>
      <Paragraph>
        上传您的文件以扫描恶意内容。通过我们的PSI协议实现，您的隐私将受到保护。
      </Paragraph>

      <StepsContainer>
        <Steps
          current={currentStep}
          items={steps.map(item => ({
            title: item.title,
            icon: item.icon,
          }))}
        />
      </StepsContainer>

      <ContentCard>
        {steps[currentStep].content}
      </ContentCard>
    </ScanContainer>
  );
};

export default ScanPage; 