"""add performance indexes

Revision ID: 1683a1b4c2d5
Revises: 
Create Date: 2023-10-25 14:35:12.345678

此迁移文件创建了数据库性能优化索引
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1683a1b4c2d5'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """升级数据库，添加性能相关索引"""
    # 为用户表添加索引
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # 为已知威胁表添加索引
    op.create_index(op.f('ix_known_threats_hash'), 'known_threats', ['hash'], unique=True)
    op.create_index(op.f('ix_known_threats_threat_type'), 'known_threats', ['threat_type'], unique=False)
    op.create_index(op.f('ix_known_threats_severity'), 'known_threats', ['severity'], unique=False)
    
    # 为扫描记录表添加索引
    op.create_index(op.f('ix_scan_records_user_id'), 'scan_records', ['user_id'], unique=False)
    op.create_index(op.f('ix_scan_records_file_hash'), 'scan_records', ['file_hash'], unique=False)
    op.create_index(op.f('ix_scan_records_scan_date'), 'scan_records', ['scan_date'], unique=False)
    op.create_index(op.f('ix_scan_records_status'), 'scan_records', ['status'], unique=False)
    
    # 创建复合索引，适用于特定查询模式
    op.create_index(op.f('ix_scan_records_user_id_scan_date'), 'scan_records', 
                   ['user_id', 'scan_date'], unique=False)


def downgrade():
    """回滚数据库，删除添加的索引"""
    # 删除扫描记录表复合索引
    op.drop_index(op.f('ix_scan_records_user_id_scan_date'), table_name='scan_records')
    
    # 删除扫描记录表普通索引
    op.drop_index(op.f('ix_scan_records_status'), table_name='scan_records')
    op.drop_index(op.f('ix_scan_records_scan_date'), table_name='scan_records')
    op.drop_index(op.f('ix_scan_records_file_hash'), table_name='scan_records')
    op.drop_index(op.f('ix_scan_records_user_id'), table_name='scan_records')
    
    # 删除已知威胁表索引
    op.drop_index(op.f('ix_known_threats_severity'), table_name='known_threats')
    op.drop_index(op.f('ix_known_threats_threat_type'), table_name='known_threats')
    op.drop_index(op.f('ix_known_threats_hash'), table_name='known_threats')
    
    # 删除用户表索引
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_username'), table_name='users') 