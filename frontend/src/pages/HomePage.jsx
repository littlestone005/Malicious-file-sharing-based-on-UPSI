import { Typography, Button, Space, Card, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { SafetyOutlined, LockOutlined, ScanOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import PrivacyExplainer from '../components/PrivacyExplainer';

const { Title, Paragraph } = Typography;

const HeroSection = styled.div`
  text-align: center;
  margin: 40px 0;
`;

const ShieldIcon = styled(SafetyOutlined)`
  font-size: 64px;
  color: var(--color-primary);
  margin-bottom: 20px;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 36px;
  margin-bottom: 16px;
  color: var(--color-primary);
`;

const HomePage = () => {
  return (
    <div>
      <HeroSection>
        <ShieldIcon />
        <Title>隐私保护恶意软件检测</Title>
        <Paragraph style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 30px' }}>
          在不泄露隐私的情况下扫描您的文件。我们的系统使用先进的加密技术，确保只有恶意文件才会被识别。
        </Paragraph>
        <Space size="large">
          <Button type="primary" size="large" icon={<ScanOutlined />}>
            <Link to="/scan">开始扫描</Link>
          </Button>
          <Button size="large" icon={<LockOutlined />}>
            <Link to="/about">了解PSI协议</Link>
          </Button>
        </Space>
      </HeroSection>

      <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
        <Col xs={24} md={8}>
          <FeatureCard title="隐私优先">
            <FeatureIcon><LockOutlined /></FeatureIcon>
            <Paragraph>
              您的非恶意文件完全保持私密。只有关于检测到的威胁的信息才会与我们的服务器共享。
            </Paragraph>
          </FeatureCard>
        </Col>
        <Col xs={24} md={8}>
          <FeatureCard title="强大检测">
            <FeatureIcon><ScanOutlined /></FeatureIcon>
            <Paragraph>
              我们的系统会将您的文件与已知恶意软件签名和行为的综合数据库进行比对。
            </Paragraph>
          </FeatureCard>
        </Col>
        <Col xs={24} md={8}>
          <FeatureCard title="加密保障">
            <FeatureIcon><SafetyOutlined /></FeatureIcon>
            <Paragraph>
              基于隐私保护集合交集(PSI)协议和零知识证明，从数学上保证您的隐私安全。
            </Paragraph>
          </FeatureCard>
        </Col>
      </Row>

      <PrivacyExplainer />
    </div>
  );
};

export default HomePage; 