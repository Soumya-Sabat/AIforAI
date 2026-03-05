// network/p2pNetwork.js
const WebSocket = require('ws');
const crypto = require('crypto-js');

/**
 * P2PNode - Peer-to-Peer Network Node
 * Allows multiple blockchain nodes to communicate and synchronize
 */
class P2PNode {
  constructor(port, nodeId = null, blockchain = null) {
    this.port = port;
    this.nodeId = nodeId || this.generateNodeId();
    this.blockchain = blockchain;
    this.peers = new Map();
    this.server = null;
    this.messageHandlers = new Map();
    
    this.setupMessageHandlers();
  }

  /**
   * Generate unique node ID
   */
  generateNodeId() {
    return crypto.SHA256(Date.now() + Math.random().toString())
      .toString()
      .substring(0, 16);
  }

  /**
   * Start P2P server
   */
  startServer() {
    this.server = new WebSocket.Server({ port: this.port });
    
    console.log(`\n🌐 P2P Server Starting...`);
    console.log(`   Port: ${this.port}`);
    console.log(`   Node ID: ${this.nodeId}`);
    
    this.server.on('connection', (ws, req) => {
      const clientIp = req.socket.remoteAddress;
      
      ws.on('message', (data) => {
        this.handleMessage(ws, data);
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error(`⚠️  WebSocket error: ${error.message}`);
      });

      // Send handshake to new connection
      this.sendHandshake(ws);
    });

    this.server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${this.port} is already in use!`);
        console.error(`   Try a different port or close other instance.`);
      } else {
        console.error(`❌ Server error: ${error.message}`);
      }
    });

    console.log(`✓ P2P Server started on port ${this.port}\n`);
  }

  /**
   * Connect to another peer
   */
  connectToPeer(peerAddress) {
    console.log(`🔗 Connecting to peer: ${peerAddress}`);
    
    const ws = new WebSocket(peerAddress);

    ws.on('open', () => {
      console.log(`✓ Connected to ${peerAddress}`);
      this.sendHandshake(ws);
    });

    ws.on('message', (data) => {
      this.handleMessage(ws, data);
    });

    ws.on('close', () => {
      console.log(`📤 Disconnected from ${peerAddress}`);
      this.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      console.error(`❌ Connection error to ${peerAddress}: ${error.message}`);
    });

    return ws;
  }

  /**
   * Send handshake message
   */
  sendHandshake(ws) {
    const message = {
      type: 'HANDSHAKE',
      nodeId: this.nodeId,
      chainLength: this.blockchain ? this.blockchain.chain.length : 0,
      timestamp: Date.now()
    };
    this.send(ws, message);
  }

  /**
   * Setup message handlers
   */
  setupMessageHandlers() {
    // Handshake
    this.messageHandlers.set('HANDSHAKE', (ws, message) => {
      console.log(`\n🤝 Handshake from node ${message.nodeId}`);
      console.log(`   Their chain length: ${message.chainLength}`);
      console.log(`   Our chain length: ${this.blockchain.chain.length}`);
      
      this.peers.set(message.nodeId, {
        ws: ws,
        nodeId: message.nodeId,
        chainLength: message.chainLength,
        lastSeen: Date.now()
      });

      console.log(`✓ Peer added. Total peers: ${this.peers.size}`);

      // Request blockchain if peer has longer chain
      if (this.blockchain && message.chainLength > this.blockchain.chain.length) {
        console.log(`📥 Peer has longer chain. Requesting...`);
        this.requestBlockchain(ws);
      } else if (this.blockchain && message.chainLength < this.blockchain.chain.length) {
        console.log(`📤 Our chain is longer. Sending to peer...`);
        this.sendBlockchain(ws);
      }
    });

    // New block broadcast
    this.messageHandlers.set('NEW_BLOCK', (ws, message) => {
      console.log(`\n📦 New block received from peer`);
      console.log(`   Block index: ${message.block.index}`);
      this.handleNewBlock(message.block);
    });

    // Blockchain request
    this.messageHandlers.set('REQUEST_BLOCKCHAIN', (ws, message) => {
      console.log(`\n📤 Blockchain requested by peer ${message.nodeId}`);
      this.sendBlockchain(ws);
    });

    // Blockchain response
    this.messageHandlers.set('BLOCKCHAIN', (ws, message) => {
      console.log(`\n📥 Blockchain received from peer`);
      console.log(`   Chain length: ${message.blockchain.length}`);
      this.replaceChain(message.blockchain);
    });

    // New submission broadcast
    this.messageHandlers.set('NEW_SUBMISSION', (ws, message) => {
      console.log(`\n📝 New submission broadcast received`);
      console.log(`   Submission ID: ${message.submission.submissionId}`);
      // Forward to other peers (except sender)
      this.broadcastToOthers(message, ws);
    });

    // Ping/Pong for keepalive
    this.messageHandlers.set('PING', (ws, message) => {
      this.send(ws, { type: 'PONG', timestamp: Date.now() });
    });
  }

  /**
   * Handle incoming message
   */
  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data);
      const handler = this.messageHandlers.get(message.type);
      
      if (handler) {
        handler.call(this, ws, message);
      } else {
        console.warn(`⚠️  Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`❌ Error handling message: ${error.message}`);
    }
  }

  /**
   * Send message to specific peer
   */
  send(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`❌ Error sending message: ${error.message}`);
      }
    }
  }

  /**
   * Broadcast message to all peers
   */
broadcast(message) {
    let sent = 0;
    this.peers.forEach(peer => {
      if (peer.ws.readyState === WebSocket.OPEN) {
        this.send(peer.ws, message);
        sent++;
      }
    });
    return sent;
  }

  /**
   * Broadcast to all peers except one
   */
  broadcastToOthers(message, excludeWs) {
    this.peers.forEach(peer => {
      if (peer.ws !== excludeWs && peer.ws.readyState === WebSocket.OPEN) {
        this.send(peer.ws, message);
      }  
    });
  }

  /**
   * Broadcast new block to all peers
   */
  broadcastBlock(block) {
    const message = {
      type: 'NEW_BLOCK',
      block: block,
      nodeId: this.nodeId,
      timestamp: Date.now()
    };
    
    const sent = this.broadcast(message);
    console.log(`\n📢 Block ${block.index} broadcasted to ${sent} peer(s)`);
  }

  /**
   * Request blockchain from peer
   */
  requestBlockchain(ws) {
    const message = {
      type: 'REQUEST_BLOCKCHAIN',
      nodeId: this.nodeId,
      timestamp: Date.now()
    };
    this.send(ws, message);
  }

  /**
   * Send blockchain to peer
   */
  sendBlockchain(ws) {
    const message = {
      type: 'BLOCKCHAIN',
      blockchain: this.blockchain.chain,
      nodeId: this.nodeId,
      timestamp: Date.now()
    };
    this.send(ws, message);
  }

  /**
   * Handle new block from peer
   */
  handleNewBlock(block) {
    const latestBlock = this.blockchain.getLatestBlock();
    
    // Check if block is next in sequence
    if (block.previousHash === latestBlock.hash && 
        block.index === latestBlock.index + 1) {
      
      // Validate block
      if (block.hash === this.calculateBlockHash(block)) {
        console.log(`✓ Block ${block.index} is valid, adding to chain`);
        this.blockchain.chain.push(block);
        console.log(`✓ Chain length: ${this.blockchain.chain.length}`);
      } else {
        console.log(`❌ Block ${block.index} has invalid hash`);
      }
    } else {
      console.log(`⚠️  Block ${block.index} not in sequence, requesting full chain`);
      // Request full blockchain from all peers
      this.peers.forEach(peer => {
        this.requestBlockchain(peer.ws);
      });
    }
  }

  /**
   * Replace chain if received chain is valid and longer
   */
  replaceChain(newChain) {
    if (newChain.length <= this.blockchain.chain.length) {
      console.log(`⚠️  Received chain is not longer. Ignoring.`);
      return false;
    }

    if (!this.validateChain(newChain)) {
      console.log(`❌ Received chain is invalid. Rejecting.`);
      return false;
    }

    console.log(`✓ Replacing our chain with received chain`);
    console.log(`   Old length: ${this.blockchain.chain.length}`);
    console.log(`   New length: ${newChain.length}`);
    
    // Reconstruct blocks with proper methods
    const Block = require('../core/block');
    this.blockchain.chain = newChain.map(blockData => {
      const block = new Block(
        blockData.index,
        blockData.timestamp,
        blockData.data,
        blockData.previousHash
      );
      block.hash = blockData.hash;
      block.nonce = blockData.nonce;
      block.validatorSignatures = blockData.validatorSignatures;
      block.consensusReached = blockData.consensusReached;
      return block;
    });

    console.log(`✓ Chain replaced successfully\n`);
    return true;
  }

  /**
   * Validate a blockchain
   */
  validateChain(chain) {
    // Check genesis block
    if (JSON.stringify(chain[0].data) !== JSON.stringify('Genesis Block')) {
      console.log(`❌ Invalid genesis block`);
      return false;
    }

    // Validate each block
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      // Check previous hash link
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log(`❌ Block ${i} has invalid previous hash`);
        return false;
      }

      // Check hash validity
      if (currentBlock.hash !== this.calculateBlockHash(currentBlock)) {
        console.log(`❌ Block ${i} has invalid hash`);
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate hash for a block
   */
  calculateBlockHash(block) {
    return crypto.SHA256(
      block.index +
      block.previousHash +
      block.timestamp +
      JSON.stringify(block.data) +
      block.nonce
    ).toString();
  }

  /**
   * Handle peer disconnection
   */
  handleDisconnection(ws) {
    for (const [nodeId, peer] of this.peers.entries()) {
      if (peer.ws === ws) {
        console.log(`\n📤 Peer disconnected: ${nodeId}`);
        this.peers.delete(nodeId);
        console.log(`   Remaining peers: ${this.peers.size}`);
        break;
      }
    }
  }

  /**
   * Get connected peers info
   */
  getConnectedPeers() {
    return Array.from(this.peers.values()).map(peer => ({
      nodeId: peer.nodeId,
      chainLength: peer.chainLength,
      lastSeen: peer.lastSeen,
      connected: peer.ws.readyState === WebSocket.OPEN
    }));
  }

  /**
   * Sync with network
   */
  async syncWithNetwork() {
    if (this.peers.size === 0) {
      console.log(`\n⚠️  No peers connected. Cannot sync.`);
      return;
    }

    console.log(`\n🔄 Syncing with network...`);
    console.log(`   Connected peers: ${this.peers.size}`);
    
    // Request blockchain from all peers
    this.peers.forEach(peer => {
      this.requestBlockchain(peer.ws);
    });
  }

  /**
   * Set blockchain instance
   */
  setBlockchain(blockchain) {
    this.blockchain = blockchain;
  }

  /**
   * Close all connections and stop server
   */
  shutdown() {
    console.log(`\n🛑 Shutting down P2P node...`);
    
    // Close all peer connections
    this.peers.forEach(peer => {
      if (peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.close();
      }
    });

    // Close server
    if (this.server) {
      this.server.close();
    }

    console.log(`✓ P2P node shut down\n`);
  }
}

module.exports = P2PNode;