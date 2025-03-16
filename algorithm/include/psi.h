#ifndef PSI_H
#define PSI_H

#include <vector>
#include <string>
#include <cstdint>

// Export symbols for shared library
#if defined(_WIN32) || defined(_WIN64)
    #define PSI_EXPORT __declspec(dllexport)
#else
    #define PSI_EXPORT __attribute__((visibility("default")))
#endif

namespace psi {

/**
 * @brief Result structure for PSI operations
 */
struct PSI_EXPORT PSIResult {
    bool success;                  // Whether the operation was successful
    std::vector<std::string> intersection; // The intersection of the two sets
    std::string proof;             // Zero-knowledge proof (if applicable)
    std::string error_message;     // Error message (if any)
};

/**
 * @brief Preprocess the server's set for PSI
 * 
 * This function preprocesses the server's set (malware signatures) for use in the PSI protocol.
 * The preprocessing can be done offline and the result can be reused for multiple queries.
 * 
 * @param server_set The server's set of items (malware signatures)
 * @param key The server's secret key
 * @return PSIResult with preprocessed data in the proof field
 */
PSI_EXPORT PSIResult server_preprocess(
    const std::vector<std::string>& server_set,
    const std::string& key
);

/**
 * @brief Execute the PSI protocol on the client side
 * 
 * @param client_set The client's set of items (file hashes)
 * @param server_preprocessed The preprocessed server data
 * @return PSIResult with the intersection and proof
 */
PSI_EXPORT PSIResult client_query(
    const std::vector<std::string>& client_set,
    const std::string& server_preprocessed
);

/**
 * @brief Execute the PSI protocol on the server side
 * 
 * @param client_query The client's query
 * @param server_set The server's set of items (malware signatures)
 * @param key The server's secret key
 * @return PSIResult with the intersection and proof
 */
PSI_EXPORT PSIResult server_respond(
    const std::string& client_query,
    const std::vector<std::string>& server_set,
    const std::string& key
);

/**
 * @brief Verify the zero-knowledge proof
 * 
 * @param intersection The claimed intersection
 * @param proof The zero-knowledge proof
 * @param client_set The client's set of items
 * @param server_public_key The server's public key
 * @return true if the proof is valid, false otherwise
 */
PSI_EXPORT bool verify_proof(
    const std::vector<std::string>& intersection,
    const std::string& proof,
    const std::vector<std::string>& client_set,
    const std::string& server_public_key
);

} // namespace psi

// C API for interoperability with other languages
extern "C" {

/**
 * @brief C API for server preprocessing
 * 
 * @param server_set Array of server items
 * @param server_set_size Number of server items
 * @param key Server secret key
 * @param key_size Length of the key
 * @param output Output buffer for preprocessed data
 * @param output_size Size of the output buffer
 * @return 1 on success, 0 on failure
 */
PSI_EXPORT int psi_server_preprocess(
    const char** server_set,
    size_t server_set_size,
    const char* key,
    size_t key_size,
    char* output,
    size_t* output_size
);

/**
 * @brief C API for client query
 * 
 * @param client_set Array of client items
 * @param client_set_size Number of client items
 * @param server_preprocessed Preprocessed server data
 * @param server_preprocessed_size Size of preprocessed data
 * @param intersection Output buffer for intersection
 * @param intersection_size Size of the intersection buffer
 * @param proof Output buffer for proof
 * @param proof_size Size of the proof buffer
 * @return 1 on success, 0 on failure
 */
PSI_EXPORT int psi_client_query(
    const char** client_set,
    size_t client_set_size,
    const char* server_preprocessed,
    size_t server_preprocessed_size,
    char** intersection,
    size_t* intersection_size,
    char* proof,
    size_t* proof_size
);

/**
 * @brief C API for server response
 * 
 * @param client_query Client query data
 * @param client_query_size Size of client query
 * @param server_set Array of server items
 * @param server_set_size Number of server items
 * @param key Server secret key
 * @param key_size Length of the key
 * @param intersection Output buffer for intersection
 * @param intersection_size Size of the intersection buffer
 * @param proof Output buffer for proof
 * @param proof_size Size of the proof buffer
 * @return 1 on success, 0 on failure
 */
PSI_EXPORT int psi_server_respond(
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
);

/**
 * @brief C API for proof verification
 * 
 * @param intersection Array of intersection items
 * @param intersection_size Number of intersection items
 * @param proof Proof data
 * @param proof_size Size of proof data
 * @param client_set Array of client items
 * @param client_set_size Number of client items
 * @param server_public_key Server public key
 * @param server_public_key_size Size of server public key
 * @return 1 if proof is valid, 0 otherwise
 */
PSI_EXPORT int psi_verify_proof(
    const char** intersection,
    size_t intersection_size,
    const char* proof,
    size_t proof_size,
    const char** client_set,
    size_t client_set_size,
    const char* server_public_key,
    size_t server_public_key_size
);

/**
 * @brief Free memory allocated by the library
 * 
 * @param ptr Pointer to memory to free
 */
PSI_EXPORT void psi_free(void* ptr);

} // extern "C"

#endif // PSI_H 