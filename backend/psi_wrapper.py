import ctypes
import os
from typing import List, Tuple, Optional

class PSIWrapper:
    """
    Python wrapper for the PSI algorithm C++ library.
    """
    
    def __init__(self, lib_path: str = None):
        """
        Initialize the PSI wrapper.
        
        Args:
            lib_path: Path to the PSI library. If None, tries to find it in standard locations.
        """
        if lib_path is None:
            # Try to find the library in standard locations
            lib_names = [
                os.path.join(os.path.dirname(__file__), '..', 'algorithm', 'build', 'lib', 'libpsi_algorithm.so'),
                os.path.join(os.path.dirname(__file__), '..', 'algorithm', 'build', 'lib', 'psi_algorithm.dll'),
                '/usr/local/lib/libpsi_algorithm.so',
                '/usr/lib/libpsi_algorithm.so',
            ]
            
            for name in lib_names:
                if os.path.exists(name):
                    lib_path = name
                    break
        
        if lib_path is None:
            # For demo purposes, we'll simulate the PSI algorithm
            self.lib = None
            print("PSI library not found. Using simulated PSI algorithm.")
            return
        
        try:
            self.lib = ctypes.CDLL(lib_path)
            
            # Define function prototypes
            self.lib.psi_server_preprocess.argtypes = [
                ctypes.POINTER(ctypes.c_char_p),
                ctypes.c_size_t,
                ctypes.c_char_p,
                ctypes.c_size_t,
                ctypes.c_char_p,
                ctypes.POINTER(ctypes.c_size_t)
            ]
            self.lib.psi_server_preprocess.restype = ctypes.c_int
            
            self.lib.psi_client_query.argtypes = [
                ctypes.POINTER(ctypes.c_char_p),
                ctypes.c_size_t,
                ctypes.c_char_p,
                ctypes.c_size_t,
                ctypes.POINTER(ctypes.c_char_p),
                ctypes.POINTER(ctypes.c_size_t),
                ctypes.c_char_p,
                ctypes.POINTER(ctypes.c_size_t)
            ]
            self.lib.psi_client_query.restype = ctypes.c_int
            
            self.lib.psi_server_respond.argtypes = [
                ctypes.c_char_p,
                ctypes.c_size_t,
                ctypes.POINTER(ctypes.c_char_p),
                ctypes.c_size_t,
                ctypes.c_char_p,
                ctypes.c_size_t,
                ctypes.POINTER(ctypes.c_char_p),
                ctypes.POINTER(ctypes.c_size_t),
                ctypes.c_char_p,
                ctypes.POINTER(ctypes.c_size_t)
            ]
            self.lib.psi_server_respond.restype = ctypes.c_int
            
            self.lib.psi_verify_proof.argtypes = [
                ctypes.POINTER(ctypes.c_char_p),
                ctypes.c_size_t,
                ctypes.c_char_p,
                ctypes.c_size_t,
                ctypes.POINTER(ctypes.c_char_p),
                ctypes.c_size_t,
                ctypes.c_char_p,
                ctypes.c_size_t
            ]
            self.lib.psi_verify_proof.restype = ctypes.c_int
            
            self.lib.psi_free.argtypes = [ctypes.c_void_p]
            self.lib.psi_free.restype = None
            
        except Exception as e:
            self.lib = None
            print(f"Failed to load PSI library: {e}")
            print("Using simulated PSI algorithm.")
    
    def server_preprocess(self, server_set: List[str], key: str) -> str:
        """
        Preprocess the server's set for PSI.
        
        Args:
            server_set: List of server items (malware signatures)
            key: Server secret key
            
        Returns:
            Preprocessed data as a string
        """
        if self.lib is None:
            # Simulate preprocessing
            return "simulated_preprocessed_data"
        
        # Convert Python strings to C strings
        c_server_set = (ctypes.c_char_p * len(server_set))()
        for i, item in enumerate(server_set):
            c_server_set[i] = item.encode('utf-8')
        
        c_key = key.encode('utf-8')
        
        # Allocate output buffer
        output_size = ctypes.c_size_t(1024 * 1024)  # 1MB initial buffer
        output = ctypes.create_string_buffer(output_size.value)
        
        # Call the C function
        result = self.lib.psi_server_preprocess(
            c_server_set,
            len(server_set),
            c_key,
            len(key),
            output,
            ctypes.byref(output_size)
        )
        
        if result == 0:
            # Try again with a larger buffer
            output = ctypes.create_string_buffer(output_size.value)
            result = self.lib.psi_server_preprocess(
                c_server_set,
                len(server_set),
                c_key,
                len(key),
                output,
                ctypes.byref(output_size)
            )
            
            if result == 0:
                raise RuntimeError("Failed to preprocess server set")
        
        return output.value.decode('utf-8')
    
    def client_query(self, client_set: List[str], server_preprocessed: str) -> Tuple[List[str], str]:
        """
        Execute the PSI protocol on the client side.
        
        Args:
            client_set: List of client items (file hashes)
            server_preprocessed: Preprocessed server data
            
        Returns:
            Tuple of (intersection, proof)
        """
        if self.lib is None:
            # Simulate client query
            # Mark every third item as malicious for demonstration
            intersection = [item for i, item in enumerate(client_set) if i % 3 == 0]
            return intersection, "simulated_proof"
        
        # Convert Python strings to C strings
        c_client_set = (ctypes.c_char_p * len(client_set))()
        for i, item in enumerate(client_set):
            c_client_set[i] = item.encode('utf-8')
        
        c_server_preprocessed = server_preprocessed.encode('utf-8')
        
        # Output parameters
        c_intersection = ctypes.POINTER(ctypes.c_char_p)()
        c_intersection_size = ctypes.c_size_t()
        
        c_proof_size = ctypes.c_size_t(1024 * 1024)  # 1MB initial buffer
        c_proof = ctypes.create_string_buffer(c_proof_size.value)
        
        # Call the C function
        result = self.lib.psi_client_query(
            c_client_set,
            len(client_set),
            c_server_preprocessed,
            len(server_preprocessed),
            ctypes.byref(c_intersection),
            ctypes.byref(c_intersection_size),
            c_proof,
            ctypes.byref(c_proof_size)
        )
        
        if result == 0:
            # Try again with a larger buffer
            c_proof = ctypes.create_string_buffer(c_proof_size.value)
            result = self.lib.psi_client_query(
                c_client_set,
                len(client_set),
                c_server_preprocessed,
                len(server_preprocessed),
                ctypes.byref(c_intersection),
                ctypes.byref(c_intersection_size),
                c_proof,
                ctypes.byref(c_proof_size)
            )
            
            if result == 0:
                raise RuntimeError("Failed to execute client query")
        
        # Extract intersection
        intersection = []
        for i in range(c_intersection_size.value):
            item = ctypes.string_at(c_intersection[i]).decode('utf-8')
            intersection.append(item)
        
        # Extract proof
        proof = c_proof.value.decode('utf-8')
        
        # Free memory
        self.lib.psi_free(c_intersection)
        
        return intersection, proof
    
    def server_respond(self, client_query: str, server_set: List[str], key: str) -> Tuple[List[str], str]:
        """
        Execute the PSI protocol on the server side.
        
        Args:
            client_query: Client query data
            server_set: List of server items (malware signatures)
            key: Server secret key
            
        Returns:
            Tuple of (intersection, proof)
        """
        if self.lib is None:
            # Simulate server response
            # Mark every third item as malicious for demonstration
            intersection = [item for i, item in enumerate(server_set) if i % 3 == 0]
            return intersection, "simulated_proof_from_server"
        
        # Convert Python strings to C strings
        c_client_query = client_query.encode('utf-8')
        
        c_server_set = (ctypes.c_char_p * len(server_set))()
        for i, item in enumerate(server_set):
            c_server_set[i] = item.encode('utf-8')
        
        c_key = key.encode('utf-8')
        
        # Output parameters
        c_intersection = ctypes.POINTER(ctypes.c_char_p)()
        c_intersection_size = ctypes.c_size_t()
        
        c_proof_size = ctypes.c_size_t(1024 * 1024)  # 1MB initial buffer
        c_proof = ctypes.create_string_buffer(c_proof_size.value)
        
        # Call the C function
        result = self.lib.psi_server_respond(
            c_client_query,
            len(client_query),
            c_server_set,
            len(server_set),
            c_key,
            len(key),
            ctypes.byref(c_intersection),
            ctypes.byref(c_intersection_size),
            c_proof,
            ctypes.byref(c_proof_size)
        )
        
        if result == 0:
            # Try again with a larger buffer
            c_proof = ctypes.create_string_buffer(c_proof_size.value)
            result = self.lib.psi_server_respond(
                c_client_query,
                len(client_query),
                c_server_set,
                len(server_set),
                c_key,
                len(key),
                ctypes.byref(c_intersection),
                ctypes.byref(c_intersection_size),
                c_proof,
                ctypes.byref(c_proof_size)
            )
            
            if result == 0:
                raise RuntimeError("Failed to execute server response")
        
        # Extract intersection
        intersection = []
        for i in range(c_intersection_size.value):
            item = ctypes.string_at(c_intersection[i]).decode('utf-8')
            intersection.append(item)
        
        # Extract proof
        proof = c_proof.value.decode('utf-8')
        
        # Free memory
        self.lib.psi_free(c_intersection)
        
        return intersection, proof
    
    def verify_proof(self, intersection: List[str], proof: str, client_set: List[str], server_public_key: str) -> bool:
        """
        Verify the zero-knowledge proof.
        
        Args:
            intersection: The claimed intersection
            proof: The zero-knowledge proof
            client_set: The client's set of items
            server_public_key: The server's public key
            
        Returns:
            True if the proof is valid, False otherwise
        """
        if self.lib is None:
            # Simulate proof verification
            return True
        
        # Convert Python strings to C strings
        c_intersection = (ctypes.c_char_p * len(intersection))()
        for i, item in enumerate(intersection):
            c_intersection[i] = item.encode('utf-8')
        
        c_proof = proof.encode('utf-8')
        
        c_client_set = (ctypes.c_char_p * len(client_set))()
        for i, item in enumerate(client_set):
            c_client_set[i] = item.encode('utf-8')
        
        c_server_public_key = server_public_key.encode('utf-8')
        
        # Call the C function
        result = self.lib.psi_verify_proof(
            c_intersection,
            len(intersection),
            c_proof,
            len(proof),
            c_client_set,
            len(client_set),
            c_server_public_key,
            len(server_public_key)
        )
        
        return result == 1


# Singleton instance
_psi_wrapper = None

def get_psi_wrapper() -> PSIWrapper:
    """
    Get the singleton PSI wrapper instance.
    
    Returns:
        PSIWrapper instance
    """
    global _psi_wrapper
    if _psi_wrapper is None:
        _psi_wrapper = PSIWrapper()
    return _psi_wrapper 