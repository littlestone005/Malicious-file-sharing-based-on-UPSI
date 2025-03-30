/**
 * 文件上传组件
 * 
 * 这个组件实现了文件上传和处理功能，包括：
 * 1. 拖拽上传区域
 * 2. 隐私模式切换（PSI协议）
 * 3. 企业用户的批量上传功能
 * 4. 文件哈希计算
 * 5. 文件列表显示
 */

// 导入React钩子和上下文
import { useState, useCallback, useContext } from 'react';
// 导入Ant Design组件
import { Upload, Button, Switch, Card, Typography, message, Spin, Alert, Tabs, Tooltip } from 'antd';
// 导入Ant Design图标
import { 
  InboxOutlined, 
  LockOutlined, 
  UnlockOutlined, 
  BankOutlined, 
  FileOutlined, 
  LoginOutlined, 
  CopyOutlined,
  DeleteOutlined,
  CloseOutlined
} from '@ant-design/icons';
// 导入样式组件库
import styled from 'styled-components';
// 导入加密库，用于计算文件哈希
import CryptoJS from 'crypto-js';
// 导入用户上下文
import { UserContext } from '../App';
import LoginModal from '../components/LoginModal';

// 从Upload组件中解构出Dragger子组件，用于拖拽上传
const { Dragger } = Upload;
// 从Typography组件中解构出需要的子组件
const { Title, Text, Paragraph } = Typography;
// 从Tabs组件中解构出TabPane子组件
const { TabPane } = Tabs;

/**
 * 上传器容器样式
 */
const UploaderContainer = styled.div`
  margin: 20px 0;
`;

/**
 * 隐私模式切换区域样式
 */
const PrivacyToggle = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  padding: 15px;
  background-color: rgba(26, 95, 180, 0.1);
  border-radius: 8px;
  border: 1px solid var(--color-primary);
`;

/**
 * 隐私信息区域样式
 */
const PrivacyInfo = styled.div`
  margin-left: 15px;
`;

/**
 * 企业用户提示样式
 */
const EnterpriseAlert = styled(Alert)`
  margin-bottom: 20px;
`;

/**
 * 文件列表容器样式
 */
const FileList = styled.div`
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
`;

/**
 * 文件项样式
 */
const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

/**
 * 文件图标样式
 */
const FileIcon = styled(FileOutlined)`
  margin-right: 8px;
  font-size: 16px;
`;

/**
 * 哈希值容器样式
 */
const HashContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 4px;
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
`;

/**
 * 登录提示容器样式
 */
const LoginPromptContainer = styled.div`
  text-align: center;
  padding: 30px 0;
`;

/**
 * 文件上传组件
 * 
 * @param {Object} props - 组件属性
 * @param {Function} props.onFilesProcessed - 文件处理完成后的回调函数
 * @param {boolean} props.isLoading - 加载状态
 * @param {Function} props.setIsLoading - 设置加载状态的函数
 * @param {boolean} props.isDisabled - 是否禁用上传功能（未登录时）
 * @param {Function} props.onLoginClick - 登录按钮点击回调函数
 */
const FileUploader = ({ 
  onFilesProcessed, 
  isLoading, 
  setIsLoading, 
  isDisabled = false, 
  onLoginClick 
}) => {
  // 从用户上下文中获取用户信息
  const { user } = useContext(UserContext);
  // 文件列表状态
  const [fileList, setFileList] = useState([]);
  // 隐私模式状态，默认启用
  const [usePSI, setUsePSI] = useState(true);
  // 当前活动的标签页，默认为单文件上传
  const [activeTab, setActiveTab] = useState('single');
  
  // 判断当前用户是否为企业用户
  const isEnterpriseUser = user?.userType === 'enterprise';

  /**
   * 复制内容到剪贴板
   */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('已复制到剪贴板');
      },
      () => {
        message.error('复制失败，请手动复制');
      }
    );
  };

  /**
   * 计算文件的SHA-256哈希值
   * 
   * @param {File} file - 要计算哈希的文件对象
   * @returns {Promise<string>} 返回文件的SHA-256哈希值
   */
  const calculateFileHash = (file) => {
    return new Promise((resolve, reject) => {
      // 创建FileReader实例
      const reader = new FileReader();
      
      // 文件加载完成后的回调
      reader.onload = (e) => {
        try {
          // 获取文件二进制内容
          const binary = e.target.result;
          // 使用CryptoJS计算SHA-256哈希值
          // 注意：CryptoJS.WordArray.create会创建一个WordArray对象，用于处理二进制数据
          // CryptoJS.SHA256函数会使用SHA-256算法计算哈希值，然后toString输出十六进制字符串
          const wordArray = CryptoJS.lib.WordArray.create(binary);
          const hash = CryptoJS.SHA256(wordArray).toString();
          
          console.log('计算文件哈希值:', file.name, hash);
          
          // 更新文件列表中的哈希值
          setFileList(prevList => 
            prevList.map(item => 
              item.originFileObj === file || (item.uid === file.uid) ? { ...item, hash } : item
            )
          );
          
          resolve(hash);
        } catch (error) {
          console.error('计算文件哈希失败:', error);
          reject(error);
        }
      };
      
      // 文件读取错误的回调
      reader.onerror = (error) => {
        console.error('文件读取失败:', error);
        reject(error);
      };
      
      // 以ArrayBuffer格式读取文件
      // 使用ArrayBuffer可以处理大型二进制文件，并提供更好的性能
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * 处理文件上传
   */
  const handleUpload = async () => {
    // 如果未登录，提示用户登录
    if (isDisabled) {
      message.warning('请先登录以使用文件扫描功能');
      if (onLoginClick) {
        onLoginClick();
      }
      return;
    }

    // 检查是否有选择文件
    if (fileList.length === 0) {
      message.error('请至少选择一个文件进行扫描');
      return;
    }

    // 设置加载状态
    setIsLoading(true);
    
    try {
      // 先为每个文件计算并显示哈希值
      fileList.forEach(file => {
        if (!file.hash) {
          calculateFileHash(file.originFileObj);
        }
      });
      
      // 处理每个文件以获取其哈希值
      const fileHashes = await Promise.all(
        fileList.map(async (file) => {
          // 计算文件哈希值
          const hash = file.hash || await calculateFileHash(file.originFileObj);
          // 返回文件信息和哈希值
          return {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            hash
          };
        })
      );
      
      // 调用回调函数，传递处理结果
      onFilesProcessed({
        hashes: fileHashes,
        usePSI,
        isEnterpriseUpload: isEnterpriseUser
      });
      
    } catch (error) {
      // 处理错误
      console.error('处理文件时出错:', error);
      message.error('文件处理失败。请重试。');
      setIsLoading(false);
    }
  };

  /**
   * 处理文件列表变化
   * 
   * @param {Object} info - 文件变化信息
   */
  const handleFileChange = ({ fileList: newFileList }) => {
    if (isDisabled) {
      message.warning('请先登录以使用文件扫描功能');
      return;
    }
    
    setFileList(newFileList);
    
    // 立即计算新添加文件的哈希值
    const addedFiles = newFileList.filter(file => 
      !fileList.some(existingFile => existingFile.uid === file.uid) && 
      file.status === 'done' && 
      file.originFileObj && 
      !file.hash
    );
    
    for (const file of addedFiles) {
      calculateFileHash(file.originFileObj);
    }
  };

  /**
   * 自定义请求处理
   * 
   * @param {Object} options - 请求选项
   */
  const customRequest = ({ file, onSuccess }) => {
    // 立即调用成功回调，模拟上传成功
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  /**
   * 处理批量文件上传
   * 
   * @param {Event} e - 文件输入事件
   */
  const handleBatchUpload = (e) => {
    // 如果未登录，提示用户登录
    if (isDisabled) {
      message.warning('请先登录以使用文件扫描功能');
      return;
    }

    // 获取选择的文件数组
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // 将文件转换为fileList格式
    const newFileList = files.map((file, index) => ({
      uid: `-${index}`,
      name: file.name,
      status: 'done',
      originFileObj: file,
    }));
    
    // 更新文件列表，保留之前的文件
    setFileList([...fileList, ...newFileList]);
  };

  // 如果组件被禁用（用户未登录），显示登录提示
  if (isDisabled) {
    return (
      <UploaderContainer>
        <LoginPromptContainer>
          <LockOutlined style={{ fontSize: '48px', color: 'var(--color-warning)', marginBottom: '20px' }} />
          <Title level={4}>请登录以使用文件扫描功能</Title>
          <Paragraph>
            登录后您可以上传文件进行恶意软件检测，并查看您的扫描历史记录。
          </Paragraph>
          <Button 
            type="primary" 
            icon={<LoginOutlined />} 
            size="large"
            onClick={onLoginClick} // 使用传入的登录按钮回调
          >
            立即登录
          </Button>
        </LoginPromptContainer> 
      </UploaderContainer>
    );
  }

  return (
    <UploaderContainer>      
      {/* 隐私模式切换 */}
      <PrivacyToggle>
        <Switch 
          checked={usePSI} 
          onChange={setUsePSI}
          checkedChildren={<LockOutlined />}
          unCheckedChildren={<UnlockOutlined />}
        />
        <PrivacyInfo>
          <Text strong>隐私模式: {usePSI ? '已启用' : '已禁用'}</Text>
          <Paragraph type="secondary">
            {usePSI 
              ? '使用PSI协议进行隐私保护检测，只有恶意文件信息会被识别。' 
              : '所有文件哈希将被发送到服务器进行检查。'}
          </Paragraph>
        </PrivacyInfo>
      </PrivacyToggle>

      <Dragger
        fileList={fileList}
        onChange={handleFileChange}
        customRequest={customRequest}
        multiple={true}
        showUploadList={{
          showRemoveIcon: true,
          removeIcon: <Button type="text" size="small" icon={<CloseOutlined />} />,
        }}
        disabled={isDisabled}
        itemRender={(originNode, file, fileList, actions) => {
          return (
            <Card size="small" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FileIcon />
                    <Text strong>{file.name}</Text>
                  </div>
                  {file.hash && (
                    <HashContainer>
                      <Text type="secondary" style={{ marginRight: 8 }}>SHA-256:</Text>
                      <Text code ellipsis style={{ maxWidth: '200px' }}>{file.hash}</Text>
                      <Tooltip title="复制哈希值">
                        <Button 
                          type="text" 
                          icon={<CopyOutlined />} 
                          size="small" 
                          onClick={() => copyToClipboard(file.hash)}
                          style={{ marginLeft: 8 }}
                        />
                      </Tooltip>
                    </HashContainer>
                  )}
                </div>
                <Button 
                  type="text" 
                  icon={<DeleteOutlined />} 
                  onClick={() => actions.remove()}
                />
              </div>
            </Card>
          );
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: 'var(--color-primary)', fontSize: '48px' }} />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域进行扫描</p>
        <p className="ant-upload-hint">
          支持单个或批量上传。文件将在本地进行哈希处理以保护隐私。
        </p>
      </Dragger>

      {/* 扫描按钮 */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button 
          type="primary" 
          onClick={handleUpload} 
          size="large"
          disabled={fileList.length === 0 || isLoading || isDisabled}
        >
          {isLoading ? <Spin size="small" /> : '扫描文件'}
        </Button>
      </div>
    </UploaderContainer>
  );
};

export default FileUploader;