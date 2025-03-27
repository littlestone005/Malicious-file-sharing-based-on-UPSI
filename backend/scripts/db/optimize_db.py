#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
数据库优化脚本
用于执行SQLite数据库维护和优化操作，包括：
- 清理旧的扫描记录
- 重建索引
- 执行VACUUM操作压缩数据库
- 分析表优化查询计划
"""

import argparse
import datetime
import logging
import os
import sys
import time
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).resolve().parents[2]))

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from backend.core.config import settings
from backend.database.base import Base
from backend.models.scan_record import ScanRecord
from backend.models.user import User
from backend.models.known_threat import KnownThreat

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("db-optimizer")

# 创建不使用连接池的引擎，以便执行维护操作
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
    poolclass=NullPool,  # 不使用连接池
)

# 创建会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def clean_old_records(session, days_old=30):
    """清理指定天数前的扫描记录"""
    logger.info(f"正在清理 {days_old} 天前的扫描记录...")
    
    cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days_old)
    
    # 计算要删除的记录数
    count_to_delete = session.query(ScanRecord).filter(
        ScanRecord.scan_date < cutoff_date
    ).count()
    
    if count_to_delete == 0:
        logger.info(f"没有找到 {days_old} 天前的记录，无需清理")
        return 0
    
    logger.info(f"将删除 {count_to_delete} 条旧扫描记录")
    
    # 删除记录
    deleted = session.query(ScanRecord).filter(
        ScanRecord.scan_date < cutoff_date
    ).delete(synchronize_session=False)
    
    session.commit()
    logger.info(f"成功删除 {deleted} 条旧扫描记录")
    return deleted


def vacuum_database(session):
    """执行VACUUM操作压缩数据库文件"""
    logger.info("开始执行VACUUM操作...")
    start_time = time.time()
    
    # 对于SQLite，需要先提交现有事务
    session.commit()
    
    # 执行VACUUM
    session.execute(text("VACUUM"))
    
    # 再次提交以确保VACUUM完成
    session.commit()
    
    elapsed = time.time() - start_time
    logger.info(f"VACUUM操作完成，用时 {elapsed:.2f} 秒")


def analyze_tables(session):
    """执行ANALYZE操作，更新数据库统计信息，优化查询计划"""
    logger.info("开始分析表...")
    
    # 分析所有表
    session.execute(text("ANALYZE"))
    
    # 也可以分析特定表
    tables = ["users", "known_threats", "scan_records"]
    for table in tables:
        logger.info(f"分析表: {table}")
        session.execute(text(f"ANALYZE {table}"))
    
    session.commit()
    logger.info("表分析完成")


def rebuild_indexes(session):
    """重建数据库索引"""
    logger.info("开始重建索引...")
    
    # 重建SQLite索引
    session.execute(text("REINDEX"))
    session.commit()
    
    logger.info("索引重建完成")


def optimize_database_settings(session):
    """优化SQLite数据库设置"""
    logger.info("优化数据库设置...")
    
    # 仅对SQLite执行
    if settings.DATABASE_URL.startswith("sqlite"):
        # 配置WAL模式
        session.execute(text("PRAGMA journal_mode=WAL"))
        
        # 配置同步模式 (1=NORMAL, 2=FULL, 0=OFF)
        session.execute(text("PRAGMA synchronous=NORMAL"))
        
        # 增加缓存大小 (以页为单位，负值表示KB)
        session.execute(text("PRAGMA cache_size=-10000"))  # 约10MB
        
        # 内存映射设置
        session.execute(text("PRAGMA mmap_size=30000000"))  # 约30MB
        
        # 临时表存储在内存中
        session.execute(text("PRAGMA temp_store=MEMORY"))
        
        session.commit()
        
        # 读取设置结果
        results = {}
        for pragma in ["journal_mode", "synchronous", "cache_size", "mmap_size", "temp_store"]:
            result = session.execute(text(f"PRAGMA {pragma}")).scalar()
            results[pragma] = result
        
        logger.info(f"数据库设置已优化: {results}")
    else:
        logger.info("非SQLite数据库，跳过特定优化设置")


def check_database_integrity(session):
    """检查数据库完整性"""
    logger.info("执行数据库完整性检查...")
    
    if settings.DATABASE_URL.startswith("sqlite"):
        result = session.execute(text("PRAGMA integrity_check")).scalar()
        if result == "ok":
            logger.info("数据库完整性检查通过")
        else:
            logger.error(f"数据库完整性检查失败: {result}")
    else:
        logger.info("非SQLite数据库，跳过完整性检查")


def show_database_stats(session):
    """显示数据库统计信息"""
    logger.info("数据库统计信息:")
    
    # 获取表记录计数
    user_count = session.query(User).count()
    threat_count = session.query(KnownThreat).count()
    scan_count = session.query(ScanRecord).count()
    
    logger.info(f"用户记录数: {user_count}")
    logger.info(f"已知威胁数: {threat_count}")
    logger.info(f"扫描记录数: {scan_count}")
    
    # 获取数据库大小 (SQLite)
    if settings.DATABASE_URL.startswith("sqlite"):
        db_path = settings.DATABASE_URL.replace("sqlite:///", "")
        if db_path.startswith("./"):
            db_path = db_path[2:]
        
        try:
            size = os.path.getsize(db_path)
            logger.info(f"数据库文件大小: {size / (1024*1024):.2f} MB")
        except OSError:
            logger.warning(f"无法读取数据库文件大小: {db_path}")
    
    # 扫描记录按月份分组统计
    monthly_stats = session.execute(text("""
        SELECT 
            strftime('%Y-%m', scan_date) as month, 
            COUNT(*) as count 
        FROM 
            scan_records 
        GROUP BY 
            strftime('%Y-%m', scan_date) 
        ORDER BY 
            month DESC
        LIMIT 6
    """)).fetchall()
    
    logger.info("最近6个月扫描记录统计:")
    for month, count in monthly_stats:
        logger.info(f"  {month}: {count} 条记录")


def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description="数据库优化工具")
    
    parser.add_argument("--clean-days", type=int, default=30,
                      help="清理指定天数前的扫描记录 (默认: 30天)")
    
    parser.add_argument("--vacuum", action="store_true",
                      help="执行VACUUM操作压缩数据库")
    
    parser.add_argument("--analyze", action="store_true",
                      help="分析表并更新统计信息")
    
    parser.add_argument("--rebuild-index", action="store_true",
                      help="重建数据库索引")
    
    parser.add_argument("--optimize-settings", action="store_true",
                      help="优化数据库设置")
    
    parser.add_argument("--check-integrity", action="store_true",
                      help="检查数据库完整性")
    
    parser.add_argument("--stats", action="store_true",
                      help="显示数据库统计信息")
    
    parser.add_argument("--all", action="store_true",
                      help="执行所有优化操作")
    
    return parser.parse_args()


def main():
    """主函数"""
    args = parse_args()
    logger.info("数据库优化工具启动")
    
    try:
        session = SessionLocal()
        
        if args.stats or args.all:
            show_database_stats(session)
        
        if args.clean_days or args.all:
            days = args.clean_days if not args.all else 30
            clean_old_records(session, days_old=days)
        
        if args.check_integrity or args.all:
            check_database_integrity(session)
        
        if args.rebuild_index or args.all:
            rebuild_indexes(session)
        
        if args.analyze or args.all:
            analyze_tables(session)
        
        if args.optimize_settings or args.all:
            optimize_database_settings(session)
        
        if args.vacuum or args.all:
            vacuum_database(session)
        
        # 最后再显示一次统计信息
        if args.all:
            logger.info("优化后数据库统计:")
            show_database_stats(session)
        
        logger.info("数据库优化完成")
    
    except Exception as e:
        logger.error(f"优化过程中发生错误: {e}", exc_info=True)
        return 1
    finally:
        session.close()
    
    return 0


if __name__ == "__main__":
    sys.exit(main()) 