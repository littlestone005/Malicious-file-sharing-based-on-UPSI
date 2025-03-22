import { useState } from 'react';
import axios from 'axios';
import { Spin } from 'antd';

export default function TestConnection() {
  const [status, setStatus] = useState('未检测');
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/v1/test');
      setStatus(`连接成功 (状态码: ${response.status})`);
      setResponseData(response.data);
    } catch (error) {
      setStatus('连接失败');
      setResponseData({
        error: error.message,
        details: error.response?.data || '无额外错误信息'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button 
        onClick={testBackendConnection}
        className="bg-white-500 hover:bg-white-700 text-white font-bold py-2 px-4 rounded mb-4"
        disabled={loading}
      >
        {loading ? '测试中...' : '测试后端连接'}
      </button>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">连接状态:</h2>
          {loading ? (
            <Spin tip="正在检测中..." size="small" className="text-white bg-gradient-to-r from-white to-gray-200 bg-opacity-50" />
          ) : (
            <p className={status.includes('成功') ? 'text-green-600' : 'text-red-600'}>
              {status}
            </p>
          )}
        </div>
        
        {responseData && (
          <div>
            <h2 className="font-semibold">响应数据:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}