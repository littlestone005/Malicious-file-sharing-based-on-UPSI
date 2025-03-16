/**
 * 页面底部组件
 * 
 * 这个组件实现了应用的底部区域，包括：
 * 1. 版权信息
 * 2. 安全特性标识
 * 3. 响应式布局设计
 */

// 导入Ant Design组件
import { Layout } from 'antd';
// 导入样式组件库
import styled from 'styled-components';
// 导入Ant Design图标
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

// 从Ant Design Layout组件中解构出Footer组件
const { Footer: AntFooter } = Layout;

/**
 * 自定义样式的底部组件
 * 
 * 设置文本居中、背景色、文本颜色、内边距和顶部边框
 */
const StyledFooter = styled(AntFooter)`
  text-align: center;
  background-color: #141414;
  color: var(--color-text-secondary);
  padding: 15px;
  border-top: 1px solid var(--color-border);
`;

/**
 * 底部内容容器样式
 * 
 * 使用flex布局使版权信息和安全标识水平分布
 * 设置最大宽度和水平居中
 * 在移动设备上切换为垂直布局
 */
const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

/**
 * 安全标识样式
 * 
 * 使用flex布局和间距设置图标和文本的排列
 * 使用绿色表示安全状态
 */
const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-success);
`;

/**
 * 底部组件
 * 
 * 显示版权信息和安全特性标识
 * 版权年份会自动更新为当前年份
 */
const Footer = () => {
  return (
    <StyledFooter>
      <FooterContent>
        <div>
          &copy; {new Date().getFullYear()} Privacy-Preserving Malware Detection
        </div>
        <SecurityBadge>
          <LockOutlined /> End-to-End Encrypted
          <SafetyCertificateOutlined style={{ marginLeft: 10 }} /> PSI Protocol Enabled
        </SecurityBadge>
      </FooterContent>
    </StyledFooter>
  );
};

export default Footer; 