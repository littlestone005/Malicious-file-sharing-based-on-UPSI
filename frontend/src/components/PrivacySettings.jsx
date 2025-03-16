/**
 * 隐私设置组件
 * 
 * 这个组件提供用户隐私偏好的配置界面，包括：
 * 1. PSI协议启用/禁用
 * 2. 本地哈希计算设置
 * 3. 隐私保护级别调整
 * 4. 元数据匿名化选项
 * 5. 数据保留策略选择
 * 6. 匿名统计数据分享设置
 * 
 * 组件使用各种表单控件（开关、滑块、单选按钮）让用户可视化地配置隐私选项
 */

import React, { useState } from 'react';
// 导入样式组件库
import styled from 'styled-components';
// 导入Ant Design组件
import { 
  Card, 
  Switch, 
  Slider, 
  Typography, 
  Divider, 
  Button, 
  Radio, 
  Tooltip, 
  Alert,
  Space,
  Collapse
} from 'antd';
// 导入Ant Design图标
import { 
  LockOutlined, 
  InfoCircleOutlined, 
  EyeInvisibleOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

// 从Typography组件中解构出需要的子组件
const { Title, Text, Paragraph } = Typography;
// 从Collapse组件中解构出Panel子组件
const { Panel } = Collapse;

/**
 * 设置卡片样式
 * 
 * 设置底部外边距、圆角和阴影效果
 * 增强卡片的视觉层次感
 */
const SettingsCard = styled(Card)`
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

/**
 * 设置项容器样式
 * 
 * 设置底部外边距和垂直布局
 * 用于包含单个设置项的所有元素
 */
const SettingItem = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
`;

/**
 * 设置项头部样式
 * 
 * 使用flex布局使标题和控件分别位于左右两侧
 * 设置底部外边距
 */
const SettingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

/**
 * 设置项标题样式
 * 
 * 设置字体粗细、大小和flex布局
 * 用于显示设置项的名称
 */
const SettingTitle = styled(Text)`
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

/**
 * 设置项图标样式
 * 
 * 设置右侧外边距和颜色
 * 用于在设置项标题前显示图标
 */
const SettingIcon = styled.span`
  margin-right: 8px;
  color: var(--color-primary);
`;

/**
 * 设置项描述样式
 * 
 * 设置底部外边距和颜色
 * 用于显示设置项的详细说明
 */
const SettingDescription = styled(Paragraph)`
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.65);
`;

/**
 * 滑块包装器样式
 * 
 * 设置水平内边距
 * 用于包裹滑块控件
 */
const SliderWrapper = styled.div`
  padding: 0 10px;
`;

/**
 * 信息框样式
 * 
 * 设置背景色、圆角、内边距和上边距
 * 用于显示当前设置的详细信息
 */
const InfoBox = styled.div`
  background-color: rgba(24, 144, 255, 0.1);
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
`;

/**
 * 隐私设置组件
 * 
 * 提供用户配置隐私相关选项的界面
 * 
 * @returns {JSX.Element} 隐私设置组件
 */
const PrivacySettings = () => {
  /**
   * 隐私设置状态
   * 
   * 包含所有隐私相关选项的当前值
   */
  const [settings, setSettings] = useState({
    enablePSI: true,              // 是否启用PSI协议
    localHashingOnly: true,       // 是否仅在本地计算哈希值
    anonymizeMetadata: true,      // 是否匿名化文件元数据
    privacyLevel: 3,              // 隐私保护级别（1-5）
    dataRetention: 'none',        // 数据保留策略（'none', 'session', '30days'）
    shareStatistics: false,       // 是否分享匿名统计数据
  });
  
  /**
   * 处理开关控件变化
   * 
   * 返回一个函数，用于更新指定设置项的值
   * 
   * @param {string} name - 设置项名称
   * @returns {Function} 处理开关变化的函数
   */
  const handleSwitchChange = (name) => (checked) => {
    setSettings({
      ...settings,
      [name]: checked
    });
  };
  
  /**
   * 处理滑块控件变化
   * 
   * 返回一个函数，用于更新指定设置项的值
   * 
   * @param {string} name - 设置项名称
   * @returns {Function} 处理滑块变化的函数
   */
  const handleSliderChange = (name) => (value) => {
    setSettings({
      ...settings,
      [name]: value
    });
  };
  
  /**
   * 处理单选按钮控件变化
   * 
   * 返回一个函数，用于更新指定设置项的值
   * 
   * @param {string} name - 设置项名称
   * @returns {Function} 处理单选按钮变化的函数
   */
  const handleRadioChange = (name) => (e) => {
    setSettings({
      ...settings,
      [name]: e.target.value
    });
  };
  
  /**
   * 保存设置
   * 
   * 将当前设置保存到服务器
   * 实际应用中应该调用API
   */
  const handleSaveSettings = () => {
    // 这里应该调用API保存设置
    console.log('保存设置:', settings);
    // 显示成功消息
  };
  
  /**
   * 重置设置
   * 
   * 将所有设置恢复为默认值
   */
  const handleResetSettings = () => {
    setSettings({
      enablePSI: true,
      localHashingOnly: true,
      anonymizeMetadata: true,
      privacyLevel: 3,
      dataRetention: 'none',
      shareStatistics: false,
    });
  };
  
  return (
    <div>
      <SettingsCard>
        {/* 设置卡片标题 */}
        <Title level={4}><SettingOutlined /> 隐私设置</Title>
        <Paragraph>
          配置您的隐私偏好，控制您的数据如何被处理和保护。
        </Paragraph>
        
        <Divider />
        
        {/* PSI协议设置项 */}
        <SettingItem>
          <SettingHeader>
            <SettingTitle>
              <SettingIcon><LockOutlined /></SettingIcon>
              启用隐私保护集合交集 (PSI)
            </SettingTitle>
            <Switch 
              checked={settings.enablePSI} 
              onChange={handleSwitchChange('enablePSI')}
            />
          </SettingHeader>
          <SettingDescription>
            使用PSI协议进行恶意软件检测，确保您的文件哈希不会被直接暴露给服务器。
            <Tooltip title="PSI协议允许在不暴露您的文件内容的情况下检测恶意软件。">
              <QuestionCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </SettingDescription>
          
          {/* 禁用PSI时显示警告 */}
          {!settings.enablePSI && (
            <Alert
              message="隐私风险提示"
              description="禁用PSI将降低您的隐私保护级别。您的文件哈希可能会被发送到服务器进行比对。"
              type="warning"
              showIcon
            />
          )}
        </SettingItem>
        
        {/* 本地哈希计算设置项 */}
        <SettingItem>
          <SettingHeader>
            <SettingTitle>
              <SettingIcon><EyeInvisibleOutlined /></SettingIcon>
              仅在本地计算哈希值
            </SettingTitle>
            <Switch 
              checked={settings.localHashingOnly} 
              onChange={handleSwitchChange('localHashingOnly')}
              disabled={!settings.enablePSI}
            />
          </SettingHeader>
          <SettingDescription>
            文件哈希值仅在您的设备上计算，不会上传原始文件到服务器。
          </SettingDescription>
        </SettingItem>
        
        {/* 隐私保护级别设置项 */}
        <SettingItem>
          <SettingHeader>
            <SettingTitle>
              <SettingIcon><SafetyCertificateOutlined /></SettingIcon>
              隐私保护级别
            </SettingTitle>
          </SettingHeader>
          <SettingDescription>
            调整隐私保护的强度。更高的级别提供更好的隐私保护，但可能会影响检测效率。
          </SettingDescription>
          <SliderWrapper>
            <Slider
              min={1}
              max={5}
              value={settings.privacyLevel}
              onChange={handleSliderChange('privacyLevel')}
              marks={{
                1: '基本',
                3: '平衡',
                5: '最大'
              }}
              disabled={!settings.enablePSI}
            />
          </SliderWrapper>
          
          {/* 显示当前隐私级别的详细说明 */}
          <InfoBox>
            <Text strong>当前设置: </Text>
            {settings.privacyLevel === 1 && '基本隐私保护，优先考虑检测效率。'}
            {settings.privacyLevel === 2 && '较低隐私保护，良好的检测效率。'}
            {settings.privacyLevel === 3 && '平衡的隐私保护和检测效率。'}
            {settings.privacyLevel === 4 && '增强的隐私保护，可能略微降低检测效率。'}
            {settings.privacyLevel === 5 && '最大隐私保护，使用更强的加密和混淆技术。'}
          </InfoBox>
        </SettingItem>
        
        {/* 元数据匿名化设置项 */}
        <SettingItem>
          <SettingHeader>
            <SettingTitle>
              <SettingIcon><InfoCircleOutlined /></SettingIcon>
              匿名化文件元数据
            </SettingTitle>
            <Switch 
              checked={settings.anonymizeMetadata} 
              onChange={handleSwitchChange('anonymizeMetadata')}
            />
          </SettingHeader>
          <SettingDescription>
            从扫描过程中移除文件名、创建日期等可识别信息。
          </SettingDescription>
        </SettingItem>
        
        {/* 数据保留策略设置项 */}
        <SettingItem>
          <SettingHeader>
            <SettingTitle>
              <SettingIcon><InfoCircleOutlined /></SettingIcon>
              数据保留策略
            </SettingTitle>
          </SettingHeader>
          <SettingDescription>
            选择扫描后数据的保留时间。
          </SettingDescription>
          <Radio.Group 
            value={settings.dataRetention} 
            onChange={handleRadioChange('dataRetention')}
          >
            <Space direction="vertical">
              <Radio value="none">不保留任何数据（扫描后立即删除）</Radio>
              <Radio value="session">仅在会话期间保留（关闭浏览器后删除）</Radio>
              <Radio value="30days">保留30天（用于改进检测能力）</Radio>
            </Space>
          </Radio.Group>
        </SettingItem>
        
        {/* 匿名统计数据分享设置项 */}
        <SettingItem>
          <SettingHeader>
            <SettingTitle>
              <SettingIcon><InfoCircleOutlined /></SettingIcon>
              分享匿名统计数据
            </SettingTitle>
            <Switch 
              checked={settings.shareStatistics} 
              onChange={handleSwitchChange('shareStatistics')}
            />
          </SettingHeader>
          <SettingDescription>
            分享匿名使用统计数据，帮助我们改进服务。不包含任何个人身份信息或文件内容。
          </SettingDescription>
        </SettingItem>
        
        {/* 隐私保护信息折叠面板 */}
        <Collapse>
          <Panel header="了解更多关于隐私保护的信息" key="1">
            <Paragraph>
              <strong>隐私保护集合交集 (PSI) 协议</strong>是一种密码学技术，允许两方比较他们的数据集，
              而不会泄露除了交集之外的任何信息。在我们的应用中，这意味着您的文件哈希值不会被直接暴露给服务器，
              服务器也不会知道您拥有哪些特定文件，除非它们与已知的恶意软件哈希匹配。
            </Paragraph>
            <Paragraph>
              <strong>本地哈希计算</strong>确保您的原始文件内容永远不会离开您的设备。我们只处理文件的哈希值，
              这是文件内容的数学表示，无法被逆向工程回原始文件。
            </Paragraph>
            <Paragraph>
              <strong>元数据匿名化</strong>移除可能识别您或您的文件的信息，如文件名、创建日期和用户标识符。
            </Paragraph>
          </Panel>
        </Collapse>
        
        <Divider />
        
        {/* 底部按钮区域 */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleResetSettings}>
            重置为默认设置
          </Button>
          <Button type="primary" onClick={handleSaveSettings}>
            保存设置
          </Button>
        </div>
      </SettingsCard>
    </div>
  );
};

export default PrivacySettings; 