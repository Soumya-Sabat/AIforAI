// storage/ipfsStorage.js
// COMPLETE FILE - Replace your entire ipfsStorage.js with this

const fs = require('fs');
const path = require('path');
const crypto = require('crypto-js');
const FormData = require('form-data');
const http = require('http');

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
    
    this.isConnected = false;
  }

  /**
   * Initialize connection to IPFS daemon
   */
  async initialize() {
    try {
      console.log('   🔌 Connecting to IPFS daemon...');
      console.log(`      http://${this.config.host}:${this.config.port}`);
      
      const version = await this.getVersion();
      this.isConnected = true;
      
      console.log(`   ✓ Connected to IPFS daemon`);
      console.log(`      Version: ${version.Version}`);
      console.log(`      Commit: ${version.Commit.substring(0, 8)}...\n`);
      
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
   * Get IPFS version
   */
  async getVersion() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.config.host,
        port: this.config.port,
        path: '/api/v0/version',
        method: 'POST'
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Upload video file to IPFS
   */
  async uploadVideo(filePath, submissionId) {
    this.ensureConnected();

    try {
      console.log(`\n   📤 Uploading video to IPFS...`);
      console.log(`      File: ${path.basename(filePath)}`);

      const fileStats = fs.statSync(filePath);
      const fileStream = fs.createReadStream(filePath);
      
      const result = await this.addFile(fileStream, path.basename(filePath), fileStats.size);

      console.log('\n   ✓ Video uploaded to IPFS');
      console.log(`      CID: ${result.Hash}`);
      console.log(`      Size: ${result.Size} bytes`);

      const fileBuffer = fs.readFileSync(filePath);
      const localHash = crypto.SHA256(fileBuffer.toString('base64')).toString();

      const metadata = {
        ipfsCID: result.Hash,
        ipfsUrl: `https://ipfs.io/ipfs/${result.Hash}`,
        size: result.Size,
        fileName: path.basename(filePath),
        uploadedAt: Date.now(),
        localHash: localHash,
        submissionId: submissionId
      };

      await this.pinFile(result.Hash);

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
      
      const result = await this.addBuffer(buffer, fileName);

      console.log('   ✓ Video uploaded to IPFS');
      console.log(`      CID: ${result.Hash}`);
      console.log(`      Size: ${result.Size} bytes`);

      const localHash = crypto.SHA256(base64String).toString();

      const metadata = {
        ipfsCID: result.Hash,
        ipfsUrl: `https://ipfs.io/ipfs/${result.Hash}`,
        size: result.Size,
        fileName: fileName,
        uploadedAt: Date.now(),
        localHash: localHash,
        submissionId: submissionId
      };

      await this.pinFile(result.Hash);

      return metadata;

    } catch (error) {
      console.error('   ❌ Error uploading base64 video:', error.message);
      throw error;
    }
  }

  /**
   * Add file to IPFS
   */
  async addFile(fileStream, fileName, fileSize) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('file', fileStream, { filename: fileName });

      const options = {
        hostname: this.config.host,
        port: this.config.port,
        path: '/api/v0/add?pin=true',
        method: 'POST',
        headers: form.getHeaders()
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        let lastPercent = 0;
        let uploadedBytes = 0;

        res.on('data', chunk => {
          data += chunk;
          uploadedBytes += chunk.length;
          const percent = Math.floor((uploadedBytes / fileSize) * 100);
          if (percent > lastPercent && percent % 10 === 0) {
            process.stdout.write(`\r      Progress: ${percent}%`);
            lastPercent = percent;
          }
        });

        res.on('end', () => {
          console.log('\r      Progress: 100%');
          try {
            const lines = data.trim().split('\n');
            const result = JSON.parse(lines[lines.length - 1]);
            resolve(result);
          } catch (e) {
            reject(new Error('Failed to parse IPFS response'));
          }
        });
      });

      req.on('error', reject);
      form.pipe(req);
    });
  }

  /**
   * Add buffer to IPFS
   */
  async addBuffer(buffer, fileName) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('file', buffer, { filename: fileName });

      const options = {
        hostname: this.config.host,
        port: this.config.port,
        path: '/api/v0/add?pin=true',
        method: 'POST',
        headers: form.getHeaders()
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const lines = data.trim().split('\n');
            const result = JSON.parse(lines[lines.length - 1]);
            resolve(result);
          } catch (e) {
            reject(new Error('Failed to parse IPFS response'));
          }
        });
      });

      req.on('error', reject);
      form.pipe(req);
    });
  }

  /**
   * Get video from IPFS
   */
  async getVideo(ipfsCID) {
    this.ensureConnected();

    try {
      console.log(`\n   📥 Downloading from IPFS...`);
      console.log(`      CID: ${ipfsCID}`);

      return new Promise((resolve, reject) => {
        const options = {
          hostname: this.config.host,
          port: this.config.port,
          path: `/api/v0/cat?arg=${ipfsCID}`,
          method: 'POST'
        };

        const req = http.request(options, (res) => {
          const chunks = [];
          
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => {
            const videoBuffer = Buffer.concat(chunks);
            console.log(`   ✓ Downloaded ${videoBuffer.length} bytes`);
            resolve(videoBuffer);
          });
        });

        req.on('error', reject);
        req.end();
      });

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
   * Pin file
   */
  async pinFile(ipfsCID) {
    try {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: this.config.host,
          port: this.config.port,
          path: `/api/v0/pin/add?arg=${ipfsCID}`,
          method: 'POST'
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            console.log(`      📌 File pinned: ${ipfsCID}`);
            resolve(true);
          });
        });

        req.on('error', () => resolve(false));
        req.end();
      });
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
   * Get node info
   */
  async getNodeInfo() {
    this.ensureConnected();

    try {
      const id = await this.getNodeId();
      const version = await this.getVersion();

      return {
        id: id.ID,
        version: version.Version,
        addresses: id.Addresses,
        agentVersion: id.AgentVersion
      };
    } catch (error) {
      console.error('Error getting node info:', error.message);
      return null;
    }
  }

  /**
   * Get node ID
   */
  async getNodeId() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.config.host,
        port: this.config.port,
        path: '/api/v0/id',
        method: 'POST'
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
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
   * Disconnect
   */
  async disconnect() {
    if (this.isConnected) {
      console.log('   🔌 Disconnecting from IPFS...');
      this.isConnected = false;
      console.log('   ✓ Disconnected from IPFS\n');
    }
  }
}

module.exports = IPFSStorage;