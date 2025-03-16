import { Card, Typography, Steps, Divider } from 'antd';
import { LockOutlined, DatabaseOutlined, SafetyCertificateOutlined, FileSearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;

const ExplainerCard = styled(Card)`
  margin: 20px 0;
`;

const ComparisonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
`;

const ComparisonCard = styled(Card)`
  flex: 1;
  min-width: 300px;
  border-color: ${props => props.type === 'psi' ? 'var(--color-primary)' : 'var(--color-border)'};
  
  .ant-card-head {
    background-color: ${props => props.type === 'psi' ? 'rgba(26, 95, 180, 0.1)' : 'transparent'};
    border-bottom-color: ${props => props.type === 'psi' ? 'var(--color-primary)' : 'var(--color-border)'};
  }
`;

const PrivacyExplainer = () => {
  return (
    <div>
      <ExplainerCard title={<><LockOutlined /> 隐私保护扫描的工作原理</>}>
        <Paragraph>
          我们的系统使用一种称为<Text strong>隐私保护集合交集（PSI）</Text>的加密协议，
          在不泄露您的非恶意文件的情况下，将您的文件与我们的恶意软件数据库进行比对。
        </Paragraph>
        
        <Steps
          direction="vertical"
          items={[
            {
              title: '本地文件哈希计算',
              description: '您的文件在浏览器中使用SHA-256进行本地哈希处理。实际的文件内容永远不会离开您的设备。',
              icon: <FileSearchOutlined />,
            },
            {
              title: 'PSI协议执行',
              description: 'PSI协议允许双方找到它们集合的交集，而不会泄露非交集元素。',
              icon: <LockOutlined />,
            },
            {
              title: '服务器端处理',
              description: '我们的服务器使用OPRF（不经意伪随机函数）处理加密数据，在不查看您实际文件哈希的情况下找到匹配项。',
              icon: <DatabaseOutlined />,
            },
            {
              title: '验证结果',
              description: '只返回有关恶意文件的信息，并使用零知识证明来验证服务器的行为是否正确。',
              icon: <SafetyCertificateOutlined />,
            },
          ]}
        />
      </ExplainerCard>

      <Divider>隐私对比</Divider>

      <ComparisonContainer>
        <ComparisonCard 
          type="psi"
          title={<><LockOutlined /> 使用隐私模式 (PSI)</>}
          bordered
        >
          <ul>
            <li>✅ 只有恶意文件哈希会被服务器获知</li>
            <li>✅ 非恶意文件完全保持私密</li>
            <li>✅ 零知识证明验证服务器行为</li>
            <li>✅ 所有通信的端到端加密</li>
            <li>✅ 通过加密保证最小数据暴露</li>
          </ul>
        </ComparisonCard>

        <ComparisonCard 
          type="traditional"
          title={<>传统扫描</>}
          bordered
        >
          <ul>
            <li>❌ 所有文件哈希都发送到服务器</li>
            <li>❌ 服务器了解您的所有文件，而不仅仅是恶意文件</li>
            <li>❌ 没有加密隐私保证</li>
            <li>✅ 简单的实现</li>
            <li>✅ 稍快的处理时间</li>
          </ul>
        </ComparisonCard>
      </ComparisonContainer>
    </div>
  );
};

export default PrivacyExplainer; 