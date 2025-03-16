# PSI Algorithm Module

This module implements the Private Set Intersection (PSI) protocol for privacy-preserving malware detection.

## Overview

The PSI algorithm allows two parties to find the intersection of their sets without revealing any other elements. In our case:

- The server has a large set of malware signatures
- The client has a small set of file hashes
- We want to find which client files match known malware signatures without revealing non-malicious files

## Implementation Details

This module is implemented in C++ for performance reasons, especially for the cryptographic operations. The main components are:

1. **OPRF (Oblivious Pseudo-Random Function)** implementation
2. **Non-balanced PSI protocol** optimized for the case where the server set is much larger
3. **Zero-knowledge proof** generation and verification

## Building

### Prerequisites

- C++17 compatible compiler
- OpenSSL 1.1.1 or later
- CMake 3.15 or later

### Build Instructions

```bash
mkdir build
cd build
cmake ..
make
```

## Integration with Backend

The module exposes a C API that is called by the Python backend using ctypes. The main functions are:

- `psi_server_preprocess`: Preprocess the server's set (malware signatures)
- `psi_client_query`: Execute the PSI protocol on the client side
- `psi_server_respond`: Execute the PSI protocol on the server side
- `psi_verify_proof`: Verify the zero-knowledge proof

## Performance Considerations

The implementation is optimized for:

- Fast preprocessing of the server's set (can be done offline)
- Minimal communication overhead
- Efficient client-side operations (important for browser-based clients)

## Security Guarantees

- **Privacy**: Non-malicious files remain completely private
- **Correctness**: Zero-knowledge proofs ensure the server behaves correctly
- **Security**: Based on established cryptographic primitives with formal security proofs 