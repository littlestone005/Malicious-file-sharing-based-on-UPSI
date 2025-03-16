import { useState, useCallback } from 'react';
import { Upload, Button, Switch, Card, Typography, message, Spin } from 'antd';
import { InboxOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import CryptoJS from 'crypto-js';

const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;

const UploaderContainer = styled.div`
  margin: 20px 0;
`;

const PrivacyToggle = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  padding: 15px;
  background-color: rgba(26, 95, 180, 0.1);
  border-radius: 8px;
  border: 1px solid var(--color-primary);
`;

const PrivacyInfo = styled.div`
  margin-left: 15px;
`;

const FileUploader = ({ onFilesProcessed, isLoading, setIsLoading }) => {
  const [fileList, setFileList] = useState([]);
  const [usePSI, setUsePSI] = useState(true);

  // 计算文件的SHA-256哈希值
  const calculateFileHash = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const binary = e.target.result;
          const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(binary)).toString();
          resolve(hash);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // 处理文件上传
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('请至少选择一个文件进行扫描');
      return;
    }

    setIsLoading(true);
    
    try {
      // 处理每个文件以获取其哈希值
      const fileHashes = await Promise.all(
        fileList.map(async (file) => {
          const hash = await calculateFileHash(file.originFileObj);
          return {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            hash
          };
        })
      );
      
      // 模拟API调用延迟
      setTimeout(() => {
        onFilesProcessed({
          hashes: fileHashes,
          usePSI
        });
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('处理文件时出错:', error);
      message.error('文件处理失败。请重试。');
      setIsLoading(false);
    }
  };

  // 处理文件列表变化
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 自定义请求以防止实际上传
  const customRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  return (
    <UploaderContainer>
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
              ? '使用PSI协议，只有恶意文件的哈希值会被服务器获知。' 
              : '所有文件哈希将被发送到服务器进行检查（隐私性较低）。'}
          </Paragraph>
        </PrivacyInfo>
      </PrivacyToggle>

      <Dragger
        fileList={fileList}
        onChange={handleFileChange}
        customRequest={customRequest}
        multiple={true}
        showUploadList={true}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: 'var(--color-primary)', fontSize: '48px' }} />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域进行扫描</p>
        <p className="ant-upload-hint">
          支持单个或批量上传。文件将在本地进行哈希处理以保护隐私。
        </p>
      </Dragger>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button 
          type="primary" 
          onClick={handleUpload} 
          size="large"
          disabled={fileList.length === 0 || isLoading}
        >
          {isLoading ? <Spin size="small" /> : '扫描文件'}
        </Button>
      </div>
    </UploaderContainer>
  );
};

export default FileUploader; 