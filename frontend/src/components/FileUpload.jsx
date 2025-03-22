import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/api/v1/detection/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data);
    } catch (error) {
      console.error('文件上传失败:', error);
      setResult({ error: '文件检测失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={loading}
        />
        <button type="submit" disabled={!file || loading}>
          {loading ? '检测中...' : '开始检测'}
        </button>
      </form>

      {result && (
        <div className="result-box">
          <h3>检测结果：{result.is_malicious ? '⚠️ 发现恶意文件' : '✅ 文件安全'}</h3>
          <p>文件名：{result.filename}</p>
          <p>文件哈希：{result.hash}</p>
          {result.proof && <p>零知识证明：{result.proof.slice(0, 50)}...</p>}
        </div>
      )}
    </div>
  );
};

export default FileUpload;