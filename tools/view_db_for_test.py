import sqlite3
import json
import os

def view_database():
    """查看数据库内容"""
    # 获取项目根目录
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 数据库文件路径
    db_path = os.path.join(root_dir, 'data', 'malware_detection.db')
    
    # 检查数据库文件是否存在
    if not os.path.exists(db_path):
        print(f"错误: 数据库文件 {db_path} 不存在")
        print("提示: 请先运行 'python tools/init_db.py' 初始化数据库")
        return
    
    # 连接到数据库
    conn = sqlite3.connect(db_path)
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

def check_root_database():
    """检查根目录下是否有额外的数据库文件"""
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    root_db_path = os.path.join(root_dir, 'malware_detection.db')
    if os.path.exists(root_db_path):
        print(f"警告: 在项目根目录下发现额外的数据库文件 {root_db_path}")
        print("这可能导致数据混淆问题。推荐执行以下操作之一:")
        print("1. 删除根目录下的数据库文件: rm malware_detection.db")
        print("2. 或者使用--force选项重置数据库: python tools/init_db.py --force")
        return True
    return False

if __name__ == "__main__":
    # 检查根目录下是否有额外的数据库文件
    if check_root_database():
        exit(1)
    
    view_database() 