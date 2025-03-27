# 算法模块

本模块包含基于UPSI（不平衡私有集合交集）的恶意文件检测算法实现。

## 目录结构

```
algorithm/
├── psi/                  # PSI算法核心实现
│   ├── __init__.py       # 初始化文件
│   ├── garbled_circuit.py # 混淆电路实现
│   ├── oblivious_transfer.py # 不经意传输实现
│   └── utils.py          # 工具函数
├── features/             # 特征提取
│   ├── __init__.py       # 初始化文件
│   ├── byte_histogram.py # 字节直方图特征
│   ├── entropy.py        # 熵特征计算
│   └── pe_header.py      # PE头部特征
├── ml_models/           # 机器学习模型(使用PSI保护隐私)
│   ├── __init__.py      # 初始化文件
│   ├── rf_model.py      # 随机森林模型
│   └── xgboost_model.py # XGBoost模型
├── scripts/             # 辅助脚本
│   └── extract_features.py # 批量特征提取
├── tests/              # 测试文件
│   ├── test_psi.py      # PSI测试
│   └── test_features.py # 特征提取测试
└── CMakeLists.txt      # 构建配置
```

## 私有集合交集(PSI)算法

本项目使用基于半诚实模型的双方计算PSI协议，实现了隐私保护的恶意文件检测。

### PSI概述

PSI(Private Set Intersection)允许两方在不泄露各自集合元素的前提下计算集合交集。在恶意文件检测场景中：
- 客户端持有文件特征集合
- 服务器持有已知恶意软件特征数据库
- 双方共同计算文件特征与恶意软件特征的交集

### 实现细节

1. **混淆电路(Garbled Circuit)**：
   - 使用混淆电路技术构建安全计算环境
   - 实现了基于AES的混淆门
   - 支持AND, OR, XOR等基本逻辑运算

2. **不经意传输(Oblivious Transfer)**：
   - 实现1-out-of-2 OT协议
   - 基于椭圆曲线密码学
   - 支持并行批处理以提高效率

3. **优化技术**：
   - Bloom过滤器预处理
   - 批量处理提高效率
   - 哈希桶分区减少计算复杂度

## 特征提取

支持从PE文件(Windows可执行文件)中提取的特征包括：

1. **字节直方图**：统计文件中每个字节值(0-255)出现的频率
2. **熵特征**：计算文件的熵值、分段熵和熵变化率
3. **PE头部特征**：提取PE文件头、节表、导入/导出表等结构化信息
4. **API调用序列**：提取可能的API调用序列和敏感API使用情况

## 数据库集成

算法模块与数据库集成，主要关注以下方面：

1. **特征存储**：
   - 恶意软件特征以哈希值形式存储在`known_threats`表中
   - 支持批量插入和更新
   - 使用索引优化查询性能

2. **检索优化**：
   - 使用索引优化特征检索
   - 针对PSI算法优化的查询结构
   - 使用连接池管理数据库连接

3. **隐私保护**：
   - 用户上传的文件特征不直接存储在数据库中
   - 仅存储计算结果和隐私保护的元数据
   - 支持匿名模式扫描不留下记录

## 与后端集成

算法模块通过`backend/psi_wrapper.py`与后端集成：

```python
from backend.psi_wrapper import PSIWrapper

# 初始化PSI包装器
psi = PSIWrapper()

# 执行隐私保护的检测
result = psi.detect_malware(file_hash, privacy_level='high')
```

## 使用方法

### 特征提取

```python
from algorithm.features import byte_histogram, entropy, pe_header

# 提取字节直方图
hist = byte_histogram.extract(file_path)

# 计算熵
ent = entropy.calculate(file_path)

# 提取PE头部特征
pe_features = pe_header.extract(file_path)
```

### PSI检测

```python
from algorithm.psi import PSIDetector

# 初始化检测器
detector = PSIDetector()

# 执行PSI协议
result = detector.detect(file_features, privacy_level='high')
```

## 性能与优化

- **时间复杂度**：O(n log n)，n为特征集合大小
- **空间复杂度**：O(n)
- **通信复杂度**：O(n)

系统支持三种隐私级别（低、中、高），提供不同程度的隐私保护和性能平衡。

## 测试

测试脚本位于`tests/`目录，使用pytest运行：

```bash
# 运行所有测试
pytest

# 运行特定测试
pytest tests/test_psi.py
``` 