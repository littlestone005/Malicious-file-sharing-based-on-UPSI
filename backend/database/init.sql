-- Create tables for the malware detection system

-- Malware signatures table
CREATE TABLE IF NOT EXISTS malware_signatures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hash VARCHAR(64) NOT NULL UNIQUE,
    threat_type VARCHAR(50) NOT NULL,
    threat_name VARCHAR(100),
    confidence INT NOT NULL,
    first_seen DATETIME NOT NULL,
    prevalence ENUM('Low', 'Medium', 'High') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (hash)
);

-- Scan logs table
CREATE TABLE IF NOT EXISTS scan_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,                     -- 唯一标识符，自增
    client_id VARCHAR(100),                                -- 客户端标识符，用于标识发起扫描的客户端
    scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- 扫描时间，记录扫描开始的时间
    total_files INT NOT NULL,                              -- 扫描的文件总数，表示此次扫描中处理的文件数量
    malicious_files INT NOT NULL,                          -- 检测到的恶意文件数量，表示此次扫描中发现的恶意文件数量
    privacy_mode BOOLEAN NOT NULL DEFAULT TRUE,           -- 是否启用隐私模式，指示用户在扫描时是否选择了隐私保护
    ip_address VARCHAR(45),                               -- 客户端的IP地址，记录发起扫描请求的用户的IP地址
    user_agent VARCHAR(255)                               -- 客户端的用户代理信息，记录发起请求的浏览器或应用程序的信息
);--VARCHAR(n) 是一种数据类型，用于存储可变长度的字符串。n 表示字符串的最大长度

-- Insert some sample malware signatures
INSERT INTO malware_signatures (hash, threat_type, threat_name, confidence, first_seen, prevalence) VALUES
('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Trojan', 'Emotet', 95, '2023-01-15 00:00:00', 'High'),
('a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a', 'Ransomware', 'WannaCry', 98, '2023-02-20 00:00:00', 'High'),
('3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278', 'Spyware', 'Pegasus', 90, '2023-03-10 00:00:00', 'Medium'),
('8c3d4a0f94b252c7859a96fd69a5711b5a4e599afc857c8b4f414b3fb6a095b9', 'Adware', 'BrowserAssistant', 75, '2023-04-05 00:00:00', 'Low'),
('2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3', 'Worm', 'Conficker', 85, '2023-05-12 00:00:00', 'Medium'),
('19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7', 'Trojan', 'Zeus', 92, '2023-06-18 00:00:00', 'High'),
('4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5', 'Ransomware', 'Locky', 88, '2023-07-22 00:00:00', 'Medium'),
('4fc82b26aecb47d2868c4efbe3581732a3e7cbcc6c2efb32062c08170a05eeb8', 'Spyware', 'DarkHotel', 80, '2023-08-30 00:00:00', 'Low'),
('6b23c0d5f35d1b11f9b683f0b0a617355deb11277d91ae091d399c655b87940d', 'Rootkit', 'Stuxnet', 96, '2023-09-14 00:00:00', 'High'),
('3f39d5c348e5b79d06e842c114e6cc571583bbf44e4b0ebfda1a01ec05745d43', 'Backdoor', 'GhostRAT', 87, '2023-10-05 00:00:00', 'Medium');

-- 用户表：存储系统用户的基本信息
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                                    -- 用户唯一标识符，自增
    username VARCHAR(50) UNIQUE NOT NULL,                     -- 用户名，不可重复
    email VARCHAR(100) UNIQUE NOT NULL,                      -- 邮箱地址，不可重复
    password_hash VARCHAR(255) NOT NULL,                     -- 密码哈希值，使用bcrypt加密
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,          -- 账户创建时间
    last_login TIMESTAMP,                                    -- 最后登录时间
    is_active BOOLEAN DEFAULT TRUE                          -- 账户状态标志
);

-- 扫描记录表：记录所有文件扫描的详细信息
CREATE TABLE scan_records (
    id SERIAL PRIMARY KEY,                                   -- 扫描记录唯一标识符
    user_id INTEGER REFERENCES users(id),                    -- 关联用户ID，外键
    file_name VARCHAR(255) NOT NULL,                        -- 被扫描文件名
    file_hash VARCHAR(64) NOT NULL,                         -- 文件SHA256哈希值
    file_size BIGINT NOT NULL,                              -- 文件大小（字节）
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,          -- 扫描时间
    status VARCHAR(20) NOT NULL,                            -- 扫描状态：pending/processing/completed/failed
    privacy_enabled BOOLEAN DEFAULT TRUE,                   -- 是否启用隐私保护
    result JSONB                                            -- 扫描结果，使用JSONB存储灵活的结果数据
);

-- 威胁数据库表：存储已知的恶意软件特征
CREATE TABLE known_threats (
    id SERIAL PRIMARY KEY,                                   -- 威胁记录唯一标识符
    hash VARCHAR(64) UNIQUE NOT NULL,                       -- 恶意软件哈希值
    threat_type VARCHAR(50) NOT NULL,                       -- 威胁类型（如：病毒、木马、勒索软件等）
    severity VARCHAR(20) NOT NULL,                          -- 威胁等级：low/medium/high/critical
    first_seen TIMESTAMP NOT NULL,                          -- 首次发现时间
    last_seen TIMESTAMP NOT NULL,                           -- 最后发现时间
    description TEXT                                        -- 威胁描述信息
);

-- 用户设置表：存储用户个性化配置
CREATE TABLE user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),        -- 关联用户ID
    notification_email BOOLEAN DEFAULT TRUE,                 -- 是否启用邮件通知
    notification_browser BOOLEAN DEFAULT TRUE,               -- 是否启用浏览器通知
    language VARCHAR(10) DEFAULT 'zh-CN',                   -- 用户界面语言偏好
    theme VARCHAR(20) DEFAULT 'light'                       -- 界面主题偏好
);

-- 扫描统计表：用于生成报告和分析
CREATE TABLE scan_statistics (
    id SERIAL PRIMARY KEY,                                   -- 统计记录唯一标识符
    user_id INTEGER REFERENCES users(id),                    -- 关联用户ID
    date DATE NOT NULL,                                     -- 统计日期
    total_scans INTEGER DEFAULT 0,                          -- 总扫描次数
    threats_detected INTEGER DEFAULT 0,                     -- 检测到的威胁数
    privacy_enabled_count INTEGER DEFAULT 0                 -- 启用隐私保护的扫描次数
);

-- 重要索引设计
CREATE INDEX idx_scan_records_user_id ON scan_records(user_id);    -- 优化按用户查询扫描记录
CREATE INDEX idx_scan_records_scan_date ON scan_records(scan_date); -- 优化时间范围查询
CREATE INDEX idx_scan_records_status ON scan_records(status);      -- 优化状态筛选
CREATE INDEX idx_known_threats_hash ON known_threats(hash);        -- 优化威胁哈希查询
CREATE INDEX idx_known_threats_type ON known_threats(threat_type); -- 优化威胁类型查询 