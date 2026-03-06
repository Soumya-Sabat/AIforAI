
const Block = require('./block');


class Blockchain {
  constructor(consensus) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;  
    this.consensus = consensus;  
  }

  
  createGenesisBlock() {
    const genesisBlock = new Block(0, Date.now(), 'Genesis Block', '0');
    genesisBlock.consensusReached = true;  
    console.log('Genesis block created');
    return genesisBlock;
  }

  
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  
  async addBlockWithConsensus(newBlock, submission) {
    newBlock.previousHash = this.getLatestBlock().hash;
    
    console.log(` Mining block ${newBlock.index}...`);
    newBlock.mineBlock(this.difficulty);

    console.log(`Requesting consensus from validators...`);
    const consensusResult = await this.consensus.validateBlock(newBlock, submission);

    if (consensusResult.success) {
      this.chain.push(newBlock);
      console.log(` Block ${newBlock.index} added to blockchain`);
      console.log(` Hash: ${newBlock.hash.substring(0, 20)}...`);
      console.log(` Validators: ${consensusResult.validations.length}\n`);
      
      return { 
        success: true, 
        block: newBlock, 
        consensus: consensusResult 
      };
    } else {
      console.log(`❌ Block ${newBlock.index} rejected - consensus failed\n`);
      
      return { 
        success: false, 
        consensus: consensusResult 
      };
    }
  }

  
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log(`❌ Block ${i} has invalid hash`);
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log(`❌ Block ${i} has invalid previous hash`);
        return false;
      }


      if (!currentBlock.consensusReached) {
        console.log(`❌ Block ${i} has no consensus`);
        return false;
      }
    }

    return true;
  }

  /**
   * Get block by index
   */
  getBlock(index) {
    if (index >= 0 && index < this.chain.length) {
      return this.chain[index];
    }
    return null;
  }

  
  getBlockBySubmissionId(submissionId) {
    return this.chain.find(block => 
      block.data.submission && 
      block.data.submission.submissionId === submissionId
    );
  }

  
  getVerifiedSubmissions() {
    return this.chain
      .filter(block => block.data.type === 'verified_submission')
      .map(block => block.data.submission);
  }

  
  getCertificates() {
    return this.chain
      .filter(block => block.data.certificate)
      .map(block => block.data.certificate);
  }

  
  getStats() {
    const verifiedBlocks = this.chain.filter(
      block => block.data.type === 'verified_submission'
    ).length;

    return {
      totalBlocks: this.chain.length,
      verifiedSubmissions: verifiedBlocks,
      latestBlockHash: this.getLatestBlock().hash.substring(0, 20) + '...',
      isValid: this.isChainValid(),
      difficulty: this.difficulty,
      consensusMechanism: 'Proof of Authority'
    };
  }

  
  getSummary() {
    return this.chain.map(block => block.getSummary());
  }

  
  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log('⚠️  Received chain is not longer');
      return false;
    }

    if (!this.validateChain(newChain)) {
      console.log('❌ Received chain is invalid');
      return false;
    }

    console.log('✅ Replacing chain with received chain');
    this.chain = newChain;
    return true;
  }

  
  validateChain(chain) {
    
    const genesisBlock = this.createGenesisBlock();
    if (JSON.stringify(chain[0]) !== JSON.stringify(genesisBlock)) {
      return false;
    }

    
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      if (currentBlock.hash !== this.calculateBlockHash(currentBlock)) {
        return false;
      }
    }

    return true;
  }

  
  calculateBlockHash(block) {
    const crypto = require('crypto-js');
    return crypto.SHA256(
      block.index +
      block.previousHash +
      block.timestamp +
      JSON.stringify(block.data) +
      block.nonce
    ).toString();
  }
}

module.exports = Blockchain;