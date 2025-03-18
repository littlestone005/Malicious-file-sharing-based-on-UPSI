/**
 * 首页组件
 * 
 * 这个组件实现了应用的首页，包括：
 * 1. 英雄区域，展示应用的主要价值主张
 * 2. 特性卡片，展示应用的三个主要特性
 * 3. 隐私保护解释器，详细说明PSI协议的工作原理
 * 
 * 页面设计注重突出隐私保护和安全扫描功能
 */

// 导入Ant Design组件
import { Typography, Button, Space, Card, Row, Col } from 'antd';
// 导入路由链接组件
import { Link } from 'react-router-dom';
// 导入Ant Design图标
import { SafetyOutlined, LockOutlined, ScanOutlined, InfoCircleOutlined } from '@ant-design/icons';
// 导入样式组件库
import styled from 'styled-components';
// 导入隐私保护解释器组件
import PrivacyExplainer from '../components/PrivacyExplainer';

// 从Typography组件中解构出需要的子组件
const { Title, Paragraph } = Typography;

/**
 * 英雄区域样式
 * 
 * 设置文本居中和上下外边距
 * 作为页面的主要视觉焦点
 */
const HeroSection = styled.div`
  text-align: center;
  margin: 40px 0;
`;

/**
 * 盾牌图标样式
 * 
 * 设置图标大小、颜色和底部外边距
 * 作为应用安全性的视觉象征
 */
const ShieldIcon = styled(SafetyOutlined)`
  font-size: 64px;
  color: var(--color-primary);
  margin-bottom: 20px;
`;

/**
 * 特性卡片样式
 * 
 * 设置卡片高度和过渡效果
 * 悬停时添加上移动画，增强交互体验
 */
const FeatureCard = styled(Card)`
  height: 100%;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

/**
 * 特性图标样式
 * 
 * 设置图标大小、底部外边距和颜色
 * 为每个特性卡片提供视觉标识
 */
const FeatureIcon = styled.div`
  font-size: 36px;
  margin-bottom: 16px;
  color: var(--color-primary);
`;

/**
 * 首页组件
 * 
 * 展示应用的主要功能和价值主张
 * 
 * @returns {JSX.Element} 首页组件
 */
const HomePage = () => {
  return (
    <div>
      {/* 英雄区域：包含主标题、简介和行动按钮 */}
      <HeroSection>
        <ShieldIcon />
        <Title>隐私保护恶意软件检测</Title>
        <Paragraph style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 30px' }}>
          在不泄露隐私的情况下扫描您的文件。我们的系统使用先进的加密技术，确保只有恶意文件才会被识别。
        </Paragraph>
        <Space size="large">
          <Link to="/scan">
            <Button type="primary" size="large" icon={<ScanOutlined />}>开始扫描</Button>
          </Link>
          <Link to="/about">
            <Button size="large" icon={<InfoCircleOutlined />}>了解PSI协议</Button>
          </Link>
        </Space>
      </HeroSection>

      {/* 特性卡片区域：展示三个主要特性 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
        {/* 隐私优先特性 */}
        <Col xs={24} md={8}>
          <FeatureCard title="隐私优先">
            <FeatureIcon><LockOutlined /></FeatureIcon>
            <Paragraph>
              您的非恶意文件完全保持私密。只有关于检测到的威胁的信息才会与我们的服务器共享。
            </Paragraph>
          </FeatureCard>
        </Col>
        {/* 强大检测特性 */}
        <Col xs={24} md={8}>
          <FeatureCard title="强大检测">
            <FeatureIcon><ScanOutlined /></FeatureIcon>
            <Paragraph>
              我们的系统会将您的文件与已知恶意软件签名和行为的综合数据库进行比对。
            </Paragraph>
          </FeatureCard>
        </Col>
        {/* 加密保障特性 */}
        <Col xs={24} md={8}>
          <FeatureCard title="加密保障">
            <FeatureIcon><SafetyOutlined /></FeatureIcon>
            <Paragraph>
              基于隐私保护集合交集(PSI)协议和零知识证明，从数学上保证您的隐私安全。
            </Paragraph>
          </FeatureCard>
        </Col>
      </Row>

      {/* 隐私保护解释器：详细说明PSI协议的工作原理 */}
      <PrivacyExplainer />
    </div>
  );
};

export default HomePage; 