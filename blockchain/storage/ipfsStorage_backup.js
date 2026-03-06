// storage/ipfsStorage.js
const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto-js');

/**
 * IPFSStorage - Handles video storage on IPFS daemon
 */
class IPFSStorage {
  constructor(config = {}) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 5001,
      protocol: config.protocol || 'http'
    };
    
    this.ipfs = null;
    this.isConnected = false;
  }

  /**
   * Initialize connection to IPFS daemon
   */
  async initialize() {
    try {
      console.log('   🔌 Connecting to IPFS daemon...');
      console.log(`      ${this.config.protocol}://${this.config.host}:${this.config.port}`);
      
      this.ipfs = create({
        host: this.config.host,
        port: this.config.port,
        protocol: this.config.protocol
      });

      const version = await this.ipfs.version();
      this.isConnected = true;
      
      console.log(`   ✓ Connected to IPFS daemon`);
      console.log(`      Version: ${version.version}`);
      console.log(`      Commit: ${version.commit}\n`);
      
      return true;
    } catch (error) {
      this.isConnected = false;
      console.error('   ❌ Failed to connect to IPFS daemon');
      console.error(`      Error: ${error.message}`);
      console.error('\n   💡 Troubleshooting:');
      console.error('      1. Make sure IPFS Desktop is running (check system tray)');
      console.error('      2. OR run "ipfs daemon" in terminal');
      console.error('      3. Check http://localhost:5001/webui\n');
      throw error;
    }
  }

  /**
   * Upload video file to IPFS
   */
  async uploadVideo(filePath, submissionId) {
    this.ensureConnected();

    try {
      console.log(`\n   📤 Uploading video to IPFS...`);
      console.log(`      File: ${path.basename(filePath)}`);

      const fileBuffer = fs.readFileSync(filePath);
      const fileStats = fs.statSync(filePath);

      const result = await this.ipfs.add(fileBuffer, {
        progress: (bytes) => {
          const percent = ((bytes / fileStats.size) * 100).toFixed(1);
          process.stdout.write(`\r      Progress: ${percent}%`);
        }
      });

      console.log('\n   ✓ Video uploaded to IPFS');
      console.log(`      CID: ${result.path}`);
      console.log(`      Size: ${result.size} bytes`);

      const localHash = crypto.SHA256(fileBuffer.toString('base64')).toString();

      const metadata = {
        ipfsCID: result.path,
        ipfsUrl: `https://ipfs.io/ipfs/${result.path}`,
        size: result.size,
        fileName: path.basename(filePath),
        uploadedAt: Date.now(),
        localHash: localHash,
        submissionId: submissionId
      };

      await this.pinFile(result.path);

      return metadata;

    } catch (error) {
      console.error('\n   ❌ Error uploading video:', error.message);
      throw error;
    }
  }

  /**
   * Upload base64 video to IPFS
   */
  async uploadVideoBase64(base64Data, fileName, submissionId) {
    this.ensureConnected();

    try {
      console.log(`\n   📤 Uploading base64 video to IPFS...`);

      let base64String = base64Data;
      if (base64Data.includes(',')) {
        base64String = base64Data.split(',')[1];
      }

      const buffer = Buffer.from(base64String, 'base64');
      const result = await this.ipfs.add(buffer);

      console.log('   ✓ Video uploaded to IPFS');
      console.log(`      CID: ${result.path}`);
      console.log(`      Size: ${result.size} bytes`);

      const localHash = crypto.SHA256(base64String).toString();

      const metadata = {
        ipfsCID: result.path,
        ipfsUrl: `https://ipfs.io/ipfs/${result.path}`,
        size: result.size,
        fileName: fileName,
        uploadedAt: Date.now(),
        localHash: localHash,
        submissionId: submissionId
      };

      await this.pinFile(result.path);

      return metadata;

    } catch (error) {
      console.error('   ❌ Error uploading base64 video:', error.message);
      throw error;
    }
  }

  /**
   * Get video from IPFS by CID
   */
  async getVideo(ipfsCID) {
    this.ensureConnected();

    try {
      console.log(`\n   📥 Downloading from IPFS...`);
      console.log(`      CID: ${ipfsCID}`);

      const chunks = [];
      for await (const chunk of this.ipfs.cat(ipfsCID)) {
        chunks.push(chunk);
      }

      const videoBuffer = Buffer.concat(chunks);
      console.log(`   ✓ Downloaded ${videoBuffer.length} bytes`);

      return videoBuffer;

    } catch (error) {
      console.error('   ❌ Error retrieving video:', error.message);
      throw error;
    }
  }

  /**
   * Download video to file
   */
  async downloadVideoToFile(ipfsCID, outputPath) {
    const videoBuffer = await this.getVideo(ipfsCID);
    fs.writeFileSync(outputPath, videoBuffer);
    console.log(`   ✓ Video saved to: ${outputPath}`);
    return outputPath;
  }

  /**
   * Pin file in IPFS (keep permanently)
   */
  async pinFile(ipfsCID) {
    try {
      await this.ipfs.pin.add(ipfsCID);
      console.log(`      📌 File pinned: ${ipfsCID}`);
      return true;
    } catch (error) {
      console.warn(`      ⚠️  Could not pin file: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify video integrity
   */
  async verifyVideoIntegrity(ipfsCID, expectedHash) {
    try {
      const videoBuffer = await this.getVideo(ipfsCID);
      const currentHash = crypto.SHA256(videoBuffer.toString('base64')).toString();

      return {
        valid: currentHash === expectedHash,
        currentHash: currentHash,
        expectedHash: expectedHash,
        ipfsCID: ipfsCID,
        message: currentHash === expectedHash ? 'Video integrity verified' : 'Hash mismatch'
      };

    } catch (error) {
      return {
        valid: false,
        error: error.message,
        message: 'Could not verify video'
      };
    }
  }

  /**
   * Get IPFS node info
   */
  async getNodeInfo() {
    this.ensureConnected();

    try {
      const id = await this.ipfs.id();
      const version = await this.ipfs.version();

      return {
        id: id.id,
        version: version.version,
        addresses: id.addresses,
        agentVersion: id.agentVersion
      };
    } catch (error) {
      console.error('Error getting node info:', error.message);
      return null;
    }
  }

  /**
   * Check if connected
   */
  ensureConnected() {
    if (!this.isConnected) {
      throw new Error('Not connected to IPFS daemon. Call initialize() first.');
    }
  }

  /**
   * Disconnect from IPFS
   */
  async disconnect() {
    if (this.ipfs) {
      console.log('   🔌 Disconnecting from IPFS...');
      this.isConnected = false;
      this.ipfs = null;
      console.log('   ✓ Disconnected from IPFS\n');
    }
  }
}

module.exports = IPFSStorage;