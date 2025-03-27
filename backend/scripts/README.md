# 脚本工具

本目录包含用于维护、部署和管理系统的脚本工具。这些脚本可用于生产环境。

## 目录结构

```
scripts/
├── db/                  # 数据库相关脚本
│   └── optimize_db.py   # 数据库优化脚本
├── maintenance/         # 系统维护脚本
│   └── update_admin_password.py  # 更新管理员密码脚本
└── deployment/          # 部署相关脚本
```

## 数据库脚本

### optimize_db.py

数据库优化脚本，用于清理旧记录、重建索引、压缩数据库等操作。

使用方法：
```bash
python backend/scripts/db/optimize_db.py [选项]
```

选项：
- `--clean-days 天数`: 清理指定天数前的扫描记录（默认30天）
- `--vacuum`: 执行VACUUM操作压缩数据库
- `--analyze`: 分析表并更新统计信息
- `--rebuild-index`: 重建数据库索引
- `--optimize-settings`: 优化数据库设置
- `--check-integrity`: 检查数据库完整性
- `--stats`: 显示数据库统计信息
- `--all`: 执行所有优化操作

示例：
```bash
# 清理30天前的记录并执行VACUUM压缩
python backend/scripts/db/optimize_db.py --clean-days 30 --vacuum

# 重建索引并分析表
python backend/scripts/db/optimize_db.py --rebuild-index --analyze

# 执行所有优化
python backend/scripts/db/optimize_db.py --all
```

## 维护脚本

### update_admin_password.py

更新管理员用户密码的脚本。

使用方法：
```bash
python backend/scripts/maintenance/update_admin_password.py [用户名] [新密码]
```

如果不提供参数，脚本将交互式地请求输入。

## 定期任务

建议将以下脚本设置为定期执行的计划任务：

1. 每周一次数据库优化：
```bash
python backend/scripts/db/optimize_db.py --clean-days 30 --vacuum --analyze
```

2. 每月一次全面优化：
```bash
python backend/scripts/db/optimize_db.py --all
``` 