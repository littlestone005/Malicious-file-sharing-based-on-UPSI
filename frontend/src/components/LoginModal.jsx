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
// 导入API模块
import { authAPI } from '../utils/api';

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
  // 添加加载状态
  const [loading, setLoading] = useState(false);

  /**
   * 处理登录表单提交
   * 
   * @param {Object} values - 表单值，包含username和password
   */
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const response = await authAPI.login(values.username, values.password);
      
      console.log('Login response detailed:', response);
      
      // 保存token和用户信息
      const token = response.access_token || response.data?.access_token;
      if (!token) {
        throw new Error('Login response is missing access token');
      }
      
      localStorage.setItem('token', token);
      
      const userData = {
        id: response.user_id || response.data?.user_id,
        username: values.username,
        userType: userType
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      message.success('登录成功！');
      
      if (typeof onLogin === 'function') {
        onLogin(userData);
      }
      
      onClose();
    } catch (error) {
      console.error('Login error:', error);  // 添加错误日志
      message.error(error.message || '登录失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理注册表单提交
   * 
   * @param {Object} values - 表单值，包含username、email、password等
   */
  const handleRegister = async (values) => {
    try {
      setLoading(true);
      // 检查用户名是否可用
      const { available } = await authAPI.checkUsername(values.username);
      if (!available) {
        message.error('用户名已被使用！');
        return;
      }

      // 注册新用户
      const userData = {
        username: values.username,
        email: values.email,
        password: values.password
      };
      await authAPI.register(userData);
      
      message.success('注册成功！请登录');
      // 切换到登录标签
      loginForm.setFieldsValue({
        username: values.username,
        password: values.password
      });
    } catch (error) {
      message.error(error.message || '注册失败，请重试！');
    } finally {
      setLoading(false);
    }
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
                disabled={loading}
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
                disabled={loading}
              />
            </Form.Item>
            
            {/* 登录按钮 */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
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
              rules={[
                { required: true, message: '请输入用户名！' },
                { min: 3, message: '用户名至少3个字符！' },
                { max: 20, message: '用户名最多20个字符！' }
              ]}
            >
              <Input 
                // 根据用户类型显示不同的图标
                prefix={userType === 'personal' ? <UserOutlined /> : <BankOutlined />} 
                // 根据用户类型显示不同的占位符文本
                placeholder={userType === 'personal' ? "用户名" : "企业名称"}
                disabled={loading}
              />
            </Form.Item>
            
            {/* 邮箱输入框 */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱！' },
                { type: 'email', message: '请输入有效的邮箱地址！' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="邮箱"
                disabled={loading}
              />
            </Form.Item>
            
            {/* 密码输入框 */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码！' },
                { min: 6, message: '密码至少6个字符！' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码"
                disabled={loading}
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
                disabled={loading}
              />
            </Form.Item>
            
            {/* 注册按钮 */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
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