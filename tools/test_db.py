#!/usr/bin/env python
"""
数据库测试脚本
用于验证数据库连接和表创建是否正常
"""

import os
import sys
import logging
import sqlite3
from datetime import datetime

# 设置日志
logging.basicConfig(
    level=logging.DEBUG,
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

try:
    # 尝试导入SQLAlchemy相关模块
    from sqlalchemy import create_engine, inspect, Column, Integer, String, DateTime
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.exc import SQLAlchemyError
    
    # 尝试导入实际模型（如果失败则使用测试模型）
    try:
        from backend.db.session import engine, SessionLocal, Base
        from backend.models import User, KnownThreat, ScanRecord
        logger.info("成功导入实际数据模型")
        use_real_models = True
    except ImportError as e:
        logger.warning(f"导入实际模型失败: {e}")
        logger.info("将使用测试模型")
        use_real_models = False
        
        # 创建测试引擎和模型
        db_path = os.path.join(data_dir, 'test_db.sqlite')
        engine = create_engine(f"sqlite:///{db_path}")
        Base = declarative_base()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # 定义简单的测试模型
        class User(Base):
            __tablename__ = "users"
            id = Column(Integer, primary_key=True)
            username = Column(String(50), unique=True, nullable=False)
            email = Column(String(100), unique=True, nullable=False)
            created_at = Column(DateTime, default=datetime.utcnow)
            
        class TestModel(Base):
            __tablename__ = "test_table"
            id = Column(Integer, primary_key=True)
            name = Column(String(50))
            created_at = Column(DateTime, default=datetime.utcnow)
        
except ImportError as e:
    logger.error(f"导入SQLAlchemy失败: {e}")
    sys.exit(1)

def check_sqlite_version():
    """检查SQLite版本"""
    try:
        conn = sqlite3.connect(":memory:")
        version = conn.execute("SELECT sqlite_version()").fetchone()[0]
        conn.close()
        logger.info(f"SQLite版本: {version}")
    except Exception as e:
        logger.error(f"检查SQLite版本失败: {e}")

def test_direct_sqlite():
    """直接使用SQLite API测试"""
    try:
        db_path = os.path.join(data_dir, 'test_direct.sqlite')
        if os.path.exists(db_path):
            os.remove(db_path)
            logger.info(f"已删除现有测试数据库文件: {db_path}")
        
        # 创建连接和表
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")
        cursor.execute("INSERT INTO test (name) VALUES (?)", ("测试数据",))
        conn.commit()
        
        # 验证数据
        cursor.execute("SELECT * FROM test")
        data = cursor.fetchall()
        logger.info(f"直接SQLite测试 - 插入的数据: {data}")
        
        # 检查表是否存在
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        logger.info(f"直接SQLite测试 - 所有表: {tables}")
        
        conn.close()
        logger.info("直接SQLite测试成功")
        return True
    except Exception as e:
        logger.error(f"直接SQLite测试失败: {e}")
        return False

def test_sqlalchemy():
    """使用SQLAlchemy测试数据库操作"""
    try:
        # 创建测试数据库
        test_db_path = os.path.join(data_dir, 'test_sqlalchemy.sqlite')
        if os.path.exists(test_db_path):
            os.remove(test_db_path)
            logger.info(f"已删除现有SQLAlchemy测试数据库: {test_db_path}")
        
        # 创建新的测试引擎和会话
        test_engine = create_engine(f"sqlite:///{test_db_path}", echo=True)
        TestBase = declarative_base()
        
        # 定义简单模型
        class TestItem(TestBase):
            __tablename__ = "test_items"
            id = Column(Integer, primary_key=True)
            name = Column(String(50))
            
        # 创建表
        TestBase.metadata.create_all(test_engine)
        logger.info("SQLAlchemy测试 - 表创建成功")
        
        # 创建会话
        TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
        session = TestSession()
        
        # 添加数据
        new_item = TestItem(name="测试项目")
        session.add(new_item)
        session.commit()
        
        # 查询数据
        items = session.query(TestItem).all()
        logger.info(f"SQLAlchemy测试 - 查询结果: {[item.name for item in items]}")
        
        # 验证使用inspect
        inspector = inspect(test_engine)
        tables = inspector.get_table_names()
        logger.info(f"SQLAlchemy测试 - 所有表: {tables}")
        
        session.close()
        logger.info("SQLAlchemy测试成功")
        return True
    except Exception as e:
        logger.error(f"SQLAlchemy测试失败: {e}")
        return False

def test_real_models():
    """测试实际模型的表创建"""
    if not use_real_models:
        logger.warning("未导入实际模型，跳过此测试")
        return False
        
    try:
        # 检查连接字符串
        logger.info(f"数据库连接URL: {engine.url}")
        
        # 获取表名
        inspector = inspect(engine)
        tables_before = inspector.get_table_names()
        logger.info(f"表创建前的表: {tables_before}")
        
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        logger.info("已尝试创建表")
        
        # 再次获取表名
        tables_after = inspector.get_table_names()
        logger.info(f"表创建后的表: {tables_after}")
        
        # 检查是否包含关键表
        required_tables = {"users", "known_threats", "scan_records"}
        if required_tables.issubset(set(tables_after)):
            logger.info("所有必要的表已创建")
            return True
        else:
            missing = required_tables - set(tables_after)
            logger.error(f"缺少表: {missing}")
            return False
    except Exception as e:
        logger.error(f"测试实际模型失败: {e}")
        return False

def main():
    """主测试函数"""
    logger.info("开始数据库诊断测试")
    
    # 检查SQLite版本
    check_sqlite_version()
    
    # 测试直接使用SQLite
    direct_test_ok = test_direct_sqlite()
    logger.info(f"直接SQLite测试结果: {'成功' if direct_test_ok else '失败'}")
    
    # 测试SQLAlchemy
    sqlalchemy_test_ok = test_sqlalchemy()
    logger.info(f"SQLAlchemy测试结果: {'成功' if sqlalchemy_test_ok else '失败'}")
    
    # 测试实际模型
    real_models_ok = test_real_models()
    logger.info(f"实际模型测试结果: {'成功' if real_models_ok else '失败'}")
    
    # 总结
    if direct_test_ok and sqlalchemy_test_ok:
        logger.info("基础数据库功能正常")
    else:
        logger.error("基础数据库功能异常")
        
    if real_models_ok:
        logger.info("实际模型表创建成功")
    else:
        logger.error("实际模型表创建失败")
    
    return 0 if (direct_test_ok and sqlalchemy_test_ok and real_models_ok) else 1

if __name__ == "__main__":
    sys.exit(main()) 