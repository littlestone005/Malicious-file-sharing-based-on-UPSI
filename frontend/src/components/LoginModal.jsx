/**
 * 登录/注册模态框组件
 * 
 * 这个组件实现了用户登录和注册功能，包括：
 * 1. 用户类型选择（个人/企业）
 * 2. 登录表单
 * 3. 注册表单
 * 4. 表单验证和提交处理
 * 
 * 组件通过props与父组件通信，处理登录状态和模态框显示
 */

// 导入React钩子
import { useState } from 'react';
// 导入Ant Design组件
import { Modal, Tabs, Form, Input, Button, Typography, Radio, message } from 'antd';
// 导入Ant Design图标
import { UserOutlined, LockOutlined, BankOutlined, MailOutlined } from '@ant-design/icons';
// 导入样式组件库
import styled from 'styled-components';

// 从Typography组件中解构出需要的子组件
const { Title, Text } = Typography;
// 从Tabs组件中解构出TabPane子组件
const { TabPane } = Tabs;

/**
 * 用户类型选择区域样式
 * 
 * 设置底部外边距和文本居中对齐
 */
const UserTypeSelection = styled.div`
  margin-bottom: 24px;
  text-align: center;
`;

/**
 * 登录/注册模态框组件
 * 
 * @param {Object} props - 组件属性
 * @param {boolean} props.visible - 控制模态框显示/隐藏
 * @param {Function} props.onClose - 关闭模态框的回调函数
 * @param {Function} props.onLogin - 登录成功后的回调函数，接收用户数据
 */
const LoginModal = ({ visible, onClose, onLogin }) => {
  // 用户类型状态，默认为个人用户
  const [userType, setUserType] = useState('personal');
  // 创建登录表单实例
  const [loginForm] = Form.useForm();
  // 创建注册表单实例
  const [registerForm] = Form.useForm();

  /**
   * 处理登录表单提交
   * 
   * @param {Object} values - 表单值，包含username和password
   */
  const handleLogin = (values) => {
    // 在实际应用中，这里会调用API进行身份验证
    console.log('Login values:', { ...values, userType });
    
    // 模拟登录成功
    message.success(`${userType === 'personal' ? '个人' : '企业'}用户登录成功！`);
    
    // 将用户数据传递给父组件
    onLogin({
      username: values.username,
      userType: userType,
      // 在实际应用中，这里会包含从服务器返回的更多用户数据
    });
    
    // 关闭模态框
    onClose();
  };

  /**
   * 处理注册表单提交
   * 
   * @param {Object} values - 表单值，包含username、email、password等
   */
  const handleRegister = (values) => {
    // 在实际应用中，这里会调用API进行用户注册
    console.log('Register values:', { ...values, userType });
    
    // 模拟注册成功
    message.success(`${userType === 'personal' ? '个人' : '企业'}账户注册成功！`);
    
    // 关闭模态框
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null} // 不显示默认的底部按钮
      width={400}   // 设置模态框宽度
      centered      // 居中显示
    >
      {/* 模态框标题 */}
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        欢迎使用隐私保护恶意软件检测
      </Title>
      
      {/* 用户类型选择区域 */}
      <UserTypeSelection>
        <Radio.Group 
          value={userType} 
          onChange={(e) => setUserType(e.target.value)}
          buttonStyle="solid" // 实心按钮样式
        >
          <Radio.Button value="personal">个人用户</Radio.Button>
          <Radio.Button value="enterprise">企业用户</Radio.Button>
        </Radio.Group>
      </UserTypeSelection>
      
      {/* 登录/注册标签页 */}
      <Tabs defaultActiveKey="login">
        {/* 登录标签页 */}
        <TabPane tab="登录" key="login">
          <Form
            form={loginForm}
            name="login"
            onFinish={handleLogin}
            layout="vertical"
          >
            {/* 用户名输入框 */}
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名！' }]} // 验证规则：必填
            >
              <Input 
                // 根据用户类型显示不同的图标
                prefix={userType === 'personal' ? <UserOutlined /> : <BankOutlined />} 
                // 根据用户类型显示不同的占位符文本
                placeholder={userType === 'personal' ? "用户名" : "企业账号"}
              />
            </Form.Item>
            
            {/* 密码输入框 */}
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码！' }]} // 验证规则：必填
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码"
              />
            </Form.Item>
            
            {/* 登录按钮 */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        
        {/* 注册标签页 */}
        <TabPane tab="注册" key="register">
          <Form
            form={registerForm}
            name="register"
            onFinish={handleRegister}
            layout="vertical"
          >
            {/* 用户名/企业名称输入框 */}
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名！' }]} // 验证规则：必填
            >
              <Input 
                // 根据用户类型显示不同的图标
                prefix={userType === 'personal' ? <UserOutlined /> : <BankOutlined />} 
                // 根据用户类型显示不同的占位符文本
                placeholder={userType === 'personal' ? "用户名" : "企业名称"}
              />
            </Form.Item>
            
            {/* 邮箱输入框 */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱！' }, // 验证规则：必填
                { type: 'email', message: '请输入有效的邮箱地址！' } // 验证规则：邮箱格式
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="邮箱"
              />
            </Form.Item>
            
            {/* 密码输入框 */}
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码！' }]} // 验证规则：必填
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码"
              />
            </Form.Item>
            
            {/* 确认密码输入框 */}
            <Form.Item
              name="confirmPassword"
              dependencies={['password']} // 依赖于password字段，当password变化时重新验证
              rules={[
                { required: true, message: '请确认密码！' }, // 验证规则：必填
                // 自定义验证器：检查两次密码输入是否一致
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve(); // 验证通过
                    }
                    return Promise.reject(new Error('两次输入的密码不一致！')); // 验证失败
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="确认密码"
              />
            </Form.Item>
            
            {/* 注册按钮 */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                注册
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default LoginModal; 