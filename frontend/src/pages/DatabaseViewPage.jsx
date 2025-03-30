/**
 * 数据库查看页面
 * 
 * 用于展示数据库内容，以便于项目展示和调试
 * 包含三个主要部分：用户表、扫描记录表和已知威胁表
 */

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Tabs, 
  Table, 
  Card, 
  Input, 
  Button, 
  Tag, 
  Spin,
  Alert,
  Divider,
  Space,
  Tooltip,
  message
} from 'antd';
import {
  DatabaseOutlined,
  UserOutlined,
  FileSearchOutlined,
  BugOutlined,
  SearchOutlined,
  SyncOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 样式组件
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`;

// 数据库查看页面组件
const DatabaseViewPage = () => {
  // 状态定义
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 表数据
  const [users, setUsers] = useState([]);
  const [scanRecords, setScanRecords] = useState([]);
  const [knownThreats, setKnownThreats] = useState([]);
  
  // 搜索关键词
  const [userSearchText, setUserSearchText] = useState('');
  const [scanSearchText, setScanSearchText] = useState('');
  const [threatSearchText, setThreatSearchText] = useState('');

  // 获取用户数据 - 修改为一次获取所有数据
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/database/users', {
        params: {
          limit: 100, // 获取更多数据，不分页
          search: userSearchText
        }
      });
      
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      console.error('获取用户数据失败:', err);
      setError('获取用户数据失败，请检查后端服务或网络连接');
      // 使用模拟数据进行演示
      const mockUsers = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        name: `测试用户 ${i + 1}`,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        password: `password${i + 1}` // 添加密码字段
      }));
      
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // 获取扫描记录数据 - 修改为一次获取所有数据
  const fetchScanRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/database/scan-records', {
        params: {
          limit: 100, // 获取更多数据，不分页
          search: scanSearchText
        }
      });
      
      setScanRecords(response.data.records);
      setError(null);
    } catch (err) {
      console.error('获取扫描记录失败:', err);
      setError('获取扫描记录失败，请检查后端服务或网络连接');
      // 使用模拟数据进行演示
      const mockRecords = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        user_id: (i % 5) + 1,
        user_name: `user${(i % 5) + 1}`,
        file_name: `file_${i + 1}.${['exe', 'pdf', 'js', 'dll', 'zip'][i % 5]}`,
        file_hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b${i.toString().padStart(3, '0')}`,
        file_size: Math.floor(Math.random() * 10000000),
        scan_date: new Date(Date.now() - i * 3600000).toISOString(),
        status: ['pending', 'processing', 'completed', 'failed'][i % 4],
        privacy_enabled: i % 3 !== 0,
        is_malicious: i % 4 === 0,
        result: JSON.stringify({
          is_malicious: i % 4 === 0,
          scan_method: i % 3 === 0 ? 'standard' : 'psi',
          threat_details: i % 4 === 0 ? {
            type: ['Trojan', 'Ransomware', 'Spyware'][i % 3],
            severity: ['low', 'medium', 'high'][i % 3],
            confidence: 70 + (i % 30)
          } : null
        })
      }));
      
      setScanRecords(mockRecords);
    } finally {
      setLoading(false);
    }
  };

  // 获取已知威胁数据 - 修改为一次获取所有数据
  const fetchKnownThreats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/database/known-threats', {
        params: {
          limit: 100, // 获取更多数据，不分页
          search: threatSearchText
        }
      });
      
      setKnownThreats(response.data.threats);
      setError(null);
    } catch (err) {
      console.error('获取已知威胁失败:', err);
      setError('获取已知威胁失败，请检查后端服务或网络连接');
      // 使用模拟数据进行演示
      const mockThreats = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        hash: `8a7b9c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b${i.toString().padStart(2, '0')}`,
        threat_type: ['Trojan', 'Ransomware', 'Spyware', 'Adware', 'Worm'][i % 5],
        severity: ['low', 'medium', 'high', 'critical'][i % 4],
        first_seen: new Date(Date.now() - i * 86400000 * 30).toISOString(),
        last_seen: new Date(Date.now() - i * 86400000).toISOString(),
        description: `这是一个${['危险的', '可疑的', '有害的'][i % 3]}${['Trojan', 'Ransomware', 'Spyware', 'Adware', 'Worm'][i % 5]}样本，影响Windows系统。`
      }));
      
      setKnownThreats(mockThreats);
    } finally {
      setLoading(false);
    }
  };

  // 当标签页切换时，加载对应的数据
  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers();
    } else if (activeTab === 'scanRecords' && scanRecords.length === 0) {
      fetchScanRecords();
    } else if (activeTab === 'knownThreats' && knownThreats.length === 0) {
      fetchKnownThreats();
    }
  }, [activeTab]);

  // 用户搜索处理
  const handleUserSearch = () => {
    fetchUsers();
  };

  // 扫描记录搜索处理
  const handleScanSearch = () => {
    fetchScanRecords();
  };

  // 威胁搜索处理
  const handleThreatSearch = () => {
    fetchKnownThreats();
  };

  // 刷新当前数据
  const refreshCurrentData = () => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'scanRecords') {
      fetchScanRecords();
    } else if (activeTab === 'knownThreats') {
      fetchKnownThreats();
    }
    message.success('数据已刷新');
  };

  // 用户表列定义 - 修改显示字段
  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend'
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || '-'
    },
    {
      title: '密码',
      dataIndex: 'password',
      key: 'password',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => text ? new Date(text).toLocaleString() : '-'
    }
  ];

  // 扫描记录表列定义 - 修改显示字段
  const scanColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend'
    },
    {
      title: '用户',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: '文件名',
      dataIndex: 'file_name',
      key: 'file_name',
    },
    {
      title: '扫描时间',
      dataIndex: 'scan_date',
      key: 'scan_date',
      render: (text) => {
        if (!text) return '-';
        try {
          // 处理日期格式，确保有效
          const date = new Date(text);
          if (isNaN(date.getTime())) return '格式错误';
          return date.toLocaleString();
        } catch (e) {
          return '解析错误';
        }
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'pending': { color: 'blue', text: '等待中' },
          'processing': { color: 'processing', text: '处理中' },
          'completed': { color: 'success', text: '已完成' },
          'failed': { color: 'error', text: '失败' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '结果',
      dataIndex: 'is_malicious',
      key: 'is_malicious',
      render: (isMalicious) => (
        <Tag color={isMalicious ? 'error' : 'success'}>
          {isMalicious ? '有威胁' : '安全'}
        </Tag>
      )
    },
    {
      title: '隐私保护',
      dataIndex: 'privacy_enabled',
      key: 'privacy_enabled',
      render: (enabled) => (
        <Tag color={enabled ? 'blue' : 'default'}>
          {enabled ? '已启用' : '未启用'}
        </Tag>
      )
    }
  ];

  // 已知威胁表列定义 - 修改显示字段
  const threatColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend'
    },
    {
      title: '哈希值',
      dataIndex: 'hash',
      key: 'hash',
      width: 220,
      ellipsis: true
    },
    {
      title: '威胁类型',
      dataIndex: 'threat_type',
      key: 'threat_type',
      render: (type) => <Tag color="volcano">{type}</Tag>
    },
    {
      title: '严重性',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const colorMap = {
          'low': 'green',
          'medium': 'gold',
          'high': 'orange',
          'critical': 'red'
        };
        return (
          <Tag color={colorMap[severity] || 'default'}>
            {severity === 'low' ? '低' : 
             severity === 'medium' ? '中' : 
             severity === 'high' ? '高' : 
             severity === 'critical' ? '严重' : severity}
          </Tag>
        );
      }
    },
    {
      title: '首次发现',
      dataIndex: 'first_seen',
      key: 'first_seen',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-'
    },
    {
      title: '最后发现',
      dataIndex: 'last_seen',
      key: 'last_seen',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    }
  ];

  return (
    <PageContainer>
      <StyledCard>
        <Title level={2}><DatabaseOutlined /> 数据库内容查看</Title>
        <Text type="secondary">
          此页面用于查看系统数据库中的数据，用于项目展示和调试。显示的数据包括用户信息、扫描记录和已知威胁。
        </Text>
        {error && (
          <Alert 
            type="warning" 
            message="数据加载提示" 
            description={`${error}，当前显示的是模拟数据。`}
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </StyledCard>

      <StyledCard>
        <TableHeader>
          <Title level={4} style={{ margin: 0 }}>
            {activeTab === 'users' ? <UserOutlined /> : 
             activeTab === 'scanRecords' ? <FileSearchOutlined /> : 
             <BugOutlined />} {' '}
            {activeTab === 'users' ? '用户数据' : 
             activeTab === 'scanRecords' ? '扫描记录' : 
             '已知威胁'}
          </Title>
          <Space>
            <Button 
              icon={<SyncOutlined />} 
              onClick={refreshCurrentData}
            >
              刷新
            </Button>
            <Tooltip title="这个页面仅用于展示，不提供编辑功能">
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        </TableHeader>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
        >
          <TabPane tab={<span><UserOutlined /> 用户</span>} key="users">
            <SearchContainer>
              <Input
                placeholder="搜索用户名或邮箱"
                value={userSearchText}
                onChange={(e) => setUserSearchText(e.target.value)}
                onPressEnter={handleUserSearch}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />
              <Button type="primary" onClick={handleUserSearch}>搜索</Button>
            </SearchContainer>
            <Divider style={{ margin: '12px 0' }} />
            {loading ? (
              <LoadingContainer>
                <Spin size="large" />
              </LoadingContainer>
            ) : (
              <Table
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                pagination={false} // 移除分页
                size="middle"
              />
            )}
          </TabPane>
          <TabPane tab={<span><FileSearchOutlined /> 扫描记录</span>} key="scanRecords">
            <SearchContainer>
              <Input
                placeholder="搜索文件名或用户名"
                value={scanSearchText}
                onChange={(e) => setScanSearchText(e.target.value)}
                onPressEnter={handleScanSearch}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />
              <Button type="primary" onClick={handleScanSearch}>搜索</Button>
            </SearchContainer>
            <Divider style={{ margin: '12px 0' }} />
            {loading ? (
              <LoadingContainer>
                <Spin size="large" />
              </LoadingContainer>
            ) : (
              <Table
                columns={scanColumns}
                dataSource={scanRecords}
                rowKey="id"
                pagination={false} // 移除分页
                size="middle"
                expandable={{
                  expandedRowRender: (record) => {
                    // 尝试解析JSON
                    let resultData = {};
                    try {
                      if (typeof record.result === 'string') {
                        resultData = JSON.parse(record.result);
                      } else if (typeof record.result === 'object') {
                        resultData = record.result;
                      }
                    } catch (e) {
                      console.error('解析JSON失败:', e);
                    }
                    
                    return (
                      <div>
                        <p><strong>扫描方法:</strong> {resultData.scan_method || '标准扫描'}</p>
                        {resultData.threat_details && (
                          <>
                            <p><strong>威胁类型:</strong> {resultData.threat_details.type || '未知'}</p>
                            <p><strong>严重性:</strong> {resultData.threat_details.severity || '低'}</p>
                            <p><strong>置信度:</strong> {resultData.threat_details.confidence || 0}%</p>
                          </>
                        )}
                        <p><strong>文件大小:</strong> {record.file_size ? `${(record.file_size / (1024 * 1024)).toFixed(2)} MB` : '未知'}</p>
                        <p><strong>文件哈希:</strong> <Text code>{record.file_hash || '未计算'}</Text></p>
                      </div>
                    );
                  }
                }}
              />
            )}
          </TabPane>
          <TabPane tab={<span><BugOutlined /> 已知威胁</span>} key="knownThreats">
            <SearchContainer>
              <Input
                placeholder="搜索威胁类型或哈希值"
                value={threatSearchText}
                onChange={(e) => setThreatSearchText(e.target.value)}
                onPressEnter={handleThreatSearch}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />
              <Button type="primary" onClick={handleThreatSearch}>搜索</Button>
            </SearchContainer>
            <Divider style={{ margin: '12px 0' }} />
            {loading ? (
              <LoadingContainer>
                <Spin size="large" />
              </LoadingContainer>
            ) : (
              <Table
                columns={threatColumns}
                dataSource={knownThreats}
                rowKey="id"
                pagination={false} // 移除分页
                size="middle"
              />
            )}
          </TabPane>
        </Tabs>
      </StyledCard>
    </PageContainer>
  );
};

export default DatabaseViewPage; 