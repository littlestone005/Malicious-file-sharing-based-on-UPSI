/**
 * 隐私保护解释器组件
 * 
 * 这个组件用于向用户解释隐私保护扫描的工作原理，包括：
 * 1. PSI（隐私保护集合交集）协议的工作流程
 * 2. 隐私模式与传统扫描的对比
 * 3. 可视化的步骤说明
 * 
 * 通过直观的方式帮助用户理解应用如何保护他们的隐私
 */

// 导入Ant Design组件
import { Card, Typography, Steps, Divider } from 'antd';
// 导入Ant Design图标
import { LockOutlined, DatabaseOutlined, SafetyCertificateOutlined, FileSearchOutlined } from '@ant-design/icons';
// 导入样式组件库
import styled from 'styled-components';

// 从Typography组件中解构出需要的子组件
const { Title, Paragraph, Text } = Typography;

/**
 * 解释器卡片样式
 * 
 * 设置上下外边距，用于包含PSI协议的工作原理说明
 */
const ExplainerCard = styled(Card)`
  margin: 20px 0;
`;

/**
 * 对比容器样式
 * 
 * 使用flex布局和flex-wrap实现响应式布局
 * 设置间距和上边距
 */
const ComparisonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
`;

/**
 * 对比卡片样式
 * 
 * 根据类型(psi/traditional)设置不同的边框和标题背景色
 * 使用flex: 1确保卡片平均分配空间
 * 设置最小宽度确保在小屏幕上的可读性
 */
const ComparisonCard = styled(Card)`
  flex: 1;
  min-width: 300px;
  border-color: ${props => props.type === 'psi' ? 'var(--color-primary)' : 'var(--color-border)'};
  
  .ant-card-head {
    background-color: ${props => props.type === 'psi' ? 'rgba(26, 95, 180, 0.1)' : 'transparent'};
    border-bottom-color: ${props => props.type === 'psi' ? 'var(--color-primary)' : 'var(--color-border)'};
  }
`;

/**
 * 隐私保护解释器组件
 * 
 * 通过卡片、步骤和对比表格向用户解释隐私保护扫描的工作原理
 * 
 * @returns {JSX.Element} 隐私保护解释器组件
 */
const PrivacyExplainer = () => {
  return (
    <div>
      {/* PSI协议工作原理卡片 */}
      <ExplainerCard title={<><LockOutlined /> 隐私保护扫描的工作原理</>}>
        <Paragraph>
          我们的系统使用一种称为<Text strong>隐私保护集合交集（PSI）</Text>的加密协议，
          在不泄露您的非恶意文件的情况下，将您的文件与我们的恶意软件数据库进行比对。
        </Paragraph>
        
        {/* 垂直步骤说明，展示PSI协议的四个主要步骤 */}
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

      {/* 分隔线，用于视觉上分离两个主要部分 */}
      <Divider>隐私对比</Divider>

      {/* 隐私模式与传统扫描的对比 */}
      <ComparisonContainer>
        {/* 隐私模式(PSI)卡片，突出显示其优势 */}
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

        {/* 传统扫描卡片，显示其隐私缺点和性能优势 */}
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