import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  Breadcrumb, 
  Tabs, 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select,
  message,
  Avatar,
  Upload,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  SettingOutlined, 
  BellOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
  HomeOutlined
} from '@ant-design/icons';
import PrivacySettings from '../components/PrivacySettings';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SettingsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const ProfileCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const AvatarSection = styled.div`
  margin-right: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 576px) {
    margin-right: 0;
    margin-bottom: 16px;
    align-self: center;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const UserSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [form] = Form.useForm();
  
  // 示例用户数据
  const userData = {
    username: 'user123',
    email: 'user@example.com',
    name: '张三',
    phone: '13800138000',
    language: 'zh-CN',
    notifications: {
      email: true,
      browser: true,
      scanComplete: true,
      threatDetected: true,
      updates: false,
    }
  };
  
  // 初始化表单数据
  form.setFieldsValue(userData);
  
  // 处理表单提交
  const handleSubmit = (values) => {
    console.log('提交的表单数据:', values);
    message.success('个人资料已更新');
  };
  
  // 处理头像上传
  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      message.success('头像上传成功');
    }
  };
  
  // 头像上传按钮
  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );
  
  return (
    <SettingsContainer>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
          <span>首页</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <SettingOutlined />
          <span>用户设置</span>
        </Breadcrumb.Item>
      </Breadcrumb>
      
      <Title level={2}>用户设置</Title>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabPosition="left"
        style={{ minHeight: 500 }}
      >
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              个人资料
            </span>
          } 
          key="profile"
        >
          <ProfileCard>
            <Title level={4}>个人资料</Title>
            <Text type="secondary">管理您的账户信息</Text>
            
            <Divider />
            
            <ProfileHeader>
              <AvatarSection>
                <Avatar size={100} icon={<UserOutlined />} />
                <Upload 
                  showUploadList={false}
                  onChange={handleAvatarChange}
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    style={{ marginTop: 16 }}
                  >
                    更换头像
                  </Button>
                </Upload>
              </AvatarSection>
              
              <UserInfo>
                <Title level={4}>{userData.name}</Title>
                <Text type="secondary">用户名: {userData.username}</Text>
                <br />
                <Text type="secondary">邮箱: {userData.email}</Text>
              </UserInfo>
            </ProfileHeader>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <FormSection>
                <Title level={5}>基本信息</Title>
                
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[{ required: true, message: '请输入您的姓名' }]}
                >
                  <Input placeholder="请输入您的姓名" />
                </Form.Item>
                
                <Form.Item
                  name="email"
                  label="电子邮箱"
                  rules={[
                    { required: true, message: '请输入您的电子邮箱' },
                    { type: 'email', message: '请输入有效的电子邮箱' }
                  ]}
                >
                  <Input placeholder="请输入您的电子邮箱" />
                </Form.Item>
                
                <Form.Item
                  name="phone"
                  label="手机号码"
                >
                  <Input placeholder="请输入您的手机号码" />
                </Form.Item>
              </FormSection>
              
              <FormSection>
                <Title level={5}>偏好设置</Title>
                
                <Form.Item
                  name="language"
                  label="界面语言"
                >
                  <Select>
                    <Option value="zh-CN">简体中文</Option>
                    <Option value="en-US">English (US)</Option>
                  </Select>
                </Form.Item>
              </FormSection>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存更改
                </Button>
              </Form.Item>
            </Form>
          </ProfileCard>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <LockOutlined />
              安全设置
            </span>
          } 
          key="security"
        >
          <ProfileCard>
            <Title level={4}>安全设置</Title>
            <Text type="secondary">管理您的密码和安全选项</Text>
            
            <Divider />
            
            <Form
              layout="vertical"
            >
              <FormSection>
                <Title level={5}>修改密码</Title>
                
                <Form.Item
                  name="currentPassword"
                  label="当前密码"
                  rules={[{ required: true, message: '请输入当前密码' }]}
                >
                  <Input.Password placeholder="请输入当前密码" />
                </Form.Item>
                
                <Form.Item
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 8, message: '密码长度至少为8个字符' }
                  ]}
                >
                  <Input.Password placeholder="请输入新密码" />
                </Form.Item>
                
                <Form.Item
                  name="confirmPassword"
                  label="确认新密码"
                  rules={[
                    { required: true, message: '请确认新密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="请确认新密码" />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary">
                    更新密码
                  </Button>
                </Form.Item>
              </FormSection>
              
              <FormSection>
                <Title level={5}>两步验证</Title>
                
                <Form.Item
                  label="启用两步验证"
                >
                  <Switch defaultChecked={false} />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    登录时需要额外的验证码
                  </Text>
                </Form.Item>
              </FormSection>
            </Form>
          </ProfileCard>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BellOutlined />
              通知设置
            </span>
          } 
          key="notifications"
        >
          <ProfileCard>
            <Title level={4}>通知设置</Title>
            <Text type="secondary">管理您接收通知的方式和频率</Text>
            
            <Divider />
            
            <Form
              layout="vertical"
              initialValues={userData.notifications}
            >
              <FormSection>
                <Title level={5}>通知方式</Title>
                
                <Form.Item
                  name="email"
                  label="电子邮件通知"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="browser"
                  label="浏览器通知"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </FormSection>
              
              <FormSection>
                <Title level={5}>通知类型</Title>
                
                <Form.Item
                  name="scanComplete"
                  label="扫描完成通知"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="threatDetected"
                  label="检测到威胁通知"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="updates"
                  label="系统更新通知"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </FormSection>
              
              <Form.Item>
                <Button type="primary">
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </ProfileCard>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SafetyCertificateOutlined />
              隐私设置
            </span>
          } 
          key="privacy"
        >
          <PrivacySettings />
        </TabPane>
      </Tabs>
    </SettingsContainer>
  );
};

export default UserSettingsPage; 