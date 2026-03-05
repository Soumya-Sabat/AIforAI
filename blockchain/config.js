// config.js
/**
 * Configuration for the blockchain module
 */

module.exports = {
  // Network configuration
  network: {
    port: process.env.P2P_PORT || 6001,
    bootstrapNodes: process.env.BOOTSTRAP_NODES 
      ? process.env.BOOTSTRAP_NODES.split(',')
      : [],
    maxPeers: 10,
    connectionTimeout: 5000
  },

  // Blockchain configuration
  blockchain: {
    difficulty: 2,
    blockTime: 10000
  },

  // Consensus configuration
  consensus: {
    type: 'poa',
    minimumValidators: 2,
    validationThreshold: 0.51,
    validators: [
      {
        id: 'val1',
        name: 'Validator Node 1',
        publicKey: 'pubkey1abc'
      },
      {
        id: 'val2',
        name: 'Validator Node 2',
        publicKey: 'pubkey2def'
      },
      {
        id: 'val3',
        name: 'Validator Node 3',
        publicKey: 'pubkey3ghi'
      }
    ]
  },

  // Peer review configuration
  review: {
    totalReviewers: 3,  // Changed from requiredReviews to totalReviewers
    reviewers: [
      {
        id: 'reviewer1',
        name: 'Peer-Reviewer 1'
      },
      {
        id: 'reviewer2',
        name: 'Peer-Reviewer 2'
      },
      {
        id: 'reviewer3',
        name: 'Peer-Reviewer 3'
      }
    ]
  },

  // Storage configuration
  storage: {
    // Media storage type: 'ipfs' or 'local'
    mediaStorage: 'ipfs',
    
    // IPFS configuration
    ipfs: {
      host: 'localhost',
      port: 5001,
      protocol: 'http'
    },
    
    // File system paths
    paths: {
      blockchain: './data/blockchain',
      media: './data/media',
      temp: './data/temp'
    }
  },

  // Logging configuration
  logging: {
    level: 'info',
    logToFile: false,
    logFile: './logs/blockchain.log'
  }
};