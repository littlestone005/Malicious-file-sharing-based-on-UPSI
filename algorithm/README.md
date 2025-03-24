# 基于UPSI的恶意文件检测系统 - 算法模块

C++实现的非平衡私有集合交集（UPSI）协议库，用于隐私保护恶意文件检测。

## 目录结构

```
algorithm/
├── src/              # 源代码目录
│   ├── psi/         # PSI协议实现
│   │   ├── server.cpp   # 服务端实现
│   │   └── client.cpp   # 客户端实现
│   └── utils/       # 工具函数
│       ├── hash.cpp     # 哈希函数
│       └── crypto.cpp   # 加密函数
├── include/          # 头文件
│   ├── psi/         # PSI协议头文件
│   └── utils/       # 工具头文件
└── CMakeLists.txt   # CMake构建配置
```

## 技术概述

本模块实现了非平衡私有集合交集（UPSI）协议，适用于服务器集合远大于客户端集合的场景：

- 使用不经意伪随机函数（OPRF）实现安全哈希
- 基于椭圆曲线密码（ECC）实现加密操作
- 支持批处理操作以提高性能
- 提供零知识证明用于结果验证

## 构建与安装

### 环境要求
- C++17兼容的编译器
- CMake 3.10+
- OpenSSL 1.1.1+

### 构建步骤

```bash
# 创建构建目录
mkdir build && cd build

# 配置
cmake ..

# 构建
make

# 安装（可选）
make install
```

## 使用方法

### 服务端预处理

```cpp
#include "psi/server.h"

// 初始化服务端
psi::Server server("server_key");

// 服务端数据预处理
std::vector<std::string> malware_signatures = {
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"
};
auto preprocessed_data = server.preprocess(malware_signatures);

// 存储预处理数据以便复用
server.save_preprocessed(preprocessed_data, "preprocessed.dat");
```

### 客户端交集计算

```cpp
#include "psi/client.h"

// 初始化客户端
psi::Client client;

// 客户端文件哈希
std::vector<std::string> file_hashes = {
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278"
};

// 计算交集
auto intersection = client.compute_intersection(file_hashes, server_preprocessed_data);

// 结果验证
bool is_valid = client.verify_proof(intersection, proof);
```

## Python绑定

本模块提供Python绑定，可以轻松集成到基于Python的应用中：

```python
from psi_wrapper import PSIWrapper

# 初始化PSI包装器
psi = PSIWrapper()

# 服务端预处理
preprocessed = psi.server_preprocess(malware_signatures, server_key)

# 客户端计算交集
malicious_hashes = psi.compute_intersection(client_hashes, preprocessed)
```

## 性能优化

- 服务端预处理模式提高了多次查询的效率
- 布隆过滤器用于大规模集合的快速排除
- 批处理模式优化多个哈希的处理

## 安全考量

- 使用安全密码学原语
- 随机数生成使用CSPRNG
- 防止侧信道攻击的时序一致性操作
- 零知识证明确保服务端诚实行为 