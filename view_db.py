import sqlite3
import json

def view_database():
    """查看数据库内容"""
    # 连接到数据库
    conn = sqlite3.connect('malware_detection.db')
    cursor = conn.cursor()
    
    # 获取所有表名
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    print("数据库中的表:")
    for table in tables:
        print(f"\n=== {table[0]} 表 ===")
        # 获取表结构
        cursor.execute(f"PRAGMA table_info({table[0]})")
        columns = cursor.fetchall()
        print("列名:", [col[1] for col in columns])
        
        # 获取表数据
        cursor.execute(f"SELECT * FROM {table[0]}")
        rows = cursor.fetchall()
        
        if not rows:
            print("表为空")
            continue
            
        print("\n数据:")
        for row in rows:
            print("-" * 50)
            for i, col in enumerate(columns):
                value = row[i]
                # 尝试解析JSON字段
                if isinstance(value, str) and (value.startswith('{') or value.startswith('[')):
                    try:
                        value = json.loads(value)
                        value = json.dumps(value, ensure_ascii=False, indent=2)
                    except:
                        pass
                print(f"{col[1]}: {value}")
    
    conn.close()

if __name__ == "__main__":
    view_database() 