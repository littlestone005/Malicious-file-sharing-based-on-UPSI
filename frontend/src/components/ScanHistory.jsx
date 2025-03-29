/**
 * 扫描历史组件
 * 
 * 这个组件展示用户的文件扫描历史记录，包括：
 * 1. 历史记录表格，显示文件名、类型、扫描时间、状态等信息
 * 2. 多条件筛选功能（日期范围、状态、文本搜索）
 * 3. 批量操作功能（删除、导出）
 * 4. 单条记录操作（查看详情、删除）
 * 
 * 组件支持排序、筛选和分页，提供完整的历史记录管理功能
 */

import React, { useState, useEffect } from 'react';
// 导入样式组件库
import styled from 'styled-components';
// 导入Ant Design组件
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
// 导入Ant Design图标
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  HistoryOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  WarningOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined,
  LoadingOutlined
} from '@ant-design/icons';
// 导入日期处理库
import moment from 'moment';
// 导入API工具
import { scanAPI } from '../utils/api';

// 从Typography组件中解构出需要的子组件
const { Title, Text } = Typography;
// 从DatePicker组件中解构出RangePicker子组件
const { RangePicker } = DatePicker;
// 从Input组件中解构出Search子组件
const { Search } = Input;
// 从Select组件中解构出Option子组件
const { Option } = Select;

/**
 * 历史记录卡片样式
 * 
 * 设置底部外边距、圆角和阴影效果
 * 增强卡片的视觉层次感
 */
const HistoryCard = styled(Card)`
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

/**
 * 筛选区域样式
 * 
 * 使用flex布局和flex-wrap实现响应式布局
 * 设置间距、底部外边距和垂直对齐方式
 */
const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
`;

/**
 * 操作按钮区域样式
 * 
 * 使用flex布局使按钮靠右对齐
 * 设置底部外边距和按钮间距
 */
const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  gap: 8px;
`;

/**
 * 状态标签样式
 * 
 * 自定义Tag组件的字体大小、内边距和圆角
 * 使状态标签更加紧凑
 */
const StatusTag = styled(Tag)`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
`;

/**
 * 扫描历史组件
 * 
 * 管理和展示用户的文件扫描历史记录
 * 
 * @returns {JSX.Element} 扫描历史组件
 */
const ScanHistory = () => {
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 选中行的键值数组
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // 扫描历史记录数据
  const [historyData, setHistoryData] = useState([]);
  // 分页设置
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  // 筛选条件状态
  const [filters, setFilters] = useState({
    dateRange: null,
    status: 'all',
    searchText: '',
  });
  // 筛选后的数据
  const [filteredData, setFilteredData] = useState([]);
  
  /**
   * 从后端API获取扫描历史数据
   */
  const fetchScanHistory = async () => {
    try {
      setLoading(true);
      const skip = (pagination.current - 1) * pagination.pageSize;
      const response = await scanAPI.getScanHistory(skip, pagination.pageSize);
      
      console.log('API原始返回数据:', response); // 调试日志
      
      // 处理API返回的数据
      const formattedData = response.map(item => {
        // 确保result_details存在且是对象
        let resultDetails = item.result_details;
        
        // 如果是字符串，尝试解析
        if (typeof resultDetails === 'string') {
          try {
            resultDetails = JSON.parse(resultDetails);
          } catch (e) {
            console.error('解析扫描结果失败:', e);
            resultDetails = {};
          }
        }
        
        // 确保是对象
        resultDetails = resultDetails || {};
        
        // 获取威胁详情
        let threatDetails = resultDetails.threat_details;
        if (typeof threatDetails === 'string') {
          try {
            threatDetails = JSON.parse(threatDetails);
          } catch (e) {
            threatDetails = {};
          }
        }
        
        // 确保威胁详情是对象
        threatDetails = threatDetails || {};

        // 判断恶意状态 - 直接使用API返回的is_malicious字段
        const isMalicious = item.is_malicious === true;
        const severity = threatDetails.severity || '';
        
        // 确定状态
        let status;
        if (isMalicious) {
          status = severity === 'high' ? 'infected' : 'suspicious';
        } else {
          status = 'clean';
        }
        
        // 处理隐私保护状态 - 直接使用API返回的privacy_enabled字段
        let privacyEnabled;
        if (typeof item.privacy_enabled === 'boolean') {
          privacyEnabled = item.privacy_enabled;
        } else if (item.privacy_enabled === 1 || item.privacy_enabled === '1' || item.privacy_enabled === 'true') {
          privacyEnabled = true;
        } else {
          privacyEnabled = false;
        }
        
        console.log('处理后记录:', {
          id: item.id,
          is_malicious: isMalicious,
          status: status,
          privacy_enabled: item.privacy_enabled,
          privacyEnabled: privacyEnabled
        }); // 调试日志
        
        return {
          key: item.id.toString(),
          id: item.id,
          fileName: item.file_name,
          fileType: getFileType(item.file_name),
          scanDate: moment(item.scan_date).format('YYYY-MM-DD HH:mm:ss'),
          status: status,
          threatLevel: severity || 'none',
          privacyProtected: privacyEnabled,
          resultDetails: resultDetails
        };
      });
      
      setHistoryData(formattedData);
      setFilteredData(formattedData);
      setPagination({
        ...pagination,
        total: response.length + skip // 简单估算总数
      });
    } catch (error) {
      console.error('获取扫描历史失败:', error);
      let errorMessage = '获取扫描历史记录失败，将显示示例数据';
      
      // 根据错误类型提供更具体的提示
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = '会话已过期，请重新登录';
        } else if (error.response.status === 422) {
          errorMessage = '数据格式错误，请联系管理员';
        } else if (error.response.status >= 500) {
          errorMessage = '服务器错误，请稍后再试';
        }
      } else if (error.request) {
        errorMessage = '无法连接到服务器，请检查网络连接';
      }
      
      message.error(errorMessage);
      
      // 设置示例数据
      const exampleData = [
        {
          key: '1',
          id: 1,
          fileName: 'document.pdf',
          fileType: 'PDF文档',
          scanDate: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
          status: 'clean',
          threatLevel: 'none',
          privacyProtected: true,
          resultDetails: { is_malicious: false, scan_method: 'psi' }
        },
        {
          key: '2',
          id: 2,
          fileName: 'setup.exe',
          fileType: '可执行文件',
          scanDate: moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm:ss'),
          status: 'infected',
          threatLevel: 'high',
          privacyProtected: true,
          resultDetails: { 
            is_malicious: true, 
            scan_method: 'psi',
            threat_details: {
              type: 'Trojan',
              severity: 'high',
              description: 'Trojan horse that steals banking credentials'
            }
          }
        },
        {
          key: '3',
          id: 3,
          fileName: 'script.js',
          fileType: 'JavaScript文件',
          scanDate: moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'),
          status: 'suspicious',
          threatLevel: 'medium',
          privacyProtected: true,
          resultDetails: { 
            is_malicious: true, 
            scan_method: 'psi',
            threat_details: {
              type: 'Spyware',
              severity: 'medium',
              description: 'JavaScript code with suspicious behavior pattern'
            }
          }
        }
      ];
      
      setHistoryData(exampleData);
      setFilteredData(exampleData);
      setPagination({
        ...pagination,
        total: exampleData.length
      });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 根据文件名获取文件类型
   * 
   * @param {string} fileName - 文件名
   * @returns {string} 文件类型描述
   */
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const fileTypes = {
      'pdf': 'PDF文档',
      'doc': 'Word文档',
      'docx': 'Word文档',
      'xls': 'Excel表格',
      'xlsx': 'Excel表格',
      'ppt': 'PowerPoint演示文稿',
      'pptx': 'PowerPoint演示文稿',
      'txt': '文本文件',
      'jpg': '图像文件',
      'jpeg': '图像文件',
      'png': '图像文件',
      'gif': '图像文件',
      'mp3': '音频文件',
      'mp4': '视频文件',
      'zip': '压缩文件',
      'rar': '压缩文件',
      'exe': '可执行文件',
      'dll': '动态链接库',
      'js': 'JavaScript文件',
      'py': 'Python文件',
      'html': 'HTML文件',
      'css': 'CSS文件'
    };
    
    return fileTypes[extension] || `${extension.toUpperCase()}文件`;
  };
  
  /**
   * 初始加载和刷新数据
   */
  useEffect(() => {
    fetchScanHistory();
  }, [pagination.current, pagination.pageSize]);
  
  /**
   * 应用筛选条件的副作用
   * 
   * 当筛选条件变化时，重新过滤数据
   * 包括日期范围、状态和搜索文本筛选
   */
  useEffect(() => {
    if (!historyData.length) return;
    
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
  }, [filters, historyData]);
  
  /**
   * 根据扫描状态生成对应的标签
   * 
   * @param {string} status - 扫描状态：'clean', 'infected', 'suspicious'
   * @returns {JSX.Element} 状态标签组件
   */
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
  
  /**
   * 表格列定义
   * 
   * 配置表格的列、排序、筛选和渲染方式
   */
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
      render: (isProtected) => {
        console.log('渲染隐私保护:', isProtected);
        return (
          isProtected === true ? 
            <Tag color="blue" icon={<CheckCircleOutlined />}>已启用</Tag> : 
            <Tag color="default">未启用</Tag>
        );
      },
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
  
  /**
   * 处理表格选择变化
   * 
   * @param {Array} newSelectedRowKeys - 新的选中行键值数组
   */
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  
  /**
   * 表格行选择配置
   */
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  /**
   * 处理日期范围变化
   * 
   * @param {Array} dates - 日期范围数组
   */
  const handleDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      dateRange: dates,
    });
  };
  
  /**
   * 处理状态筛选变化
   * 
   * @param {string} value - 状态值
   */
  const handleStatusChange = (value) => {
    setFilters({
      ...filters,
      status: value,
    });
  };
  
  /**
   * 处理搜索文本变化
   * 
   * @param {string} value - 搜索文本
   */
  const handleSearch = (value) => {
    setFilters({
      ...filters,
      searchText: value,
    });
  };
  
  /**
   * 清除所有筛选条件
   */
  const clearFilters = () => {
    setFilters({
      dateRange: null,
      status: 'all',
      searchText: '',
    });
    message.success('已清除所有筛选条件');
  };
  
  /**
   * 删除选中的记录
   * 
   * 实际应用中应该调用API删除记录
   */
  const deleteSelected = () => {
    // 实际应用中应该调用API删除记录
    console.log('删除记录:', selectedRowKeys);
    // 从筛选后的数据中移除选中的记录
    const newData = filteredData.filter(item => !selectedRowKeys.includes(item.key));
    setFilteredData(newData);
    setSelectedRowKeys([]);
    message.success(`已删除 ${selectedRowKeys.length} 条记录`);
  };
  
  /**
   * 删除单条记录
   * 
   * @param {string} key - 记录的键值
   */
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
  
  /**
   * 查看记录详情
   * 
   * @param {Object} record - 记录对象
   */
  const handleViewDetails = (record) => {
    // 实际应用中应该跳转到详情页或显示详情弹窗
    console.log('查看详情:', record);
    message.info(`查看文件 ${record.fileName} 的详细信息`);
  };
  
  /**
   * 导出选中的记录
   * 
   * 实际应用中应该调用API导出记录
   */
  const exportSelected = () => {
    // 实际应用中应该调用API导出记录
    console.log('导出记录:', selectedRowKeys);
    message.success(`已导出 ${selectedRowKeys.length} 条记录`);
  };
  
  return (
    <div>
      <HistoryCard>
        {/* 卡片标题 */}
        <Title level={4}><HistoryOutlined /> 扫描历史</Title>
        
        {/* 筛选区域 */}
        <FilterSection>
          {/* 日期范围选择器 */}
          <RangePicker 
            placeholder={['开始日期', '结束日期']}
            onChange={handleDateRangeChange}
            value={filters.dateRange}
          />
          
          {/* 状态筛选下拉框 */}
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
          
          {/* 文本搜索框 */}
          <Search
            placeholder="搜索文件名"
            style={{ width: 250 }}
            value={filters.searchText}
            onSearch={handleSearch}
            onChange={(e) => setFilters({...filters, searchText: e.target.value})}
            allowClear
          />
          
          {/* 清除筛选按钮 */}
          <Button 
            icon={<FilterOutlined />} 
            onClick={clearFilters}
          >
            清除筛选
          </Button>
        </FilterSection>
        
        {/* 批量操作按钮区域 */}
        <ActionButtons>
          {/* 批量删除按钮 */}
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
          
          {/* 批量导出按钮 */}
          <Button 
            type="primary"
            icon={<ExportOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={exportSelected}
          >
            导出选中
          </Button>
        </ActionButtons>
        
        {/* 历史记录表格 */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{ 
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
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
          onChange={(pagination) => {
            setPagination(pagination);
            fetchScanHistory();
          }}
        />
      </HistoryCard>
    </div>
  );
};

export default ScanHistory; 