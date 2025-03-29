/**
 * 扫描页面组件
 * 
 * 这个组件实现了文件扫描流程，包括：
 * 1. 文件选择和上传
 * 2. 扫描进度显示
 * 3. 扫描完成提示
 * 4. 企业版特性支持
 * 
 * 页面使用步骤条展示当前扫描进度，并根据用户类型显示不同的功能
 */

import { useState, useContext, useEffect } from 'react';
import { Typography, Card, Steps, Button, Badge, Alert, Spin, message } from 'antd';// 导入Ant Design组件
import { useNavigate } from 'react-router-dom';// 导入路由导航钩子
import { FileAddOutlined, ScanOutlined, SafetyCertificateOutlined, BankOutlined, LoginOutlined } from '@ant-design/icons';// 导入Ant Design图标
import styled from 'styled-components';// 导入样式组件库
import FileUploader from '../components/FileUploader';// 导入文件上传器组件
import { UserContext } from '../App';// 导入用户上下文
import LoginModal from '../components/LoginModal';
import { scanAPI } from '../utils/api';// 导入API工具

// 从Typography组件中解构出需要的子组件
const { Title, Paragraph } = Typography;

/**
 * 扫描容器样式
 * 
 * 设置最大宽度和水平居中
 * 限制内容宽度，提高可读性
 */
const ScanContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

/**
 * 步骤条容器样式
 * 
 * 设置上下外边距
 * 用于包含扫描流程的步骤条
 */
const StepsContainer = styled.div`
  margin: 30px 0;
`;

/**
 * 内容卡片样式
 * 
 * 设置上下外边距
 * 用于包含当前步骤的内容
 */
const ContentCard = styled(Card)`
  margin: 30px 0;
`;

/**
 * 企业标签样式
 * 
 * 设置左侧外边距
 * 用于在标题旁显示企业版标识
 */
const EnterpriseTag = styled(Badge)`
  margin-left: 10px;
`;

/**
 * 登录提醒样式
 * 
 * 设置底部外边距
 * 用于显示未登录提醒消息
 */
const LoginAlert = styled(Alert)`
  margin-bottom: 20px;
`;

/**
 * 加载中容器样式
 */
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
`;

/**
 * 扫描页面组件
 * 
 * 管理文件扫描流程，包括文件上传、扫描和结果导航
 * 
 * @param {Object} props - 组件属性
 * @param {Function} props.setScanResults - 设置扫描结果的函数
 * @returns {JSX.Element} 扫描页面组件
 */
const ScanPage = ({ setScanResults }) => {
  // 路由导航钩子
  const navigate = useNavigate();
  // 获取用户上下文
  const { user, setUser } = useContext(UserContext);
  // 当前步骤状态
  const [currentStep, setCurrentStep] = useState(0);
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 页面初始化状态
  const [initializing, setInitializing] = useState(true);
  const [loginModalVisible, setLoginModalVisible] = useState(false); // 控制登录模态框的显示

  // 判断是否为企业用户
  const isEnterpriseUser = user?.userType === 'enterprise';
  // 判断用户是否已登录
  const isLoggedIn = !!user;

  /**
   * 页面初始化效果
   * 
   * 短暂延迟后将页面设置为已初始化状态，防止闪烁
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);


  /**
   * 处理登录按钮点击，显示登录模态框
   */
  const handleLoginClick = () => {
    setLoginModalVisible(true);
  };

  /**
   * 处理用户登录
   * 
   * @param {Object} userData - 登录后的用户数据
   */
  const handleLogin = (userData) => {
    setUser(userData);
  };

  /**
   * 处理文件处理完成事件
   * 
   * 设置扫描结果，更新步骤，并导航到结果页面
   * 
   * @param {Object} results - 扫描结果数据
   */
  const handleFilesProcessed = async (results) => {
    try {
      // 更新步骤到"扫描中"
      setCurrentStep(1);
      
      // 提取文件哈希信息
      const fileHashes = results.hashes.map(file => ({
        hash: file.hash,
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType
      }));
      
      console.log('提交以下文件哈希进行检测:', fileHashes);
      
      // 调用后端API检测文件哈希
      const response = await scanAPI.checkFileHashes(fileHashes, results.usePSI);
      console.log('检测结果:', response);
      
      // 将API返回的结果与原始文件信息合并
      const mergedResults = {
        ...results,
        scanId: response.scan_id || Math.random().toString(36).substring(2, 15),
        detectionResults: response.results || [],
        timestamp: new Date().toISOString()
      };
      
      // 设置扫描结果
      setScanResults(mergedResults);
      
      // 更新步骤到"结果"
      setCurrentStep(2);
      
      // 短暂延迟后导航到结果页面
      setTimeout(() => {
        navigate(`/results/${mergedResults.scanId}`);
      }, 1000);
    } catch (error) {
      console.error('扫描文件失败:', error);
      message.error('文件扫描失败，请重试');
      // 重置步骤到"选择文件"
      setCurrentStep(0);
      // 关闭加载状态
      setIsLoading(false);
    }
  };

  /**
   * 扫描步骤配置
   * 
   * 定义扫描流程的三个步骤：选择文件、扫描中、结果
   */
  const steps = [
    {
      title: '选择文件',
      icon: <FileAddOutlined />,
      content: (
        <FileUploader 
          onFilesProcessed={handleFilesProcessed}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isDisabled={!isLoggedIn}
          onLoginClick={handleLoginClick}
        />
      ),
    },
    {
      title: '扫描中',
      icon: <ScanOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <ScanOutlined style={{ fontSize: '48px', color: 'var(--color-primary)' }} spin />
          <Title level={3} style={{ marginTop: '20px' }}>正在扫描文件...</Title>
          <Paragraph>
            您的文件正在使用PSI协议进行扫描，以保护您的隐私。
            只有关于恶意文件的信息才会被揭示。
            {isEnterpriseUser && '作为企业用户，您将收到更详细的扫描报告。'}
          </Paragraph>
        </div>
      ),
    },
    {
      title: '结果',
      icon: <SafetyCertificateOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <SafetyCertificateOutlined style={{ fontSize: '48px', color: 'var(--color-success)' }} />
          <Title level={3} style={{ marginTop: '20px' }}>扫描完成！</Title>
          <Paragraph>
            您的扫描已成功完成。正在跳转到结果页面...
          </Paragraph>
        </div>
      ),
    },
  ];

  // 如果页面正在初始化，显示加载状态
  if (initializing) {
    return (
      <ScanContainer>
        <LoadingContainer>
          <Spin size="large" tip="加载中..." />
        </LoadingContainer>
      </ScanContainer>
    );
  }

  return (
    <ScanContainer>
      {/* 未登录提醒 */}
      {!isLoggedIn && (
        <LoginAlert
          message="您尚未登录"
          description={
            <span>
              请先登录以使用文件扫描功能。登录后您可以查看扫描历史并获得完整的扫描服务。
            </span>
          }
          type="warning"
          showIcon
        />
      )}

      

      {/* 页面标题和企业版标识 */}
      <Title level={2}>
        扫描文件检测恶意软件
        {isEnterpriseUser && (
          <EnterpriseTag color="gold" count={<span style={{ color: '#fff' }}><BankOutlined /> 企业版</span>} />
        )}
      </Title>
      {/* 页面说明文本 */}
      <Paragraph>
        上传您的文件以扫描恶意内容。通过我们的PSI协议实现，您的隐私将受到保护。
        {isEnterpriseUser && ' 作为企业用户，您可以批量上传多个文件进行扫描。'}
        {!isLoggedIn && ' 请登录以获得完整的扫描服务和历史记录追踪。'}
      </Paragraph>

      {/* 步骤条 */}
      <StepsContainer>
        <Steps
          current={currentStep}
          items={steps.map(item => ({
            title: item.title,
            icon: item.icon,
          }))}
        />
      </StepsContainer>

      {/* 当前步骤内容 */}
      <ContentCard>
        {steps[currentStep].content}
      </ContentCard>

      {/* 登录模态框 */}
      <LoginModal 
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onLogin={handleLogin}
      />
    </ScanContainer>
  );
};

export default ScanPage; 