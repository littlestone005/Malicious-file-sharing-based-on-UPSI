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
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(100),
    scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_files INT NOT NULL,
    malicious_files INT NOT NULL,
    privacy_mode BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255)
);

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