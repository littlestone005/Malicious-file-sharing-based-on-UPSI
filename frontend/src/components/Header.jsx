/**
 * 页面头部组件
 * 
 * 这个组件实现了应用的顶部导航栏，包括：
 * 1. 应用logo和标题
 * 2. 主导航菜单
 * 3. 用户登录/注册入口
 * 4. 用户信息显示和下拉菜单
 * 5. 区分个人用户和企业用户的UI显示
 */

// 导入React钩子和上下文
import { useState, useContext } from 'react';
// 导入路由相关组件和钩子
import { Link, useLocation } from 'react-router-dom';
// 导入Ant Design组件
import { Layout, Menu, Button, Dropdown, Avatar, Space, Tag, Spin, Modal, message } from 'antd';
// 导入Ant Design图标
import { 
  SafetyOutlined,  // 安全/盾牌图标
  ScanOutlined,    // 扫描图标
  InfoCircleOutlined,  // 信息图标
  HomeOutlined,    // 首页图标
  HistoryOutlined, // 历史记录图标
  UserOutlined,    // 用户图标
  SettingOutlined, // 设置图标
  LogoutOutlined,  // 登出图标
  BankOutlined,    // 企业/银行图标
  LoginOutlined,   // 登录图标
  BugOutlined,      // 恶意软件/bug图标
  DatabaseOutlined  // 数据库图标
} from '@ant-design/icons';
// 导入样式组件库
import styled from 'styled-components';
// 导入登录模态框组件
import LoginModal from './LoginModal';
// 导入用户上下文
import { UserContext } from '../App';

// 从Ant Design Layout组件中解构出Header组件
const { Header: AntHeader } = Layout;

/**
 * 自定义样式的头部组件
 */
const StyledHeader = styled(AntHeader)`
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #141414;
  border-bottom: 1px solid var(--color-border);
`;

/**
 * Logo区域样式
 */
const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-right: 30px;
  
  h1 {
    color: white;
    margin: 0 0 0 10px;
    font-size: 18px;
    
    /* 响应式设计：在小屏幕上隐藏文字 */
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

/**
 * 盾牌图标样式
 */
const ShieldIcon = styled(SafetyOutlined)`
  font-size: 24px;
  color: var(--color-primary);
`;

/**
 * 自定义菜单样式
 */
const StyledMenu = styled(Menu)`
  flex: 1;
  background: transparent;
  border-bottom: none;
`;

/**
 * 用户区域样式
 */
const UserSection = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
`;

/**
 * 用户头像样式
 */
const UserAvatar = styled(Avatar)`
  cursor: pointer;
  background-color: var(--color-primary);
`;

/**
 * 用户信息区域样式
 */
const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

/**
 * 头部组件
 * 
 * 实现应用的顶部导航栏，包括导航菜单和用户认证
 */
const Header = () => {
  // 获取当前路由位置，用于高亮显示当前页面对应的菜单项
  const location = useLocation();
  // 控制登录模态框的显示状态
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  // 退出确认对话框状态
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  // 从上下文中获取用户状态和设置函数
  const { user, setUser } = useContext(UserContext);
  
  /**
   * 处理用户登录
   * 
   * @param {Object} userData - 用户数据，包含用户名和类型等信息
   */
  const handleLogin = (userData) => {
    setUser(userData);
  };
  
  /**
   * 处理用户退出登录
   */
  const handleLogout = () => {
    // 打开确认对话框
    setLogoutModalVisible(true);
  };
  
  /**
   * 确认退出登录
   */
  const confirmLogout = () => {
    // 清除本地存储中的用户数据和令牌
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 更新用户上下文
    setUser(null);
    
    // 关闭对话框
    setLogoutModalVisible(false);
    
    // 显示退出成功消息
    message.success('已成功退出登录');
    
    // 刷新页面，重定向到首页
    window.location.href = '/';
  };
  
  /**
   * 用户下拉菜单配置
   */
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/settings">个人资料&设置</Link>,
    },
    {
      type: 'divider', // 分隔线
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>退出登录</span>,
    },
  ];
  
  /**
   * 主导航菜单配置
   */
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
      label: <Link to="/about">关于我们</Link>,
    },
    {
      key: '/upload-malware',
      icon: <BugOutlined />,
      label: <Link to="/upload-malware">恶意软件上传</Link>,
    },
    {
      key: '/test-connection',
      icon: <SettingOutlined />,
      label: <Link to="/test-connection">测试连接</Link>,
    },
    {
      key: '/database-view',
      icon: <DatabaseOutlined />,
      label: <Link to="/database-view">数据库查看</Link>,
    },
  ];

  return (
    <StyledHeader>
      {/* Logo和应用名称 */}
      <Logo>
        <ShieldIcon />
        <h1>隐私保护恶意软件检测</h1>
      </Logo>
      
      {/* 主导航菜单 */}
      <StyledMenu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]} // 根据当前路径高亮对应菜单项
        items={menuItems}
      />
      
      {/* 用户区域：根据登录状态显示不同内容 */}
      <UserSection>
        {user ? (
          // 已登录状态：显示用户类型标签和头像下拉菜单
          <UserInfo>
            {/* 用户类型标签：企业用户显示金色，个人用户显示蓝色 */}
            <Tag color={user.userType === 'enterprise' ? 'gold' : 'blue'} style={{ marginRight: 8 }}>
              {user.userType === 'enterprise' ? <BankOutlined /> : <UserOutlined />}
              {user.userType === 'enterprise' ? ' 企业用户' : ' 个人用户'}
            </Tag>
            
            {/* 用户头像下拉菜单 */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              {/* 根据用户类型显示不同图标 */}
              <UserAvatar icon={user.userType === 'enterprise' ? <BankOutlined /> : <UserOutlined />} />
            </Dropdown>
          </UserInfo>
        ) : (
          // 未登录状态：显示登录按钮
          <Button 
            type="primary" 
            icon={<LoginOutlined />}
            onClick={() => setLoginModalVisible(true)}
          >
            登录
          </Button>
        )}
      </UserSection>
      
      {/* 登录模态框：根据visible属性控制显示/隐藏 */}
      <LoginModal 
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onLogin={handleLogin}
      />
      
      {/* 退出登录确认对话框 */}
      <Modal
        title="确认退出"
        open={logoutModalVisible}
        onOk={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
        okText="确认退出"
        cancelText="取消"
      >
        <p>确定要退出登录吗？</p>
      </Modal>
    </StyledHeader>
  );
};

export default Header;