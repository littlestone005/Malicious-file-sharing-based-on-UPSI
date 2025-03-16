#include "psi.h"
#include <openssl/sha.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <cstring>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <unordered_set>
#include <memory>

namespace psi {

// Helper function to compute SHA-256 hash
std::string sha256(const std::string& input) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, input.c_str(), input.length());
    SHA256_Final(hash, &sha256);
    
    std::stringstream ss;
    for(int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }
    return ss.str();
}

// Helper function to simulate OPRF (Oblivious Pseudo-Random Function)
// In a real implementation, this would use a proper OPRF protocol
std::string oprf(const std::string& input, const std::string& key) {
    return sha256(input + key);
}

// Server preprocessing function
PSIResult server_preprocess(
    const std::vector<std::string>& server_set,
    const std::string& key
) {
    PSIResult result;
    result.success = true;
    
    try {
        // In a real implementation, this would preprocess the server's set
        // using the OPRF protocol and other optimizations
        
        // For this demo, we'll just apply the OPRF to each item
        std::stringstream ss;
        for (const auto& item : server_set) {
            ss << oprf(item, key) << ";";
        }
        
        result.proof = ss.str();
    } catch (const std::exception& e) {
        result.success = false;
        result.error_message = e.what();
    }
    
    return result;
}

// Client query function
PSIResult client_query(
    const std::vector<std::string>& client_set,
    const std::string& server_preprocessed
) {
    PSIResult result;
    result.success = true;
    
    try {
        // In a real implementation, this would execute the PSI protocol
        // For this demo, we'll just simulate it
        
        // Parse the server's preprocessed data
        std::unordered_set<std::string> server_hashes;
        std::stringstream ss(server_preprocessed);
        std::string hash;
        while (std::getline(ss, hash, ';')) {
            if (!hash.empty()) {
                server_hashes.insert(hash);
            }
        }
        
        // Generate a random key for the client
        unsigned char client_key[32];
        RAND_bytes(client_key, sizeof(client_key));
        std::string client_key_str(reinterpret_cast<char*>(client_key), sizeof(client_key));
        
        // Apply OPRF to client items and check for intersection
        for (const auto& item : client_set) {
            std::string client_hash = oprf(item, client_key_str);
            
            // In a real implementation, this would involve cryptographic operations
            // For this demo, we'll just check if the hash is in the server's set
            // This is not how PSI actually works, but it simulates the result
            
            // Simulate finding matches (every third item)
            if (std::hash<std::string>{}(item) % 3 == 0) {
                result.intersection.push_back(item);
            }
        }
        
        // Generate a mock proof
        result.proof = "mock_zkp_proof";
    } catch (const std::exception& e) {
        result.success = false;
        result.error_message = e.what();
    }
    
    return result;
}

// Server respond function
PSIResult server_respond(
    const std::string& client_query,
    const std::vector<std::string>& server_set,
    const std::string& key
) {
    PSIResult result;
    result.success = true;
    
    try {
        // In a real implementation, this would process the client's query
        // and execute the PSI protocol on the server side
        
        // For this demo, we'll just simulate it
        
        // Simulate finding matches (every third item in server_set)
        for (size_t i = 0; i < server_set.size(); i++) {
            if (i % 3 == 0) {
                result.intersection.push_back(server_set[i]);
            }
        }
        
        // Generate a mock proof
        result.proof = "mock_zkp_proof_from_server";
    } catch (const std::exception& e) {
        result.success = false;
        result.error_message = e.what();
    }
    
    return result;
}

// Verify proof function
bool verify_proof(
    const std::vector<std::string>& intersection,
    const std::string& proof,
    const std::vector<std::string>& client_set,
    const std::string& server_public_key
) {
    // In a real implementation, this would verify the zero-knowledge proof
    // For this demo, we'll just return true
    return true;
}

} // namespace psi

// C API implementations
extern "C" {

int psi_server_preprocess(
    const char** server_set,
    size_t server_set_size,
    const char* key,
    size_t key_size,
    char* output,
    size_t* output_size
) {
    try {
        // Convert C arrays to C++ vectors
        std::vector<std::string> server_set_vec;
        for (size_t i = 0; i < server_set_size; i++) {
            server_set_vec.push_back(server_set[i]);
        }
        
        std::string key_str(key, key_size);
        
        // Call the C++ function
        psi::PSIResult result = psi::server_preprocess(server_set_vec, key_str);
        
        if (!result.success) {
            return 0;
        }
        
        // Check if the output buffer is large enough
        if (*output_size < result.proof.size() + 1) {
            *output_size = result.proof.size() + 1;
            return 0;
        }
        
        // Copy the result to the output buffer
        std::memcpy(output, result.proof.c_str(), result.proof.size());
        output[result.proof.size()] = '\0';
        *output_size = result.proof.size();
        
        return 1;
    } catch (...) {
        return 0;
    }
}

int psi_client_query(
    const char** client_set,
    size_t client_set_size,
    const char* server_preprocessed,
    size_t server_preprocessed_size,
    char** intersection,
    size_t* intersection_size,
    char* proof,
    size_t* proof_size
) {
    try {
        // Convert C arrays to C++ vectors
        std::vector<std::string> client_set_vec;
        for (size_t i = 0; i < client_set_size; i++) {
            client_set_vec.push_back(client_set[i]);
        }
        
        std::string server_preprocessed_str(server_preprocessed, server_preprocessed_size);
        
        // Call the C++ function
        psi::PSIResult result = psi::client_query(client_set_vec, server_preprocessed_str);
        
        if (!result.success) {
            return 0;
        }
        
        // Allocate memory for the intersection
        size_t total_size = 0;
        for (const auto& item : result.intersection) {
            total_size += item.size() + 1; // +1 for null terminator
        }
        
        *intersection = static_cast<char*>(malloc(total_size));
        if (!*intersection) {
            return 0;
        }
        
        // Copy the intersection items
        char* ptr = *intersection;
        for (const auto& item : result.intersection) {
            std::memcpy(ptr, item.c_str(), item.size() + 1);
            ptr += item.size() + 1;
        }
        
        *intersection_size = result.intersection.size();
        
        // Copy the proof
        if (*proof_size < result.proof.size() + 1) {
            *proof_size = result.proof.size() + 1;
            return 0;
        }
        
        std::memcpy(proof, result.proof.c_str(), result.proof.size());
        proof[result.proof.size()] = '\0';
        *proof_size = result.proof.size();
        
        return 1;
    } catch (...) {
        return 0;
    }
}

int psi_server_respond(
    const char* client_query,
    size_t client_query_size,
    const char** server_set,
    size_t server_set_size,
    const char* key,
    size_t key_size,
    char** intersection,
    size_t* intersection_size,
    char* proof,
    size_t* proof_size
) {
    try {
        // Convert C arrays to C++ vectors
        std::string client_query_str(client_query, client_query_size);
        
        std::vector<std::string> server_set_vec;
        for (size_t i = 0; i < server_set_size; i++) {
            server_set_vec.push_back(server_set[i]);
        }
        
        std::string key_str(key, key_size);
        
        // Call the C++ function
        psi::PSIResult result = psi::server_respond(client_query_str, server_set_vec, key_str);
        
        if (!result.success) {
            return 0;
        }
        
        // Allocate memory for the intersection
        size_t total_size = 0;
        for (const auto& item : result.intersection) {
            total_size += item.size() + 1; // +1 for null terminator
        }
        
        *intersection = static_cast<char*>(malloc(total_size));
        if (!*intersection) {
            return 0;
        }
        
        // Copy the intersection items
        char* ptr = *intersection;
        for (const auto& item : result.intersection) {
            std::memcpy(ptr, item.c_str(), item.size() + 1);
            ptr += item.size() + 1;
        }
        
        *intersection_size = result.intersection.size();
        
        // Copy the proof
        if (*proof_size < result.proof.size() + 1) {
            *proof_size = result.proof.size() + 1;
            return 0;
        }
        
        std::memcpy(proof, result.proof.c_str(), result.proof.size());
        proof[result.proof.size()] = '\0';
        *proof_size = result.proof.size();
        
        return 1;
    } catch (...) {
        return 0;
    }
}

int psi_verify_proof(
    const char** intersection,
    size_t intersection_size,
    const char* proof,
    size_t proof_size,
    const char** client_set,
    size_t client_set_size,
    const char* server_public_key,
    size_t server_public_key_size
) {
    try {
        // Convert C arrays to C++ vectors
        std::vector<std::string> intersection_vec;
        for (size_t i = 0; i < intersection_size; i++) {
            intersection_vec.push_back(intersection[i]);
        }
        
        std::string proof_str(proof, proof_size);
        
        std::vector<std::string> client_set_vec;
        for (size_t i = 0; i < client_set_size; i++) {
            client_set_vec.push_back(client_set[i]);
        }
        
        std::string server_public_key_str(server_public_key, server_public_key_size);
        
        // Call the C++ function
        bool result = psi::verify_proof(intersection_vec, proof_str, client_set_vec, server_public_key_str);
        
        return result ? 1 : 0;
    } catch (...) {
        return 0;
    }
}

void psi_free(void* ptr) {
    free(ptr);
}

} // extern "C" 