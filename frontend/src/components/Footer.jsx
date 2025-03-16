import { Layout } from 'antd';
import styled from 'styled-components';
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;

const StyledFooter = styled(AntFooter)`
  text-align: center;
  background-color: #141414;
  color: var(--color-text-secondary);
  padding: 15px;
  border-top: 1px solid var(--color-border);
`;

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

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-success);
`;

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