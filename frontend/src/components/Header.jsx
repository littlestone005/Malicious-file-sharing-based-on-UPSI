import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { 
  SafetyOutlined, 
  ScanOutlined, 
  InfoCircleOutlined, 
  HomeOutlined,
  HistoryOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Header: AntHeader } = Layout;

const StyledHeader = styled(AntHeader)`
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #141414;
  border-bottom: 1px solid var(--color-border);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-right: 30px;
  
  h1 {
    color: white;
    margin: 0 0 0 10px;
    font-size: 18px;
    
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const ShieldIcon = styled(SafetyOutlined)`
  font-size: 24px;
  color: var(--color-primary);
`;

const StyledMenu = styled(Menu)`
  flex: 1;
  background: transparent;
  border-bottom: none;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
`;

const UserAvatar = styled(Avatar)`
  cursor: pointer;
  background-color: var(--color-primary);
`;

const Header = () => {
  const location = useLocation();
  
  // 用户下拉菜单项
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/settings">个人资料</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">设置</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];
  
  // 主导航菜单项
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/scan',
      icon: <ScanOutlined />,
      label: <Link to="/scan">扫描文件</Link>,
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: <Link to="/history">扫描历史</Link>,
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">关于</Link>,
    },
  ];

  return (
    <StyledHeader>
      <Logo>
        <ShieldIcon />
        <h1>隐私保护恶意软件检测</h1>
      </Logo>
      <StyledMenu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />
      
      <UserSection>
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <UserAvatar icon={<UserOutlined />} />
        </Dropdown>
      </UserSection>
    </StyledHeader>
  );
};

export default Header; 