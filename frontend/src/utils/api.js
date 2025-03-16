import axios from 'axios';

// API base URL
const API_BASE_URL = '/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send file hashes to the server for malware detection
 * @param {Array} hashes - Array of file hash objects
 * @param {boolean} usePSI - Whether to use PSI protocol
 * @returns {Promise} - Promise with the detection results
 */
export const detectMalware = async (hashes, usePSI = true) => {
  try {
    // In a real implementation, this would call the backend API
    // For demo purposes, we'll simulate a response
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response - in a real app, this would be:
    // const response = await apiClient.post('/detect', { hashes, use_psi: usePSI });
    // return response.data;
    
    // For demo, we'll mark every third file as malicious
    const maliciousHashes = hashes
      .filter((_, index) => index % 3 === 0)
      .map(file => file.hash);
    
    return {
      malicious_hashes: maliciousHashes,
      proof: "zkp_base64_string_would_be_here_in_real_implementation"
    };
  } catch (error) {
    console.error('Error in malware detection:', error);
    throw error;
  }
};

/**
 * Get information about detected threats
 * @param {Array} maliciousHashes - Array of malicious file hashes
 * @returns {Promise} - Promise with threat details
 */
export const getThreatInfo = async (maliciousHashes) => {
  try {
    // In a real implementation, this would call the backend API
    // For demo purposes, we'll simulate a response
    
    // Mock threat types
    const threatTypes = ['Trojan', 'Spyware', 'Ransomware', 'Adware', 'Worm'];
    
    // Generate mock threat info for each malicious hash
    const threatInfo = maliciousHashes.map((hash, index) => ({
      hash,
      threatType: threatTypes[index % threatTypes.length],
      confidence: Math.floor(Math.random() * 30) + 70, // 70-99% confidence
      firstSeen: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 90 days
      prevalence: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    }));
    
    return threatInfo;
  } catch (error) {
    console.error('Error getting threat info:', error);
    throw error;
  }
}; 