# 算法模块文档

本文档详细介绍基于UPSI的恶意文件检测系统中的算法实现和工作原理。

## 架构概述

算法模块是系统的核心，实现了基于PSI（私有集合交集）的隐私保护恶意文件检测机制。该模块由三个主要部分组成：PSI协议实现、特征提取和机器学习增强。

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

## PSI协议实现

### 私有集合交集概述

PSI（Private Set Intersection）是一种密码学协议，允许两方在不泄露各自集合内容的情况下计算集合交集。在恶意文件检测场景中：

- **客户端**：持有待检测文件的特征集合
- **服务器**：持有已知恶意软件特征数据库
- **目标**：确定客户端文件特征是否与服务器恶意软件特征匹配，而无需完全泄露双方数据

### UPSI（非平衡PSI）

系统实现了UPSI（Unbalanced PSI）协议，特别适用于服务器集合远大于客户端集合的场景：

- **特点**：针对集合大小差异显著的情况进行优化
- **优势**：减少通信复杂度和计算开销
- **安全假设**：基于半诚实模型（semi-honest model）

### 混淆电路实现

`garbled_circuit.py`实现了混淆电路技术：

- **功能**：允许双方安全计算布尔电路
- **实现细节**：
  - 使用AES进行逻辑门混淆
  - 支持AND、OR、XOR等基本逻辑操作
  - 实现电路生成和评估功能

### 不经意传输

`oblivious_transfer.py`实现了OT（Oblivious Transfer）协议：

- **功能**：允许接收方从发送方选择获取信息，而不泄露选择内容
- **实现**：
  - 1-out-of-2 OT基本协议
  - 基于椭圆曲线密码学
  - 支持批量OT优化

### 优化技术

为提高PSI性能，实现了多种优化技术：

- **Bloom过滤器**：预处理减少不必要的计算
- **哈希桶分区**：将元素分散到多个桶中降低复杂度
- **批量处理**：并行处理多个元素
- **压缩技术**：减少通信开销

## 特征提取

### 特征类型

系统支持从PE文件（Windows可执行文件）中提取多种特征：

#### 1. 字节直方图

`byte_histogram.py`实现了文件字节频率统计：

- **方法**：统计文件中每个字节值（0-255）的出现频率
- **用途**：捕获文件的整体字节分布特征
- **优势**：对文件格式修改有一定鲁棒性

```python
def extract(file_path):
    """提取文件的字节直方图特征"""
    histogram = [0] * 256
    with open(file_path, 'rb') as f:
        byte = f.read(1)
        while byte:
            histogram[ord(byte)] += 1
            byte = f.read(1)
    return histogram
```

#### 2. 熵特征

`entropy.py`实现了熵计算，用于捕获文件的随机性和复杂度：

- **整体熵**：整个文件的香农熵
- **分段熵**：文件不同部分的熵值分布
- **熵变化率**：相邻区块的熵值变化

```python
def calculate(file_path, block_size=256):
    """计算文件的熵特征"""
    with open(file_path, 'rb') as f:
        data = f.read()
    
    # 计算整体熵
    overall_entropy = shannon_entropy(data)
    
    # 计算分段熵
    block_entropies = []
    for i in range(0, len(data), block_size):
        block = data[i:i+block_size]
        if len(block) >= block_size // 2:  # 忽略过小的块
            block_entropies.append(shannon_entropy(block))
    
    return {
        'overall_entropy': overall_entropy,
        'block_entropies': block_entropies,
        'entropy_stats': {
            'mean': statistics.mean(block_entropies) if block_entropies else 0,
            'std_dev': statistics.stdev(block_entropies) if len(block_entropies) > 1 else 0,
            'max': max(block_entropies) if block_entropies else 0,
            'min': min(block_entropies) if block_entropies else 0
        }
    }
```

#### 3. PE头部特征

`pe_header.py`专门提取PE文件结构信息：

- **文件头信息**：时间戳、特征等
- **节表信息**：节的名称、大小、权限等
- **导入/导出表**：DLL和API函数引用
- **资源信息**：嵌入的资源类型和大小

#### 4. API调用序列

通过静态分析提取可能的API调用序列：

- **敏感API**：与系统、网络、文件操作相关的API
- **调用模式**：识别常见的恶意行为模式
- **频率分析**：特定API的调用频率

## 机器学习增强

系统使用机器学习模型提高检测准确率，同时保护隐私：

### 随机森林模型

`rf_model.py`实现了基于随机森林的分类：

- **特点**：高准确率，对过拟合有较好抵抗力
- **应用**：结合PSI结果进行二次判断
- **隐私保护**：仅使用PSI安全计算的特征

### XGBoost模型

`xgboost_model.py`提供更高级的梯度提升实现：

- **优势**：通常比随机森林有更高的准确率
- **调优**：针对恶意软件检测场景定制参数
- **轻量版**：支持资源受限环境的部署

## 隐私保护级别

系统支持三种隐私保护级别，用户可根据需求选择：

### 低级别保护

- **特点**：优先考虑性能，提供基本隐私保护
- **实现**：简化的PSI协议，减少计算复杂度
- **适用场景**：大批量文件快速检测

### 中级别保护

- **特点**：平衡性能和隐私保护
- **实现**：标准PSI协议，适当优化
- **适用场景**：常规文件检测

### 高级别保护

- **特点**：最强隐私保护，性能次之
- **实现**：增强的PSI协议，额外安全措施
- **适用场景**：高敏感度文件检测

## 与后端集成

算法模块通过`backend/psi_wrapper.py`与后端集成：

```python
from backend.psi_wrapper import PSIWrapper

# 初始化PSI包装器
psi = PSIWrapper(privacy_level='medium')

# 执行隐私保护的检测
result = psi.detect_malware(file_path)

# 获取详细结果
details = result.get_details()
```

## 性能考量

### 计算复杂度

- **时间复杂度**：各隐私级别从O(n log n)到O(n²)
- **空间复杂度**：O(n)，n为特征集合大小
- **通信复杂度**：随隐私级别从O(n)到O(n log n)

### 优化策略

- **多线程处理**：并行计算提高效率
- **预计算**：服务器端进行特征预处理
- **增量更新**：支持恶意软件数据库增量更新

## 安全性分析

### 安全假设

- **半诚实模型**：假设参与方会遵循协议但尝试推断额外信息
- **计算安全**：基于标准密码学假设（如离散对数问题的困难性）

### 潜在攻击与防御

- **相关攻击**：通过反复查询推断信息
  - **防御**：实施查询限制和速率控制
- **侧信道攻击**：通过时间等侧信道推断信息
  - **防御**：实现恒定时间操作
- **恶意输入**：尝试通过特制输入破坏协议
  - **防御**：输入验证和异常处理

## 测试与验证

- **单元测试**：`tests/`目录下的各组件测试
- **集成测试**：测试算法模块与后端的集成
- **性能基准**：测量不同隐私级别的性能
- **准确性验证**：使用已知样本集验证检测准确率 