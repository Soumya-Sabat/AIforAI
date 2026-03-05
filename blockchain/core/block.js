// core/block.js
const crypto = require('crypto-js');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;                    
    this.timestamp = timestamp;            
    this.data = data;                      
    this.previousHash = previousHash;      
    this.nonce = 0;                        
    this.hash = this.calculateHash();      
    
    // Consensus fields
    this.validatorSignatures = [];         
    this.consensusReached = false;         
  }

  
  calculateHash() {
    return crypto.SHA256(
      this.index +
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.data) +
      this.nonce
    ).toString();
  }

  
  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    
    console.log(`Block mined: ${this.hash}`);
  }

  
  isValid() {
    return this.hash === this.calculateHash();
  }

  
  getSummary() {
    return {
      index: this.index,
      timestamp: new Date(this.timestamp).toISOString(),
      hash: this.hash.substring(0, 10) + '...',
      previousHash: this.previousHash.substring(0, 10) + '...',
      dataType: this.data.type || 'unknown',
      consensusReached: this.consensusReached,
      validators: this.validatorSignatures.length
    };
  }
}

module.exports = Block;