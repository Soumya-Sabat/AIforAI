// index.js - Main blockchain module entry point
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Core components
const Block = require('./core/block');
const Blockchain = require('./core/blockchain');
const Submission = require('./core/submission');
const { Validator, ProofOfAuthority } = require('./core/consensus');
const { PeerReviewer, ReviewManager } = require('./core/peerReview');

/**
 * BlockchainModule - Main interface for the blockchain system
 */
class BlockchainModule {
  constructor(customConfig = {}) {
    this.config = this.mergeConfig(config, customConfig);
    this.initialized = false;
    this.ipfsStorage = null;
  }

  /**
   * Merge configurations
   */
  mergeConfig(defaultConfig, customConfig) {
    return {
      ...defaultConfig,
      ...customConfig,
      network: { ...defaultConfig.network, ...customConfig.network },
      blockchain: { ...defaultConfig.blockchain, ...customConfig.blockchain },
      consensus: { ...defaultConfig.consensus, ...customConfig.consensus },
      review: { ...defaultConfig.review, ...customConfig.review },
      storage: { 
        ...defaultConfig.storage, 
        ...customConfig.storage,
        ipfs: {
          ...defaultConfig.storage?.ipfs,
          ...customConfig.storage?.ipfs
        },
        paths: {
          ...defaultConfig.storage?.paths,
          ...customConfig.storage?.paths
        }
      }
    };
  }

  /**
   * Initialize the blockchain module
   */
  async initialize() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   Blockchain Module Initialization         ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // 1. Create data directories
    this.createDataDirectories();

    // 2. Initialize IPFS storage (if configured)
    if (this.config.storage.mediaStorage === 'ipfs') {
      try {
        console.log('🌐 Initializing IPFS storage...');
        const IPFSStorage = require('./storage/ipfsStorage');
        this.ipfsStorage = new IPFSStorage(this.config.storage.ipfs);
        await this.ipfsStorage.initialize();
      } catch (error) {
        console.error('⚠️  IPFS initialization failed:', error.message);
        console.log('   Falling back to local storage\n');
        this.config.storage.mediaStorage = 'local';
        this.ipfsStorage = null;
      }
    }

    // 3. Initialize consensus mechanism
    console.log('⚙️  Initializing consensus mechanism...');
    this.consensus = new ProofOfAuthority(
      this.config.consensus.minimumValidators
    );
    this.setupValidators();
    console.log('✓ Consensus mechanism initialized\n');

    // 4. Initialize blockchain
    console.log('⛓️  Initializing blockchain...');
    this.blockchain = new Blockchain(this.consensus);
    this.blockchain.difficulty = this.config.blockchain.difficulty;
    console.log('✓ Blockchain initialized\n');

    // 5. Initialize review system
  console.log('📋 Initializing peer review system...');
  this.reviewManager = new ReviewManager(
    this.blockchain,
    this.config.review.totalReviewers  // Changed from requiredReviews to totalReviewers
  );
  this.setupReviewers();
  console.log('✔ Review system initialized\n');

    // 6. Load existing blockchain (if any)
    await this.loadBlockchain();

    this.initialized = true;

    console.log('╔════════════════════════════════════════════╗');
    console.log('║   ✅ Blockchain Module Ready!              ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    this.printStatus();

    return this;
  }

  /**
   * Create necessary data directories
   */
  createDataDirectories() {
    const dirs = [
      this.config.storage.paths.blockchain,
      this.config.storage.paths.media,
      this.config.storage.paths.temp
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Setup validators from config
   */
  setupValidators() {
    this.config.consensus.validators.forEach(validatorConfig => {
      const validator = new Validator(
        validatorConfig.id,
        validatorConfig.name,
        validatorConfig.publicKey
      );
      this.consensus.addValidator(validator);
    });
  }

    
  /**
   * Setup peer reviewers from config
   */
  setupReviewers() {
    this.reviewers = this.config.review.reviewers.map(reviewerConfig => 
      new PeerReviewer(reviewerConfig.id, reviewerConfig.name)
    );
    console.log(`✔ ${this.reviewers.length} peer reviewers configured`);
    console.log(`  All ${this.reviewers.length} reviewers must submit before decision`);
  }

  /**
   * Load blockchain from storage
   */
  async loadBlockchain() {
    const blockchainFile = path.join(
      this.config.storage.paths.blockchain,
      'blockchain.json'
    );

    if (fs.existsSync(blockchainFile)) {
      try {
        const data = fs.readFileSync(blockchainFile, 'utf8');
        const savedChain = JSON.parse(data);
        
        this.blockchain.chain = savedChain.map(blockData => {
          const block = new Block(
            blockData.index,
            blockData.timestamp,
            blockData.data,
            blockData.previousHash
          );
          block.hash = blockData.hash;
          block.nonce = blockData.nonce;
          block.validatorSignatures = blockData.validatorSignatures || [];
          block.consensusReached = blockData.consensusReached || false;
          return block;
        });

        console.log(`✓ Loaded ${this.blockchain.chain.length} blocks from storage\n`);
      } catch (error) {
        console.log(`⚠️  Error loading blockchain: ${error.message}\n`);
      }
    }
  }

  /**
   * Save blockchain to storage
   */
  async saveBlockchain() {
    const blockchainFile = path.join(
      this.config.storage.paths.blockchain,
      'blockchain.json'
    );

    try {
      fs.writeFileSync(
        blockchainFile,
        JSON.stringify(this.blockchain.chain, null, 2)
      );
      console.log('✓ Blockchain saved to storage');
    } catch (error) {
      console.error('❌ Error saving blockchain:', error.message);
    }
  }

  /**
   * Submit content for review - MODIFIED VERSION
   * Now accepts: description (text) + videoData (required)
   */
  async submitForReview(data) {
    this.ensureInitialized();

    const { actorId, description, videoData, fileName } = data;

    // Validate inputs
    if (!actorId) {
      throw new Error('Actor ID is required');
    }
    if (!description || description.trim() === '') {
      throw new Error('Description is required');
    }
    if (!videoData) {
      throw new Error('Video data is required');
    }

    console.log('\n📝 Creating new submission...');
    console.log(`   Actor: ${actorId}`);
    console.log(`   Description: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`);
    console.log(`   Video File: ${fileName || 'provided'}`);

    // Create submission with description and video
    const submission = new Submission(
      actorId,
      description,
      videoData,
      fileName
    );

    // Upload video to IPFS and get hash
    console.log('\n🎥 Uploading video to IPFS...');
    
    if (this.config.storage.mediaStorage === 'ipfs' && this.ipfsStorage) {
      // Upload to IPFS
      try {
        let ipfsMetadata;
        
        if (typeof videoData === 'string' && fs.existsSync(videoData)) {
          // File path provided
          console.log('   📁 Uploading video file to IPFS...');
          ipfsMetadata = await this.ipfsStorage.uploadVideo(
            videoData,
            submission.submissionId
          );
        } else {
          // Base64 data provided
          console.log('   📊 Uploading base64 video to IPFS...');
          ipfsMetadata = await this.ipfsStorage.uploadVideoBase64(
            videoData,
            fileName || 'video.mp4',
            submission.submissionId
          );
        }
        
        submission.setVideoMetadata(ipfsMetadata);
        
        console.log('\n✅ Video uploaded successfully!');
        console.log(`   IPFS CID: ${ipfsMetadata.ipfsCID}`);
        console.log(`   IPFS URL: ${ipfsMetadata.ipfsUrl}`);
        console.log(`   Size: ${ipfsMetadata.size} bytes`);
        
      } catch (error) {
        console.error('❌ IPFS upload failed:', error.message);
        throw new Error('Failed to upload video to IPFS: ' + error.message);
      }
    } else {
      // Fallback to local storage if IPFS not available
      console.log('   ⚠️  IPFS not available, using local storage...');
      
      const videoPath = path.join(
        this.config.storage.paths.media,
        `${submission.submissionId}_${fileName || 'video.mp4'}`
      );
      
      if (typeof videoData === 'string' && fs.existsSync(videoData)) {
        fs.copyFileSync(videoData, videoPath);
      } else if (typeof videoData === 'string' && videoData.startsWith('data:')) {
        // Handle base64
        const base64Data = videoData.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(videoPath, buffer);
      }
      
      const crypto = require('crypto-js');
      submission.setVideoMetadata({
        filePath: videoPath,
        fileName: fileName || 'video.mp4',
        uploadedAt: Date.now(),
        localHash: crypto.SHA256(videoPath).toString()
      });
      
      console.log('   ✅ Video saved locally');
    }

    // Add to review queue
    console.log('\n📋 Submitting for peer review...');
    const submissionId = this.reviewManager.submitForReview(submission);

    return {
      submissionId,
      status: 'pending',
      description: description,
      requiredReviews: this.config.review.totalReviewers,
      ipfsCID: submission.videoMetadata?.ipfsCID || null,
      ipfsUrl: submission.videoMetadata?.ipfsUrl || null,
      storageType: this.config.storage.mediaStorage,
      videoHash: submission.videoMetadata?.localHash || submission.videoMetadata?.ipfsCID,
      message: '✅ Submission created! Video hash stored on blockchain, video on IPFS.'
    };
  }

  /**
   * Add a review
   */
  async addReview(submissionId, reviewerId, approved, comments) {
    this.ensureInitialized();

    const reviewer = this.reviewers.find(r => r.id === reviewerId);
    if (!reviewer) {
      throw new Error(`Reviewer '${reviewerId}' not found`);
    }

    const result = await this.reviewManager.processReview(
      submissionId,
      reviewer,
      approved,
      comments
    );

    // Save blockchain after successful verification
    if (result.status === 'verified') {
      await this.saveBlockchain();
    }

    return result;
  }

  /**
   * Get certificate
   */
  getCertificate(submissionId) {
    this.ensureInitialized();

    const block = this.blockchain.getBlockBySubmissionId(submissionId);
    
    if (block) {
      return {
        certificate: block.data.certificate,
        blockIndex: block.index,
        blockHash: block.hash,
        consensusReached: block.consensusReached,
        validators: block.validatorSignatures
      };
    }

    return null;
  }

  /**
   * Verify certificate
   */
  verifyCertificate(certificateId) {
    this.ensureInitialized();

    for (const block of this.blockchain.chain) {
      if (block.data.certificate?.certificateId === certificateId) {
        return {
          valid: true,
          certificate: block.data.certificate,
          block: block.getSummary(),
          message: 'Certificate is valid and recorded on blockchain'
        };
      }
    }

    return {
      valid: false,
      message: 'Certificate not found in blockchain'
    };
  }

  /**
   * Get blockchain status
   */
  getStatus() {
    this.ensureInitialized();

    return {
      ...this.blockchain.getStats(),
      consensus: this.consensus.getConfig(),
      review: this.reviewManager.getStats(),
      validators: this.consensus.getValidatorStats(),
      storage: {
        type: this.config.storage.mediaStorage,
        ipfsConnected: this.ipfsStorage?.isConnected || false
      }
    };
  }

  /**
   * Get pending submissions
   */
  getPendingSubmissions() {
    this.ensureInitialized();
    return this.reviewManager.getPendingSubmissions();
  }

  /**
   * Get blockchain summary
   */
  getBlockchainSummary() {
    this.ensureInitialized();
    return this.blockchain.getSummary();
  }

  /**
   * Get video from IPFS or local storage
   */
  async getVideo(identifier, outputPath = null) {
    this.ensureInitialized();
    
    if (this.config.storage.mediaStorage === 'ipfs' && this.ipfsStorage) {
      // identifier is IPFS CID
      if (outputPath) {
        return await this.ipfsStorage.downloadVideoToFile(identifier, outputPath);
      } else {
        return await this.ipfsStorage.getVideo(identifier);
      }
    } else {
      // identifier is file path
      if (outputPath) {
        fs.copyFileSync(identifier, outputPath);
        return outputPath;
      } else {
        return fs.readFileSync(identifier);
      }
    }
  }

  /**
   * Verify video integrity
   */
  async verifyVideoIntegrity(ipfsCID, expectedHash) {
    this.ensureInitialized();
    
    if (this.config.storage.mediaStorage === 'ipfs' && this.ipfsStorage) {
      return await this.ipfsStorage.verifyVideoIntegrity(ipfsCID, expectedHash);
    } else {
      throw new Error('Video integrity verification only available with IPFS');
    }
  }

  /**
   * Get IPFS node information
   */
  async getIPFSInfo() {
    this.ensureInitialized();
    
    if (this.ipfsStorage) {
      return await this.ipfsStorage.getNodeInfo();
    } else {
      return { connected: false, message: 'IPFS not configured' };
    }
  }

  /**
   * Print current status
   */
  printStatus() {
    const status = this.getStatus();
    
    console.log('📊 Current Status:');
    console.log(`   Blocks: ${status.totalBlocks}`);
    console.log(`   Verified Submissions: ${status.verifiedSubmissions}`);
    console.log(`   Pending Submissions: ${status.review.pendingSubmissions}`);
    console.log(`   Active Validators: ${status.consensus.activeValidators}`);
    console.log(`   Chain Valid: ${status.isValid ? '✅' : '❌'}`);
    console.log(`   Storage: ${status.storage.type.toUpperCase()}`);
    if (status.storage.type === 'ipfs') {
      console.log(`   IPFS Connected: ${status.storage.ipfsConnected ? '✅' : '❌'}`);
    }
    console.log('');
  }

  /**
   * Ensure module is initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Blockchain module not initialized. Call initialize() first.');
    }
  }

  /**
   * Shutdown gracefully
   */
  async shutdown() {
    console.log('\n🛑 Shutting down blockchain module...');
    await this.saveBlockchain();
    
    // Disconnect from IPFS
    if (this.ipfsStorage) {
      await this.ipfsStorage.disconnect();
    }
    
    console.log('✓ Blockchain module shut down\n');
  }
}

// Export the module
module.exports = BlockchainModule;

// Also export individual components if needed
module.exports.Block = Block;
module.exports.Blockchain = Blockchain;
module.exports.Submission = Submission;
module.exports.Validator = Validator;
module.exports.ProofOfAuthority = ProofOfAuthority;
module.exports.PeerReviewer = PeerReviewer;
module.exports.ReviewManager = ReviewManager;