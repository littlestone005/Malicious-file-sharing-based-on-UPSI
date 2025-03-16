import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Typography, 
  Space, 
  Tooltip, 
  Empty,
  DatePicker,
  Input,
  Select,
  Popconfirm,
  message
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  HistoryOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  WarningOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

const HistoryCard = styled(Card)`
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  gap: 8px;
`;

const StatusTag = styled(Tag)`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
`;

const ScanHistory = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: null,
    status: 'all',
    searchText: '',
  });
  const [filteredData, setFilteredData] = useState([]);
  
  // 示例数据 - 实际应用中应该从API获取
  const historyData = [
    {
      key: '1',
      fileName: 'document.pdf',
      fileType: 'PDF文档',
      scanDate: '2023-11-15 14:30:22',
      status: 'clean',
      threatLevel: 'none',
      privacyProtected: true,
    },
    {
      key: '2',
      fileName: 'setup.exe',
      fileType: 'Windows可执行文件',
      scanDate: '2023-11-14 10:15:45',
      status: 'infected',
      threatLevel: 'high',
      privacyProtected: true,
    },
    {
      key: '3',
      fileName: 'script.js',
      fileType: 'JavaScript文件',
      scanDate: '2023-11-13 09:22:18',
      status: 'suspicious',
      threatLevel: 'medium',
      privacyProtected: true,
    },
    {
      key: '4',
      fileName: 'image.jpg',
      fileType: '图像文件',
      scanDate: '2023-11-12 16:45:30',
      status: 'clean',
      threatLevel: 'none',
      privacyProtected: true,
    },
    {
      key: '5',
      fileName: 'archive.zip',
      fileType: '压缩文件',
      scanDate: '2023-11-11 11:10:05',
      status: 'clean',
      threatLevel: 'none',
      privacyProtected: false,
    },
  ];
  
  // 应用筛选条件
  useEffect(() => {
    setLoading(true);
    
    // 筛选数据
    let result = [...historyData];
    
    // 应用日期范围筛选
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const startDate = filters.dateRange[0].startOf('day');
      const endDate = filters.dateRange[1].endOf('day');
      
      result = result.filter(item => {
        const scanDate = moment(item.scanDate, 'YYYY-MM-DD HH:mm:ss');
        return scanDate.isBetween(startDate, endDate, null, '[]');
      });
    }
    
    // 应用状态筛选
    if (filters.status !== 'all') {
      result = result.filter(item => item.status === filters.status);
    }
    
    // 应用搜索文本筛选
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(item => 
        item.fileName.toLowerCase().includes(searchLower) || 
        item.fileType.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredData(result);
    setLoading(false);
    
    // 如果筛选后没有数据，显示提示
    if (result.length === 0 && (filters.dateRange || filters.status !== 'all' || filters.searchText)) {
      message.info('没有符合筛选条件的记录');
    }
  }, [filters]);
  
  // 根据扫描状态确定颜色和图标
  const getStatusTag = (status) => {
    switch(status) {
      case 'clean':
        return (
          <StatusTag icon={<CheckCircleOutlined />} color="success">
            安全
          </StatusTag>
        );
      case 'infected':
        return (
          <StatusTag icon={<CloseCircleOutlined />} color="error">
            已检测到威胁
          </StatusTag>
        );
      case 'suspicious':
        return (
          <StatusTag icon={<WarningOutlined />} color="warning">
            可疑
          </StatusTag>
        );
      default:
        return (
          <StatusTag color="default">
            未知
          </StatusTag>
        );
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.fileName.localeCompare(b.fileName),
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType',
      filters: [
        { text: 'PDF文档', value: 'PDF文档' },
        { text: 'Windows可执行文件', value: 'Windows可执行文件' },
        { text: 'JavaScript文件', value: 'JavaScript文件' },
        { text: '图像文件', value: '图像文件' },
        { text: '压缩文件', value: '压缩文件' },
      ],
      onFilter: (value, record) => record.fileType.indexOf(value) === 0,
    },
    {
      title: '扫描时间',
      dataIndex: 'scanDate',
      key: 'scanDate',
      sorter: (a, b) => new Date(a.scanDate) - new Date(b.scanDate),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: '安全', value: 'clean' },
        { text: '已检测到威胁', value: 'infected' },
        { text: '可疑', value: 'suspicious' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '隐私保护',
      dataIndex: 'privacyProtected',
      key: 'privacyProtected',
      render: (isProtected) => (
        isProtected ? 
          <Tag color="blue" icon={<CheckCircleOutlined />}>已启用</Tag> : 
          <Tag color="default">未启用</Tag>
      ),
      filters: [
        { text: '已启用', value: true },
        { text: '未启用', value: false },
      ],
      onFilter: (value, record) => record.privacyProtected === value,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="删除记录">
            <Popconfirm
              title="确定要删除这条记录吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDeleteRecord(record.key)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // 处理表格选择变化
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  
  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  // 处理日期范围变化
  const handleDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      dateRange: dates,
    });
  };
  
  // 处理状态筛选变化
  const handleStatusChange = (value) => {
    setFilters({
      ...filters,
      status: value,
    });
  };
  
  // 处理搜索文本变化
  const handleSearch = (value) => {
    setFilters({
      ...filters,
      searchText: value,
    });
  };
  
  // 清除所有筛选
  const clearFilters = () => {
    setFilters({
      dateRange: null,
      status: 'all',
      searchText: '',
    });
    message.success('已清除所有筛选条件');
  };
  
  // 删除选中记录
  const deleteSelected = () => {
    // 实际应用中应该调用API删除记录
    console.log('删除记录:', selectedRowKeys);
    // 从筛选后的数据中移除选中的记录
    const newData = filteredData.filter(item => !selectedRowKeys.includes(item.key));
    setFilteredData(newData);
    setSelectedRowKeys([]);
    message.success(`已删除 ${selectedRowKeys.length} 条记录`);
  };
  
  // 删除单条记录
  const handleDeleteRecord = (key) => {
    // 实际应用中应该调用API删除记录
    console.log('删除记录:', key);
    // 从筛选后的数据中移除该记录
    const newData = filteredData.filter(item => item.key !== key);
    setFilteredData(newData);
    // 如果该记录在选中列表中，也从选中列表中移除
    if (selectedRowKeys.includes(key)) {
      setSelectedRowKeys(selectedRowKeys.filter(k => k !== key));
    }
    message.success('记录已删除');
  };
  
  // 查看详情
  const handleViewDetails = (record) => {
    // 实际应用中应该跳转到详情页或显示详情弹窗
    console.log('查看详情:', record);
    message.info(`查看文件 ${record.fileName} 的详细信息`);
  };
  
  // 导出选中记录
  const exportSelected = () => {
    // 实际应用中应该调用API导出记录
    console.log('导出记录:', selectedRowKeys);
    message.success(`已导出 ${selectedRowKeys.length} 条记录`);
  };
  
  return (
    <div>
      <HistoryCard>
        <Title level={4}><HistoryOutlined /> 扫描历史</Title>
        
        <FilterSection>
          <RangePicker 
            placeholder={['开始日期', '结束日期']}
            onChange={handleDateRangeChange}
            value={filters.dateRange}
          />
          
          <Select
            placeholder="状态筛选"
            style={{ width: 150 }}
            value={filters.status}
            onChange={handleStatusChange}
          >
            <Option value="all">全部状态</Option>
            <Option value="clean">安全</Option>
            <Option value="infected">已检测到威胁</Option>
            <Option value="suspicious">可疑</Option>
          </Select>
          
          <Search
            placeholder="搜索文件名"
            style={{ width: 250 }}
            value={filters.searchText}
            onSearch={handleSearch}
            onChange={(e) => setFilters({...filters, searchText: e.target.value})}
            allowClear
          />
          
          <Button 
            icon={<FilterOutlined />} 
            onClick={clearFilters}
          >
            清除筛选
          </Button>
        </FilterSection>
        
        <ActionButtons>
          <Popconfirm
            title="确定要删除选中的记录吗？"
            disabled={selectedRowKeys.length === 0}
            okText="确定"
            cancelText="取消"
            onConfirm={deleteSelected}
          >
            <Button 
              type="default" 
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              删除选中
            </Button>
          </Popconfirm>
          
          <Button 
            type="primary"
            icon={<ExportOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={exportSelected}
          >
            导出选中
          </Button>
        </ActionButtons>
        
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无扫描记录"
              />
            )
          }}
        />
      </HistoryCard>
    </div>
  );
};

export default ScanHistory; 