"""
数据库升级脚本

用于手动添加新的用户设置字段
"""

import sqlite3
import os
import json
from pathlib import Path

# 获取数据库路径
DB_PATH = Path(__file__).parent.parent.parent / "malware_detection.db"

def upgrade_database():
    """执行数据库升级"""
    print(f"尝试连接到数据库: {DB_PATH}")
    
    # 检查数据库是否存在
    if not os.path.exists(DB_PATH):
        print(f"错误: 数据库文件不存在: {DB_PATH}")
        return False
    
    try:
        # 连接数据库
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        # 获取users表的列信息
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        # 添加缺失的列
        if "name" not in column_names:
            print("添加name列到users表")
            cursor.execute("ALTER TABLE users ADD COLUMN name TEXT")
        
        if "phone" not in column_names:
            print("添加phone列到users表")
            cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT")
        
        if "preferences" not in column_names:
            print("添加preferences列到users表")
            cursor.execute("ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT '{}'")
        
        if "notification_settings" not in column_names:
            print("添加notification_settings列到users表")
            cursor.execute("ALTER TABLE users ADD COLUMN notification_settings TEXT DEFAULT '{}'")
        
        # 提交更改
        conn.commit()
        
        # 更新现有记录，确保JSON字段有有效值
        cursor.execute("SELECT id, preferences, notification_settings FROM users")
        users = cursor.fetchall()
        
        for user_id, preferences, notification_settings in users:
            # 处理preferences字段
            if preferences is None or preferences == '':
                cursor.execute("UPDATE users SET preferences = '{}' WHERE id = ?", (user_id,))
            
            # 处理notification_settings字段
            if notification_settings is None or notification_settings == '':
                cursor.execute("UPDATE users SET notification_settings = '{}' WHERE id = ?", (user_id,))
        
        # 提交更改
        conn.commit()
        
        print("数据库升级成功")
        return True
    
    except sqlite3.Error as e:
        print(f"数据库错误: {e}")
        return False
    
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    upgrade_database() 