ceshi

# Privacy-Preserving Malware Detection System

A secure file scanning system that uses Private Set Intersection (PSI) protocols to detect malicious files while preserving user privacy.

## Features

- **Privacy-First Design**: Uses PSI protocol to check files against a malware database without revealing non-malicious files
- **Dual Mode**: Option to use traditional scanning or privacy-preserving scanning
- **Secure Architecture**: End-to-end encryption with zero-knowledge proofs
- **User-Friendly Interface**: Simple three-step process for file scanning

## Project Structure

- `frontend/`: React-based user interface
- `backend/`: FastAPI server with business logic
- `algorithm/`: C++ implementation of PSI protocol
- `database/`: Database schemas and initialization scripts

## How It Works

### Private Set Intersection (PSI)

PSI is a cryptographic protocol that allows two parties to compute the intersection of their sets without revealing any other elements. In our case:

1. The server has a set of malware signatures
2. The client has a set of file hashes
3. We want to find which client files match known malware signatures without revealing non-malicious files

### Privacy-Preserving Workflow

1. **Client-Side Hashing**: Files are hashed locally in the browser using SHA-256
2. **PSI Protocol**: The PSI protocol is executed between the client and server
3. **Result Verification**: Zero-knowledge proofs verify the server behaved correctly
4. **Secure Display**: Only malicious files are revealed to the server

## Getting Started

### Prerequisites

- Node.js 16+
- Python 3.9+
- Docker and Docker Compose
- C++ compiler (for algorithm module)

### Development Setup

1. Clone the repository
2. Start the backend services:
   ```
   cd backend
   docker-compose up -d
   ```
3. Start the frontend development server:
   ```
   cd frontend
   npm install
   npm run dev
   ```

## Architecture

The system consists of four main components:

1. **Frontend**: User interface for file upload and result display
2. **Backend**: Business logic and API endpoints
3. **Algorithm Module**: Implementation of PSI protocol
4. **Database**: Storage for malware signatures

### API Endpoints

- `POST /api/v1/detect`: Detect malware in the provided file hashes
  - Parameters:
    - `hashes`: Array of file hash objects
    - `use_psi`: Boolean flag to enable/disable PSI protocol

## Security Features

- Full HTTPS encryption
- API rate limiting
- Input validation
- mTLS authentication for service-to-service communication
- Zero-knowledge proofs for result verification

## Performance Considerations

- Server-side preprocessing of malware signatures
- Optimized PSI protocol for unbalanced sets
- Client-side caching of results

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
