"""
创建并查看SQLite数据库内容的脚本
"""

import sqlite3
import os
import json
from pathlib import Path

# 创建数据库文件
def create_database():
    """创建SQLite数据库并添加示例数据"""
    # 确保backend/uploads目录存在
    os.makedirs("backend/uploads", exist_ok=True)
    
    # 创建数据库连接
    conn = sqlite3.connect("malware_detection.db")
    cursor = conn.cursor()
    
    # 创建users表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
    )
    ''')
    
    # 创建known_threats表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS known_threats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT NOT NULL UNIQUE,
        threat_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        first_seen TIMESTAMP NOT NULL,
        last_seen TIMESTAMP NOT NULL,
        description TEXT
    )
    ''')
    
    # 创建scan_records表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS scan_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        file_name TEXT NOT NULL,
        file_hash TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        privacy_enabled BOOLEAN DEFAULT 1,
        result TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # 添加示例用户
    cursor.execute('''
    INSERT OR IGNORE INTO users (username, email, password_hash, created_at, is_active)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)
    ''', ("admin", "admin@example.com", "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"))
    
    cursor.execute('''
    INSERT OR IGNORE INTO users (username, email, password_hash, created_at, is_active)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)
    ''', ("testuser", "test@example.com", "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"))
    
    # 添加示例恶意软件特征
    threats = [
        ("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "Trojan", "high", "2023-01-15", "2023-12-31", "Emotet trojan known for banking information theft"),
        ("a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a", "Ransomware", "critical", "2023-02-20", "2023-12-31", "WannaCry ransomware that encrypts files and demands ransom"),
        ("3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278", "Spyware", "medium", "2023-03-10", "2023-12-31", "Pegasus spyware targeting mobile devices"),
        ("8c3d4a0f94b252c7859a96fd69a5711b5a4e599afc857c8b4f414b3fb6a095b9", "Adware", "low", "2023-04-05", "2023-12-31", "Browser extension that shows unwanted advertisements"),
        ("2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3", "Worm", "medium", "2023-05-12", "2023-12-31", "Conficker worm that can spread through network")
    ]
    
    for threat in threats:
        cursor.execute('''
        INSERT OR IGNORE INTO known_threats (hash, threat_type, severity, first_seen, last_seen, description)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', threat)
    
    # 添加示例扫描记录
    scan_result = json.dumps({
        "is_malicious": True,
        "matches": ["e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
        "privacy_proof": "simulated_proof_data",
        "scan_method": "psi"
    })
    
    cursor.execute('''
    INSERT OR IGNORE INTO scan_records (user_id, file_name, file_hash, file_size, scan_date, status, privacy_enabled, result)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)
    ''', (1, "test_malware.exe", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", 1024000, "completed", True, scan_result))
    
    # 提交事务并关闭连接
    conn.commit()
    conn.close()
    
    print("数据库创建成功，示例数据已添加")

def display_table(conn, table_name):
    """显示表的内容"""
    print(f"\n=== {table_name} 表内容 ===")
    
    # 获取列信息
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    print(f"列名: {', '.join(column_names)}")
    
    # 查询所有数据
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    
    if not rows:
        print("表为空")
        return
    
    # 显示数据
    for row in rows:
        formatted_row = []
        # 特殊处理JSON字段
        for i, val in enumerate(row):
            if isinstance(val, str) and (val.startswith('{') or val.startswith('[')):
                try:
                    parsed = json.loads(val)
                    formatted_row.append(json.dumps(parsed, ensure_ascii=False, indent=2))
                except:
                    formatted_row.append(str(val))
            else:
                formatted_row.append(str(val))
        
        print("-" * 80)
        for i, col in enumerate(column_names):
            val = formatted_row[i] if i < len(formatted_row) else "NULL"
            print(f"{col}: {val}")

def view_database():
    """查看数据库内容"""
    db_path = "malware_detection.db"
    
    if not os.path.exists(db_path):
        print(f"数据库文件 {db_path} 不存在")
        return
    
    print(f"连接数据库: {db_path}")
    conn = sqlite3.connect(db_path)
    
    # 获取所有表
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    if not tables:
        print("数据库中没有表")
        return
    
    print(f"找到表: {', '.join(t[0] for t in tables)}")
    
    # 显示每个表的内容
    for table in tables:
        display_table(conn, table[0])
    
    conn.close()

if __name__ == "__main__":
    # 创建数据库
    create_database()
    
    # 查看数据库内容
    view_database() 