import { Typography, Card, Collapse, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import { LockOutlined, QuestionCircleOutlined, ScanOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import PrivacyExplainer from '../components/PrivacyExplainer';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const AboutContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const SectionCard = styled(Card)`
  margin-bottom: 30px;
`;

const AboutPage = () => {
  return (
    <AboutContainer>
      <Title level={2}>关于我们的隐私保护恶意软件检测</Title>
      <Paragraph>
        我们的系统旨在保护您的隐私，同时有效检测恶意文件。
        我们使用先进的加密技术，确保只有关于恶意文件的信息才会被我们的服务器获知。
      </Paragraph>

      <SectionCard title={<><LockOutlined /> 隐私保护技术</>}>
        <PrivacyExplainer />
      </SectionCard>

      <SectionCard title={<><QuestionCircleOutlined /> 常见问题</>}>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="隐私保护是如何工作的？" key="1">
            <Paragraph>
              我们使用一种称为隐私保护集合交集（PSI）的加密协议，它允许双方（您和我们的服务器）
              找到它们集合的交集（您的文件哈希和我们的恶意软件数据库），而不会泄露任何其他信息。这意味着：
            </Paragraph>
            <ul>
              <li>您的文件在浏览器中本地进行哈希处理</li>
              <li>PSI协议确保只有匹配项（恶意文件）被揭示</li>
              <li>我们的服务器永远不会看到您非恶意文件的哈希值</li>
              <li>零知识证明验证服务器的行为是否正确</li>
            </ul>
          </Panel>
          
          <Panel header="我的数据会发送到您的服务器吗？" key="2">
            <Paragraph>
              当您启用隐私模式（默认设置）使用我们的服务时，只有经过加密保护的信息才会发送到我们的服务器。
              您文件的实际内容永远不会离开您的设备，只有恶意文件的哈希值才会被我们的系统获知。
            </Paragraph>
            <Paragraph>
              如果您禁用隐私模式，所有文件哈希将被发送到我们的服务器进行检查，这样隐私性较低但速度稍快。
            </Paragraph>
          </Panel>
          
          <Panel header="恶意软件检测的准确性如何？" key="3">
            <Paragraph>
              我们的系统使用定期更新的已知恶意软件签名的综合数据库。
              检测准确性与传统恶意软件扫描解决方案相当，但增加了隐私保护的好处。
            </Paragraph>
            <Paragraph>
              PSI协议不会降低检测准确性 - 它只改变了执行检测的方式，以保护您的隐私。
            </Paragraph>
          </Panel>
          
          <Panel header="我可以扫描哪些类型的文件？" key="4">
            <Paragraph>
              您可以扫描任何类型的文件。我们的系统计算文件的加密哈希值，
              这种方法适用于任何文件类型。这包括可执行文件、文档、图像和任何其他文件格式。
            </Paragraph>
          </Panel>
        </Collapse>
      </SectionCard>

      <SectionCard title={<><SafetyCertificateOutlined /> 技术细节</>}>
        <Paragraph>
          对于那些对技术实现感兴趣的人，我们的系统使用：
        </Paragraph>
        <ul>
          <li><Text strong>SHA-256</Text> 用于客户端文件哈希计算</li>
          <li><Text strong>OPRF（不经意伪随机函数）</Text> 用于PSI协议</li>
          <li><Text strong>零知识证明</Text> 用于验证服务器行为</li>
          <li><Text strong>端到端加密</Text> 用于所有通信</li>
        </ul>
        <Paragraph>
          该实现基于最近的密码学研究进展，专门针对不平衡情况进行了优化，
          即服务器集合（恶意软件数据库）远大于客户端集合（您的文件）的情况。
        </Paragraph>
      </SectionCard>

      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <Space size="large">
          <Button type="primary" size="large" icon={<ScanOutlined />}>
            <Link to="/scan">开始扫描</Link>
          </Button>
          <Button size="large" icon={<LockOutlined />}>
            <Link to="/">返回首页</Link>
          </Button>
        </Space>
      </div>
    </AboutContainer>
  );
};

export default AboutPage; 