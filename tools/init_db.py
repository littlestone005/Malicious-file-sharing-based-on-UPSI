#!/usr/bin/env python
"""
简化版数据库初始化脚本
删除原有数据库并创建新的数据库，添加基本用户账号
"""

import os
import sys
import logging
import sqlite3
import hashlib
from datetime import datetime
import socket
import subprocess
import time
import json

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# 添加项目根目录到系统路径
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root_dir)

# 确保data目录存在
data_dir = os.path.join(root_dir, 'data')
os.makedirs(data_dir, exist_ok=True)

# 尝试导入密码哈希函数
try:
    from backend.core.security import get_password_hash
except ImportError:
    logger.warning("无法导入密码哈希函数，将使用简单SHA256哈希")
    
    def get_password_hash(password):
        """简单的密码哈希函数"""
        return hashlib.sha256(password.encode()).hexdigest()

def get_db_path():
    """获取数据库文件路径"""
    return os.path.join(data_dir, 'malware_detection.db')

def delete_database():
    """删除现有数据库文件"""
    db_path = get_db_path()
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            logger.info(f"已删除旧数据库文件: {db_path}")
            return True
        except Exception as e:
            logger.error(f"删除数据库文件失败: {e}")
            logger.error("可能有其他程序正在使用数据库，请关闭后重试")
            return False
    return True

def get_connection():
    """获取数据库连接"""
    conn = sqlite3.connect(get_db_path())
    # 启用外键约束
    conn.execute("PRAGMA foreign_keys = ON")
    # 返回行作为字典而非元组
    conn.row_factory = sqlite3.Row
    return conn

def create_tables(conn):
    """创建所有必要的表"""
    cursor = conn.cursor()
    
    # 创建用户表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        phone TEXT,
        password TEXT,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_login TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        preferences TEXT,
        notification_settings TEXT
    )
    ''')
    
    # 创建威胁特征表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS known_threats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT UNIQUE NOT NULL,
        threat_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        first_seen TEXT NOT NULL,
        last_seen TEXT NOT NULL,
        description TEXT
    )
    ''')
    
    # 创建扫描记录表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS scan_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_hash TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        scan_date TEXT NOT NULL,
        status TEXT NOT NULL,
        privacy_enabled INTEGER NOT NULL DEFAULT 1,
        result TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # 添加索引以提高性能
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_known_threats_hash ON known_threats (hash)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scan_records_user_id ON scan_records (user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scan_records_status ON scan_records (status)")
    
    conn.commit()
    logger.info("已创建数据库表结构")
    return True

def add_default_users(conn):
    """添加默认用户"""
    cursor = conn.cursor()
    
    # 创建管理员用户
    created_at = datetime.utcnow().isoformat()
    preferences = '{"language": "zh-CN", "theme": "light"}'
    notification_settings = '{"email_alerts": true, "scan_notifications": true}'
    
    cursor.execute("""
    INSERT INTO users 
    (username, email, password, password_hash, created_at, is_active, preferences, notification_settings)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "admin", 
        "admin@example.com", 
        "admin", 
        get_password_hash("admin"),
        created_at,
        1,
        preferences,
        notification_settings
    ))
    
    # 创建测试用户
    preferences = '{"language": "en-US", "theme": "dark"}'
    notification_settings = '{"email_alerts": false, "scan_notifications": true}'
    
    cursor.execute("""
    INSERT INTO users 
    (username, email, password, password_hash, created_at, is_active, preferences, notification_settings)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "testuser", 
        "test@example.com", 
        "test123", 
        get_password_hash("test123"),
        created_at,
        1,
        preferences,
        notification_settings
    ))
    
    conn.commit()
    logger.info("已添加默认用户: admin, testuser")
    return True

def add_sample_threats(conn):
    """添加示例威胁数据"""
    cursor = conn.cursor()
    
    # 基本威胁数据
    threats = [
        {
            "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "threat_type": "Trojan",
            "severity": "high",
            "first_seen": "2023-01-15T00:00:00",
            "last_seen": datetime.utcnow().isoformat(),
            "description": "Emotet trojan known for banking information theft"
        },
        {
            "hash": "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
            "threat_type": "Ransomware",
            "severity": "critical",
            "first_seen": "2023-02-20T00:00:00",
            "last_seen": datetime.utcnow().isoformat(),
            "description": "WannaCry ransomware that encrypts files and demands ransom"
        },
        {
            "hash": "3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278",
            "threat_type": "Spyware",
            "severity": "medium",
            "first_seen": "2023-03-10T00:00:00",
            "last_seen": datetime.utcnow().isoformat(),
            "description": "Pegasus spyware targeting mobile devices"
        }
    ]
    
    # 添加威胁数据
    for threat in threats:
        cursor.execute("""
        INSERT INTO known_threats 
        (hash, threat_type, severity, first_seen, last_seen, description)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            threat["hash"],
            threat["threat_type"],
            threat["severity"],
            threat["first_seen"],
            threat["last_seen"],
            threat["description"]
        ))
    
    conn.commit()
    logger.info(f"已添加 {len(threats)} 条示例威胁数据")
    return True

def add_sample_scan_records(conn):
    """添加示例扫描记录"""
    cursor = conn.cursor()
    
    # 获取用户ID
    cursor.execute("SELECT id FROM users WHERE username = ?", ("admin",))
    admin_id = cursor.fetchone()[0]
    
    cursor.execute("SELECT id FROM users WHERE username = ?", ("testuser",))
    testuser_id = cursor.fetchone()[0]
    
    # 创建一些示例扫描记录
    example_records = [
        # 管理员用户的记录 - 包含各种不同状态和文件类型
        {
            "user_id": admin_id,
            "user_name": "admin",
            "file_name": "document.pdf",
            "file_hash": "5f4dcc3b5aa765d61d8327deb882cf99",
            "file_size": 1250000,
            "scan_date": "2023-12-15T14:30:22",
            "status": "completed",
            "privacy_enabled": 1,
            "result": json.dumps({
                "is_malicious": False,
                "scan_method": "psi",
                "privacy_proof": "base64_encoded_proof_data"
            })
        },
        {
            "user_id": admin_id,
            "user_name": "admin",
            "file_name": "setup.exe",
            "file_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "file_size": 4500000,
            "scan_date": "2023-12-14T10:15:45",
            "status": "completed",
            "privacy_enabled": 1,
            "result": json.dumps({
                "is_malicious": True,
                "scan_method": "psi",
                "threat_details": {
                    "type": "Trojan",
                    "severity": "high",
                    "description": "Trojan horse that steals banking credentials"
                }
            })
        },
        {
            "user_id": admin_id,
            "user_name": "admin",
            "file_name": "script.js",
            "file_hash": "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
            "file_size": 35000,
            "scan_date": "2023-12-13T09:22:18",
            "status": "completed",
            "privacy_enabled": 1,
            "result": json.dumps({
                "is_malicious": True,
                "scan_method": "psi",
                "threat_details": {
                    "type": "Spyware",
                    "severity": "medium",
                    "description": "JavaScript code with suspicious behavior pattern"
                }
            })
        },
        {
            "user_id": admin_id,
            "user_name": "admin",
            "file_name": "image.jpg",
            "file_hash": "d16fb36f0911f878998c136191af705e",
            "file_size": 2500000,
            "scan_date": "2023-12-12T16:45:30",
            "status": "completed",
            "privacy_enabled": 1,
            "result": json.dumps({
                "is_malicious": False,
                "scan_method": "psi"
            })
        },
        {
            "user_id": admin_id,
            "user_name": "admin",
            "file_name": "archive.zip",
            "file_hash": "3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278",
            "file_size": 7800000,
            "scan_date": "2023-12-11T11:10:05",
            "status": "completed",
            "privacy_enabled": 0,
            "result": json.dumps({
                "is_malicious": False,
                "scan_method": "direct"
            })
        },
        # 测试用户的记录
        {
            "user_id": testuser_id,
            "user_name": "testuser",
            "file_name": "presentation.pptx",
            "file_hash": "d8d5f5f5f5f5f5f5f5f5f5f5f5f5f5f5",
            "file_size": 3500000,
            "scan_date": "2023-12-10T13:22:15",
            "status": "completed",
            "privacy_enabled": 1,
            "result": json.dumps({
                "is_malicious": False,
                "scan_method": "psi"
            })
        },
        {
            "user_id": testuser_id,
            "user_name": "testuser",
            "file_name": "malware_sample.exe",
            "file_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "file_size": 250000,
            "scan_date": "2023-12-09T09:15:30",
            "status": "completed",
            "privacy_enabled": 1,
            "result": json.dumps({
                "is_malicious": True,
                "scan_method": "psi",
                "threat_details": {
                    "type": "Ransomware",
                    "severity": "high",
                    "description": "Ransomware that encrypts user files and demands payment"
                }
            })
        }
    ]
    
    # 插入示例记录
    for record in example_records:
        cursor.execute("""
        INSERT INTO scan_records 
        (user_id, user_name, file_name, file_hash, file_size, scan_date, status, privacy_enabled, result)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record["user_id"],
            record["user_name"],
            record["file_name"],
            record["file_hash"],
            record["file_size"],
            record["scan_date"],
            record["status"],
            record["privacy_enabled"],
            record["result"]
        ))
    
    conn.commit()
    logger.info(f"已添加 {len(example_records)} 条示例扫描记录")
    return True

def is_backend_running(port=8000):
    """检查后端服务是否正在运行"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        return result == 0  # 如果端口开放，说明服务在运行
    except:
        return False

def is_frontend_running():
    """检查前端服务是否正在运行
    
    检查常见的前端开发服务器端口: 3000(React默认), 3001(Vue默认), 3002(Next.js默认), 5173(Vite默认), 8080(Vue默认)
    """
    frontend_ports = [3000, 3001, 3002, 5173, 8080]
    for port in frontend_ports:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()
            if result == 0:  # 端口开放
                return True, port
        except:
            pass
    return False, None

def init_db():
    """初始化数据库主函数"""
    start_time = datetime.now()
    logger.info("开始数据库初始化")
    
    # 删除旧数据库
    if not delete_database():
        logger.error("无法删除现有数据库文件，请确保没有其他程序正在使用数据库")
        sys.exit(1)
    
    # 打开数据库连接
    conn = get_connection()
    try:
        # 创建表结构
        create_tables(conn)
        
        # 添加默认用户
        add_default_users(conn)
        
        # 添加示例威胁数据
        add_sample_threats(conn)
        
        # 添加示例扫描记录
        add_sample_scan_records(conn)
        
        # 计算运行时间
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ 数据库初始化完成! (用时: {elapsed:.2f}秒)")
        logger.info("  - 数据库已重新创建")
        logger.info("  - 已添加默认用户: admin, testuser")
        logger.info("  - 已添加示例威胁数据")
        logger.info("  - 已添加示例扫描记录")
        logger.info("\n请记得重启后端服务以应用新的数据库!")
        
    finally:
        conn.close()

if __name__ == "__main__":
    # 检查后端服务是否在运行
    if is_backend_running():
        logger.warning("⚠️ 检测到后端服务正在运行!")
        logger.warning("请先关闭后端服务，否则可能导致问题")
        exit()
    init_db()

    logger.info("开始检查前端服务")
    if is_frontend_running():
        logger.info("前端服务正在运行")
        logger.info("开始重启后端服务")
        # 重启后端服务器
        backend_cmd = f'"{sys.executable}" -m backend.main'
        subprocess.Popen(f'start cmd /k {backend_cmd}', shell=True)
        logger.info("后端服务已重启")
    else:
        logger.info("前端服务未运行，无需重启")
        
    logger.info("数据库初始化完成")
