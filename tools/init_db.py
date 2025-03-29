#!/usr/bin/env python
"""
数据库初始化脚本 (简化版)
用于重置数据库到初始状态，保留基本用户账号
使用直接的SQLite API以确保表创建成功
"""

import os
import sys
import argparse
import logging
import sqlite3
import json
import hashlib
import subprocess
import time
from datetime import datetime

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

def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description="初始化数据库")
    parser.add_argument('--force', action='store_true', help='强制重新创建数据库')
    parser.add_argument('--keep-data', action='store_true', help='保留扫描记录数据')
    parser.add_argument('--restart-backend', action='store_true', help='重启后端服务')
    return parser.parse_args()

def get_db_path():
    """获取数据库文件路径"""
    return os.path.join(data_dir, 'malware_detection.db')

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
    
    # 验证表创建
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    logger.info(f"已创建表: {', '.join(tables)}")
    
    return "users" in tables and "known_threats" in tables and "scan_records" in tables

def reset_users(conn, force=False):
    """重置用户表，添加基本用户"""
    cursor = conn.cursor()
    
    if force:
        # 删除所有用户
        cursor.execute("DELETE FROM users")
        logger.info("已删除所有用户")
    
    # 检查admin用户是否存在
    cursor.execute("SELECT * FROM users WHERE username = ?", ("admin",))
    admin_exists = cursor.fetchone()
    
    if not admin_exists or force:
        # 创建管理员用户
        created_at = datetime.utcnow().isoformat()
        preferences = json.dumps({"language": "zh-CN", "theme": "light"})
        notification_settings = json.dumps({"email_alerts": True, "scan_notifications": True})
        
        cursor.execute("""
        INSERT OR REPLACE INTO users 
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
        logger.info("已添加/更新admin用户")
    
    # 检查testuser用户是否存在
    cursor.execute("SELECT * FROM users WHERE username = ?", ("testuser",))
    testuser_exists = cursor.fetchone()
    
    if not testuser_exists or force:
        # 创建测试用户
        created_at = datetime.utcnow().isoformat()
        preferences = json.dumps({"language": "en-US", "theme": "dark"})
        notification_settings = json.dumps({"email_alerts": False, "scan_notifications": True})
        
        cursor.execute("""
        INSERT OR REPLACE INTO users 
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
        logger.info("已添加/更新testuser用户")
    
    conn.commit()
    
    # 验证用户数
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    logger.info(f"当前用户总数: {user_count}")
    
    return True

def reset_threats(conn, force=False):
    """重置威胁特征表，添加基本威胁数据"""
    cursor = conn.cursor()
    
    if force:
        # 删除所有威胁
        cursor.execute("DELETE FROM known_threats")
        logger.info("已删除所有威胁特征数据")
    
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
    
    # 添加或更新威胁数据
    for threat in threats:
        cursor.execute("""
        INSERT OR REPLACE INTO known_threats 
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
    
    # 验证威胁数据
    cursor.execute("SELECT COUNT(*) FROM known_threats")
    threat_count = cursor.fetchone()[0]
    logger.info(f"当前威胁特征数: {threat_count}")
    
    return True

def reset_scan_records(conn, keep_data=False):
    """重置扫描记录，根据需要保留现有数据"""
    cursor = conn.cursor()
    
    if not keep_data:
        # 删除所有扫描记录
        cursor.execute("DELETE FROM scan_records")
        conn.commit()
        
        cursor.execute("SELECT COUNT(*) FROM scan_records")
        record_count = cursor.fetchone()[0]
        logger.info(f"已删除所有扫描记录，当前记录数: {record_count}")
    else:
        cursor.execute("SELECT COUNT(*) FROM scan_records")
        record_count = cursor.fetchone()[0]
        logger.info(f"保留现有扫描记录，当前记录数: {record_count}")
    
    return True

def safe_delete_db_file():
    """安全删除数据库文件"""
    db_path = get_db_path()
    
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            logger.info(f"已删除数据库文件: {db_path}")
            return True
        except Exception as e:
            logger.warning(f"删除数据库文件失败: {e}")
            logger.warning("可能有其他程序正在使用数据库，请关闭后重试")
            return False
    
    return True

def restart_backend_service():
    """重启后端服务"""
    logger.info("尝试重启后端服务...")
    
    # 使用taskkill终止所有Python进程(谨慎使用)
    try:
        # 查找运行backend.main的Python进程
        find_cmd = 'wmic process where "commandline like \'%backend.main%\' and name like \'%python%\'" get processid'
        process = subprocess.Popen(find_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, _ = process.communicate()
        
        # 提取进程ID
        lines = output.decode().strip().split('\n')
        if len(lines) > 1:  # 第一行是标题
            for line in lines[1:]:
                if line.strip():
                    pid = line.strip()
                    kill_cmd = f'taskkill /F /PID {pid}'
                    subprocess.run(kill_cmd, shell=True)
                    logger.info(f"已终止后端进程 PID: {pid}")
        
        # 给进程一些时间来终止
        time.sleep(1)
        
        # 启动新的后端进程
        backend_cmd = f'start cmd /k "{sys.executable}" -m backend.main'
        subprocess.Popen(backend_cmd, shell=True)
        logger.info("已启动新的后端服务")
        
        # 等待服务启动
        time.sleep(2)
        logger.info("后端服务重启完成")
        return True
    except Exception as e:
        logger.error(f"重启后端服务时出错: {e}")
        return False

def init_db(force=False, keep_data=False, restart_backend=False):
    """初始化数据库主函数"""
    start_time = datetime.now()
    logger.info(f"开始数据库重置 (强制模式: {force}, 保留扫描数据: {keep_data})")
    
    # 强制模式下删除数据库文件
    if force and not safe_delete_db_file():
        logger.error("无法删除现有数据库文件，请确保没有其他程序正在使用数据库")
        logger.info("提示: 可以尝试关闭所有相关应用后重试")
        sys.exit(1)
    
    # 打开数据库连接
    conn = get_connection()
    try:
        # 创建表结构
        if not create_tables(conn):
            logger.error("创建表结构失败")
            sys.exit(1)
        
        # 重置用户数据
        if not reset_users(conn, force):
            logger.error("重置用户数据失败")
            sys.exit(1)
        
        # 重置威胁数据
        if not reset_threats(conn, force):
            logger.error("重置威胁特征数据失败")
            sys.exit(1)
        
        # 重置扫描记录
        if not reset_scan_records(conn, keep_data):
            logger.error("重置扫描记录失败")
            sys.exit(1)
        
        # 计算运行时间
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ 数据库已成功重置! (用时: {elapsed:.2f}秒)")
        logger.info("  - 已重置用户账号，仅保留admin和testuser")
        logger.info("  - 威胁数据已刷新")
        if not keep_data:
            logger.info("  - 所有扫描记录已清除")
        
    finally:
        conn.close()
    
    # 重启后端服务（如果需要）
    if restart_backend:
        restart_backend_service()

if __name__ == "__main__":
    args = parse_args()
    init_db(force=args.force, keep_data=args.keep_data, restart_backend=args.restart_backend)