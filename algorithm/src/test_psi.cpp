#include "psi.h"
#include <iostream>
#include <vector>

int main() {
    // 服务器端特征库
    std::vector<std::string> server_set = {
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
        "3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278",
        "8c3d4a0f94b252c7859a96fd69a5711b5a4e599afc857c8b4f414b3fb6a095b9",
        "2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3"
    };
    
    // 客户端文件哈希
    std::vector<std::string> client_set = {
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // 应该匹配
        "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6", // 不匹配
        "3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278" // 应该匹配
    };
    
    // 服务器密钥
    std::string server_key = "server_secret_key";
    
    std::cout << "=== PSI测试程序 ===" << std::endl;
    
    // 服务器预处理
    std::cout << "1. 服务器预处理集合..." << std::endl;
    psi::PSIResult preprocess_result = psi::server_preprocess(server_set, server_key);
    if (!preprocess_result.success) {
        std::cerr << "预处理失败: " << preprocess_result.error_message << std::endl;
        return 1;
    }
    
    // 客户端查询
    std::cout << "2. 客户端执行PSI协议..." << std::endl;
    psi::PSIResult query_result = psi::client_query(client_set, preprocess_result.proof);
    if (!query_result.success) {
        std::cerr << "查询失败: " << query_result.error_message << std::endl;
        return 1;
    }
    
    // 服务器响应
    std::cout << "3. 服务器响应查询..." << std::endl;
    psi::PSIResult respond_result = psi::server_respond("client_query_data", server_set, server_key);
    if (!respond_result.success) {
        std::cerr << "响应失败: " << respond_result.error_message << std::endl;
        return 1;
    }
    
    // 输出结果
    std::cout << "4. 查询结果: " << std::endl;
    std::cout << "   找到 " << query_result.intersection.size() << " 个匹配项:" << std::endl;
    for (const auto& item : query_result.intersection) {
        std::cout << "   - " << item << std::endl;
    }
    
    // 验证证明
    bool proof_valid = psi::verify_proof(
        query_result.intersection,
        query_result.proof,
        client_set,
        "server_public_key"
    );
    
    std::cout << "5. 证明验证: " << (proof_valid ? "有效" : "无效") << std::endl;
    
    return 0;
} 