/**
 * 用户设置页面组件
 * 
 * 这个组件实现了用户设置页面，包括：
 * 1. 个人资料设置（基本信息、偏好设置）
 * 2. 安全设置（密码修改、两步验证）
 * 3. 通知设置（通知方式、通知类型）
 * 4. 隐私设置（使用PrivacySettings组件）
 * 
 * 页面使用标签页布局，方便用户在不同设置类别间切换
 */

import React, { useState, useEffect } from 'react';
// 导入样式组件库
import styled from 'styled-components';
// 导入Ant Design组件
import { 
  Typography, 
  Tabs, 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select,
  message,
  Divider,
  Spin
} from 'antd';
// 导入Ant Design图标
import { 
  UserOutlined, 
  LockOutlined, 
  SettingOutlined, 
  BellOutlined,
  SafetyCertificateOutlined,
  HomeOutlined
} from '@ant-design/icons';
// 导入隐私设置组件
import PrivacySettings from '../components/PrivacySettings';
// 导入API
import { authAPI } from '../utils/api';

// 从Typography组件中解构出需要的子组件
const { Title, Text } = Typography;
// 从Tabs组件中解构出TabPane子组件
const { TabPane } = Tabs;
// 从Select组件中解构出Option子组件
const { Option } = Select;

/**
 * 设置页面容器样式
 * 
 * 设置最大宽度和水平居中
 * 限制内容宽度，提高可读性
 */
const SettingsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

/**
 * 个人资料卡片样式
 * 
 * 设置底部外边距、圆角和阴影效果
 * 增强卡片的视觉层次感
 */
const ProfileCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

/**
 * 个人资料头部样式
 * 
 * 使用flex布局对齐头像和用户信息
 * 在移动设备上切换为垂直布局
 */
const ProfileHeader = styled.div`
  margin-bottom: 24px;
`;

/**
 * 用户信息样式
 * 
 * 使用flex: 1使其占据剩余空间
 */
const UserInfo = styled.div`
  flex: 1;
`;

/**
 * 表单区域样式
 * 
 * 设置底部外边距
 * 用于分隔不同的表单部分
 */
const FormSection = styled.div`
  margin-bottom: 24px;
`;

/**
 * 用户设置页面组件
 * 
 * 提供用户配置个人资料、安全、通知和隐私设置的界面
 * 
 * @returns {JSX.Element} 用户设置页面组件
 */
const UserSettingsPage = () => {
  // 当前活动标签页状态
  const [activeTab, setActiveTab] = useState('profile');
  // 创建表单实例
  const [profileForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationsForm] = Form.useForm();
  
  // 用户数据状态
  const [userData, setUserData] = useState(null);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 表单提交状态
  const [submitting, setSubmitting] = useState(false);
  
  // 页面加载时获取用户数据
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = await authAPI.getCurrentUser();
        setUserData(user);
        
        // 使用API返回的数据初始化表单
        profileForm.setFieldsValue({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          language: user.preferences?.language || 'zh-CN'
        });
        
        // 初始化通知表单
        notificationsForm.setFieldsValue({
          email: user.notification_settings?.email || false,
          browser: user.notification_settings?.browser || false,
          scanComplete: user.notification_settings?.scan_complete || false,
          threatDetected: user.notification_settings?.threat_detected || false,
          updates: user.notification_settings?.updates || false
        });
        
      } catch (error) {
        message.error('获取用户信息失败，请重试');
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [profileForm, notificationsForm]);
  
  /**
   * 处理个人资料表单提交
   * 
   * 保存用户修改的个人资料
   * 
   * @param {Object} values - 表单提交的值
   */
  const handleProfileSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // 构建更新数据
      const updateData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        preferences: {
          language: values.language
        }
      };
      
      // 调用API更新用户信息
      await authAPI.updateUser(updateData);
      
      // 更新本地状态
      setUserData({
        ...userData,
        ...updateData
      });
      
      message.success('个人资料已更新');
    } catch (error) {
      message.error('更新个人资料失败，请重试');
      console.error('Failed to update profile:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  /**
   * 处理密码更新
   * 
   * @param {Object} values - 表单提交的值
   */
  const handlePasswordUpdate = async (values) => {
    try {
      setSubmitting(true);
      
      // 调用API更新密码
      await authAPI.updateUser({
        current_password: values.currentPassword,
        password: values.newPassword
      });
      
      message.success('密码已更新');
      securityForm.resetFields();
    } catch (error) {
      message.error('更新密码失败：' + (error.message || '请重试'));
      console.error('Failed to update password:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  /**
   * 处理通知设置更新
   * 
   * @param {Object} values - 表单提交的值
   */
  const handleNotificationsUpdate = async (values) => {
    try {
      setSubmitting(true);
      
      // 构建通知设置数据
      const notificationSettings = {
        notification_settings: {
          email: values.email,
          browser: values.browser,
          scan_complete: values.scanComplete,
          threat_detected: values.threatDetected,
          updates: values.updates
        }
      };
      
      // 调用API更新通知设置
      await authAPI.updateUser(notificationSettings);
      
      // 更新本地状态
      setUserData({
        ...userData,
        notification_settings: notificationSettings.notification_settings
      });
      
      message.success('通知设置已更新');
    } catch (error) {
      message.error('更新通知设置失败，请重试');
      console.error('Failed to update notification settings:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // 如果数据正在加载，显示加载状态
  if (loading) {
    return (
      <SettingsContainer>
        <Spin tip="加载中..." size="large" style={{ display: 'block', margin: '100px auto' }} />
      </SettingsContainer>
    );
  }
  
  return (
    <SettingsContainer>
      {/* 页面标题 */}
      <Title level={2}>用户设置</Title>
      
      {/* 设置标签页 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabPosition="left"
        style={{ minHeight: 500 }}
      >
        {/* 个人资料标签页 */}
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
            
            {/* 个人资料头部：基本信息 */}
            <ProfileHeader>
              <UserInfo>
                <Title level={4}>{userData?.name || userData?.username}</Title>
                <Text type="secondary">用户名: {userData?.username}</Text>
                <br />
                <Text type="secondary">邮箱: {userData?.email}</Text>
              </UserInfo>
            </ProfileHeader>
            
            {/* 个人资料表单 */}
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileSubmit}
            >
              {/* 基本信息表单区域 */}
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
              
              {/* 偏好设置表单区域 */}
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
              
              {/* 提交按钮 */}
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  保存更改
                </Button>
              </Form.Item>
            </Form>
          </ProfileCard>
        </TabPane>
        
        {/* 安全设置标签页 */}
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
            
            {/* 安全设置表单 */}
            <Form
              form={securityForm}
              layout="vertical"
              onFinish={handlePasswordUpdate}
            >
              {/* 修改密码表单区域 */}
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
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    更新密码
                  </Button>
                </Form.Item>
              </FormSection>
              
              {/* 两步验证表单区域 - 暂时保留但禁用 */}
              <FormSection>
                <Title level={5}>两步验证</Title>
                
                <Form.Item
                  label="启用两步验证"
                >
                  <Switch disabled defaultChecked={false} />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    登录时需要额外的验证码（功能开发中）
                  </Text>
                </Form.Item>
              </FormSection>
            </Form>
          </ProfileCard>
        </TabPane>
        
        {/* 通知设置标签页 */}
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
            
            {/* 通知设置表单 */}
            <Form
              form={notificationsForm}
              layout="vertical"
              onFinish={handleNotificationsUpdate}
            >
              {/* 通知方式表单区域 */}
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
              
              {/* 通知类型表单区域 */}
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
              
              {/* 提交按钮 */}
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </ProfileCard>
        </TabPane>
        
        {/* 隐私设置标签页 */}
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