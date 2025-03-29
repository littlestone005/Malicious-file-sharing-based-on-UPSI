# 数据库清理与重组

## 概述

为了简化项目结构，消除冗余数据库文件并确保数据一致性，进行了以下重组工作：

1. 将数据库模块从 `backend/database` 移动到 `backend/db`
2. 清理根目录中的冗余数据库文件
3. 将所有数据库文件集中存储在 `data` 目录中
4. 修复相关引用和导入语句
5. 确保所有文件上传存储在 `data/uploads` 目录而不是 `backend/uploads`

## 详细变更

### 目录结构变更

- 移除 `backend/database` 目录
- 移除 `backend/uploads` 目录
- 移除 `backend/logs` 目录
- 创建 `backend/db` 目录
- 确保 `data/uploads` 目录及其子目录存在
- 确保 `data/logs` 目录存在

### 文件变更

1. 创建 `backend/db/__init__.py` 和 `backend/db/session.py` 文件
2. 更新所有导入语句，将 `backend.database` 替换为 `backend.db`
3. 修改 `backend/main.py` 文件，改用 `tools/init_db.py` 进行数据库初始化
4. 修改 `tools/init_db.py` 文件，更新导入语句
5. 更新 `backend/core/config.py` 文件，修改上传和日志目录路径

### 数据库文件处理

1. 删除根目录下的 `malware_detection.db`、`malware_detection.db-shm` 和 `malware_detection.db-wal` 文件
2. 保留 `data` 目录中的 `malware_detection.db` 文件
3. 使用 `tools/init_db.py --force` 重置数据库到初始状态

## 数据库初始化

现在数据库初始化的推荐方法：

```bash
python tools/init_db.py [--force]
```

参数：
- `--force`: 如果指定，将删除现有的数据库并重新创建

## 项目配置

数据库位置说明：
- 数据库文件位置：`data/malware_detection.db`
- 上传文件存储位置：`data/uploads/`
  - 临时文件：`data/uploads/temp/`
  - 扫描文件：`data/uploads/scans/`
- 日志文件存储位置：`data/logs/`

## 注意事项

1. 所有数据库相关代码现在引用 `backend.db` 模块
2. 数据库初始化通过 `tools/init_db.py` 进行
3. 所有上传和临时文件应存储在 `data/uploads` 目录中
4. 所有日志文件应存储在 `data/logs` 目录中
5. 确保 `backend/core/config.py` 中所有路径配置指向正确的目录 