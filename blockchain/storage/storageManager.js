// storage/storageManager.js
const IPFSStorage = require('./ipfsStorage');
const BlockchainStorage = require('./blockchainStorage');

/**
 * StorageManager - Unified storage interface
 */
class StorageManager {
  constructor(config) {
    this.config = config;
    this.ipfsStorage = null;
    this.blockchainStorage = null;
  }

  /**
   * Initialize all storage systems
   */
  async initialize() {
    console.log('💾 Initializing storage systems...\n');

    // Initialize IPFS (if configured)
    if (this.config.mediaStorage === 'ipfs') {
      this.ipfsStorage = new IPFSStorage(this.config.ipfs);
      await this.ipfsStorage.initialize();
    }

    // Initialize blockchain storage
    this.blockchainStorage = new BlockchainStorage(
      this.config.paths.blockchain
    );

    console.log('✓ All storage systems initialized\n');
  }

  /**
   * Upload video to IPFS
   */
  async uploadVideo(filePath, submissionId) {
    if (!this.ipfsStorage) {
      throw new Error('IPFS storage not configured');
    }
    return await this.ipfsStorage.uploadVideo(filePath, submissionId);
  }

  /**
   * Upload base64 video
   */
  async uploadVideoBase64(base64Data, fileName, submissionId) {
    if (!this.ipfsStorage) {
      throw new Error('IPFS storage not configured');
    }
    return await this.ipfsStorage.uploadVideoBase64(base64Data, fileName, submissionId);
  }

  /**
   * Get video from IPFS
   */
  async getVideo(ipfsCID, outputPath = null) {
    if (!this.ipfsStorage) {
      throw new Error('IPFS storage not configured');
    }
    
    if (outputPath) {
      return await this.ipfsStorage.downloadVideoToFile(ipfsCID, outputPath);
    } else {
      return await this.ipfsStorage.getVideo(ipfsCID);
    }
  }

  /**
   * Verify video integrity
   */
  async verifyVideoIntegrity(ipfsCID, expectedHash) {
    if (!this.ipfsStorage) {
      throw new Error('IPFS storage not configured');
    }
    return await this.ipfsStorage.verifyVideoIntegrity(ipfsCID, expectedHash);
  }

  /**
   * Save blockchain
   */
  async saveBlockchain(blockchain) {
    return await this.blockchainStorage.saveBlockchain(blockchain);
  }

  /**
   * Load blockchain
   */
  async loadBlockchain() {
    return await this.blockchainStorage.loadBlockchain();
  }

  /**
   * Get IPFS node info
   */
  async getIPFSInfo() {
    if (!this.ipfsStorage) {
      return null;
    }
    return await this.ipfsStorage.getNodeInfo();
  }

  /**
   * Disconnect all storage
   */
  async disconnect() {
    if (this.ipfsStorage) {
      await this.ipfsStorage.disconnect();
    }
  }
}

module.exports = StorageManager;