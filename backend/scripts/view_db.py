import sqlite3
import os
import json
from datetime import datetime

def find_db_file():
    """查找数据库文件"""
    # 检查当前目录
    if os.path.exists('malware_detection.db'):
        return 'malware_detection.db'
    
    # 检查backend目录
    if os.path.exists('backend/malware_detection.db'):
        return 'backend/malware_detection.db'
    
    # 检查父目录
    if os.path.exists('../malware_detection.db'):
        return '../malware_detection.db'
    
    # 搜索整个项目目录
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.db'):
                return os.path.join(root, file)
    
    return None

def display_table(conn, table_name):
    """显示表的内容"""
    cursor = conn.cursor()
    
    # 获取表的所有列名
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [col[1] for col in cursor.fetchall()]
    
    # 获取表的所有数据
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    
    print(f"\n=== {table_name} 表内容 ===")
    if not rows:
        print("表为空")
        return
    
    # 打印列名
    print("\n列名:", ", ".join(columns))
    
    # 打印数据
    for row in rows:
        print("\n记录:")
        for col, val in zip(columns, row):
            # 处理JSON字段
            if isinstance(val, str) and (val.startswith('{') or val.startswith('[')):
                try:
                    val = json.loads(val)
                    val = json.dumps(val, indent=2, ensure_ascii=False)
                except:
                    pass
            # 处理日期时间字段
            elif isinstance(val, str) and ('created_at' in col or 'last_login' in col or 'scan_date' in col):
                try:
                    dt = datetime.fromisoformat(val)
                    val = dt.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    pass
            print(f"{col}: {val}")

def view_database():
    """查看数据库内容"""
    db_path = find_db_file()
    if not db_path:
        print("未找到数据库文件")
        return
    
    print(f"找到数据库文件: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 获取所有表名
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        if not tables:
            print("数据库中没有表")
            return
        
        print("\n数据库中的表:")
        for table in tables:
            print(f"- {table[0]}")
            display_table(conn, table[0])
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"数据库错误: {e}")
    except Exception as e:
        print(f"发生错误: {e}")

if __name__ == "__main__":
    view_database() 