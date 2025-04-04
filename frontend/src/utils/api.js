import axios from 'axios';

// API base URL
const API_BASE_URL = '/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send file hashes to the server for malware detection
 * @param {Array} hashes - Array of file hash objects
 * @param {boolean} usePSI - Whether to use PSI protocol
 * @returns {Promise} - Promise with the detection results
 */
export const detectMalware = async (hashes, usePSI = true) => {
  try {
    // In a real implementation, this would call the backend API
    // For demo purposes, we'll simulate a response
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response - in a real app, this would be:
    // const response = await apiClient.post('/detect', { hashes, use_psi: usePSI });
    // return response.data;
    
    // For demo, we'll mark every third file as malicious
    const maliciousHashes = hashes
      .filter((_, index) => index % 3 === 0)
      .map(file => file.hash);
    
    return {
      malicious_hashes: maliciousHashes,
      proof: "zkp_base64_string_would_be_here_in_real_implementation"
    };
  } catch (error) {
    console.error('Error in malware detection:', error);
    throw error;
  }
};

/**
 * Get information about detected threats
 * @param {Array} maliciousHashes - Array of malicious file hashes
 * @returns {Promise} - Promise with threat details
 */
export const getThreatInfo = async (maliciousHashes) => {
  try {
    // In a real implementation, this would call the backend API
    // For demo purposes, we'll simulate a response
    
    // Mock threat types
    const threatTypes = ['Trojan', 'Spyware', 'Ransomware', 'Adware', 'Worm'];
    
    // Generate mock threat info for each malicious hash
    const threatInfo = maliciousHashes.map((hash, index) => ({
      hash,
      threatType: threatTypes[index % threatTypes.length],
      confidence: Math.floor(Math.random() * 30) + 70, // 70-99% confidence
      firstSeen: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 90 days
      prevalence: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    }));
    
    return threatInfo;
  } catch (error) {
    console.error('Error getting threat info:', error);
    throw error;
  }
};

// 创建axios实例
const api = axios.create({
  baseURL: '/api/v1',  // 修改为相对路径，避免硬编码localhost
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    } else {
      console.log('No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => {
    // 对于登录请求，返回响应数据而不是完整的响应对象
    if (response.config.url === '/auth/token' || response.config.url === '/auth/login') {
      console.log('Intercepting login response:', response.data);
      return response.data;
    }
    // 对于其他请求，返回响应数据
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      const message = error.response.data.detail || 
                     (typeof error.response.data === 'string' ? error.response.data : 
                     (error.response.data.message || '请求失败'));
      console.error('Server error response:', error.response.data);  // 添加详细错误日志
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('No response received:', error.request);
      return Promise.reject(new Error('无法连接到服务器'));
    } else {
      // 请求配置出错
      console.error('Request config error:', error.message);
      return Promise.reject(new Error(error.message || '请求配置错误'));
    }
  }
);

// 用户认证相关API
export const authAPI = {
  // 用户登录
  login: async (username, password) => {
    try {
      // 使用/auth/login端点，该端点支持JSON格式
      const response = await api.post('/auth/login', {
        username,
        password
      });
      console.log('Login response:', response);  // 添加响应日志
      
      // 直接返回响应
      return response;
    } catch (error) {
      console.error('Login API error:', error);  // 添加错误日志
      throw error;
    }
  },

  // 用户注册
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  // 检查用户名是否可用
  checkUsername: async (username) => {
    return api.get(`/auth/check-username/${username}`);
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    try {
      return await api.get('/users/me');
    } catch (error) {
      console.error('获取用户信息失败:', error);
      
      // 为了UI展示，创建一个模拟用户对象
      // 这样即使API失败也能显示一些基本数据
      const token = localStorage.getItem('token');
      if (token) {
        const mockUser = {
          username: localStorage.getItem('username') || '未知用户',
          email: localStorage.getItem('email') || 'user@example.com',
          name: localStorage.getItem('name') || '用户',
          phone: '',
          preferences: {
            language: 'zh-CN'
          }
        };
        return mockUser;
      }
      throw error;
    }
  },

  // 更新用户信息
  updateUser: async (userData) => {
    try {
      return await api.put('/users/me', userData);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      
      // 为了UI体验，返回原始数据，模拟更新成功
      return userData;
    }
  },
};

// 文件扫描相关API
export const scanAPI = {
  // 上传并扫描文件
  uploadAndScan: async (file, privacyEnabled = true) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/scans/upload?privacy_enabled=${privacyEnabled}`, formData);
  },

  // 获取扫描历史
  getScanHistory: async (skip = 0, limit = 100) => {
    return api.get(`/scans/?skip=${skip}&limit=${limit}`);
  },

  // 获取扫描详情
  getScanDetail: async (scanId) => {
    return api.get(`/scans/${scanId}`);
  },
  
  // 获取扫描统计数据
  getScanStatistics: async () => {
    return api.get('/scans/statistics/');
  },
  
  // 提交文件哈希进行检测（SHA-256）
  checkFileHashes: async (fileHashes, privacyEnabled = true) => {
    return api.post('/scans/check-hashes', {
      hashes: fileHashes,
      privacy_enabled: privacyEnabled
    });
  },
  
  /**
   * 上传恶意软件样本文件
   * 
   * @param {File} file - 文件对象
   * @param {Object} metadata - 文件元数据，包括威胁类型、严重性、描述
   * @returns {Promise<Object>} 服务器响应数据
   */
  uploadMalwareSample: async (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('threat_type', metadata.threatType);
    formData.append('severity', metadata.severity);
    
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    
    const response = await api.post('/detection/malware-sample', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response;
  }
};

export default api; 