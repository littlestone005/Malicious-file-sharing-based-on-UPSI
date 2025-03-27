# 开发/测试工具

本目录包含仅用于开发和测试的工具。**请勿在生产环境中使用这些工具！**

## 目录结构

```
tools/
├── db/                 # 数据库相关工具
│   ├── view_db.py      # 数据库查看工具
│   ├── create_test_db.py  # 测试数据库创建工具
│   └── test_db.db      # 测试数据库
└── sandbox/            # 测试沙盒和实验脚本
```

## 数据库工具

### view_db.py

数据库查看工具，用于显示数据库的表结构和内容。

使用方法：
```bash
python backend/tools/db/view_db.py [--db 数据库路径]
```

选项：
- `--db 数据库路径`: 指定数据库文件路径（默认为 malware_detection.db）
- `--test-db`: 使用测试数据库（test_db.db）
- `--table 表名`: 仅显示指定表的信息
- `--limit 行数`: 限制显示的行数（默认10行）
- `--structure-only`: 只显示表结构，不显示数据
- `--summary`: 只显示数据库摘要信息
- `--query "SQL查询"`: 执行自定义SQL查询

### create_test_db.py

测试数据库创建工具，用于创建和填充测试数据。

使用方法：
```bash
python backend/tools/db/create_test_db.py
```

## 沙盒工具

沙盒目录包含实验性质的脚本和工具，用于测试新功能或概念验证。这些脚本不应被依赖于生产代码。 