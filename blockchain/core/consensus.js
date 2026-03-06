
const crypto = require('crypto-js');


class Validator {
  constructor(id, name, publicKey) {
    this.id = id;
    this.name = name;
    this.publicKey = publicKey;
    this.reputation = 100;
    this.validatedBlocks = 0;
    this.isActive = true;
  }

  /**
   * Sign a block (in production, we will use real cryptographic signing)
   */
  signBlock(blockHash) {
    return crypto.SHA256(
      blockHash + this.id + this.publicKey
    ).toString();
  }

 
  increaseReputation(amount = 1) {
    this.reputation += amount;
    this.validatedBlocks++;
  }

  
  decreaseReputation(amount = 10) {
    this.reputation = Math.max(0, this.reputation - amount);
  }
}


class ProofOfAuthority {
  constructor(minimumValidators = 2) {
    this.validators = new Map();
    this.minimumValidators = minimumValidators;
    this.validationThreshold = 0.51;  // 51% must approve
  }

  
  addValidator(validator) {
    this.validators.set(validator.id, validator);
    console.log(`✓ Validator added: ${validator.name} (${validator.id})`);
  }

  
  removeValidator(validatorId) {
    const validator = this.validators.get(validatorId);
    if (validator) {
      validator.isActive = false;
      console.log(`✗ Validator removed: ${validator.name}`);
    }
  }

  
  getActiveValidators() {
    return Array.from(this.validators.values()).filter(v => v.isActive);
  }

  async validateBlock(block, submission) {
    const activeValidators = this.getActiveValidators();
    
    
    if (activeValidators.length < this.minimumValidators) {
      throw new Error(
        `Insufficient validators: ${activeValidators.length}/${this.minimumValidators} required`
      );
    }

    const validations = [];
    
    
    for (const validator of activeValidators) {
      const isValid = this.validatorChecksBlock(block, submission, validator);
      
      if (isValid) {
        const signature = validator.signBlock(block.hash);
        validations.push({
          validatorId: validator.id,
          validatorName: validator.name,
          signature: signature,
          timestamp: Date.now()
        });
      }
    }

    // Calculate approval rate
    const approvalRate = validations.length / activeValidators.length;
    const consensusReached = approvalRate >= this.validationThreshold;

    if (consensusReached) {
      // Update block with validator signatures
      block.validatorSignatures = validations;
      block.consensusReached = true;
      
      
      validations.forEach(v => {
        const validator = this.validators.get(v.validatorId);
        if (validator) {
          validator.increaseReputation();
        }
      });

      console.log(`✅ Consensus reached: ${validations.length}/${activeValidators.length} validators approved`);
      
      return {
        success: true,
        approvalRate: approvalRate,
        validations: validations,
        message: `Consensus reached with ${(approvalRate * 100).toFixed(0)}% approval`
      };
    }

    console.log(`❌ Consensus failed: ${validations.length}/${activeValidators.length} validators approved`);
    
    return {
      success: false,
      approvalRate: approvalRate,
      validations: validations,
      message: `Insufficient approval: ${(approvalRate * 100).toFixed(0)}% (need ${(this.validationThreshold * 100).toFixed(0)}%)`
    };
  }

  /**
   * Validator checks if block is valid
   * This is where validation rules are defined
   */
  validatorChecksBlock(block, submission, validator) {
    try {
      // Rule 1: Block integrity
      if (block.hash !== block.calculateHash()) {
        console.log(`❌ ${validator.name}: Block hash invalid`);
        return false;
      }
      
      // Rule 2: Submission has required reviews
      if (submission.reviews.length < 2) {
        console.log(`❌ ${validator.name}: Insufficient reviews`);
        return false;
      }
      
      // Rule 3: Submission is verified
      if (!submission.isVerified()) {
        console.log(`❌ ${validator.name}: Submission not verified`);
        return false;
      }
      
      // Rule 4: Previous hash exists
      if (!block.previousHash || block.previousHash === '') {
        console.log(`❌ ${validator.name}: No previous hash`);
        return false;
      }
      
      // Rule 5: Valid timestamp
      if (block.timestamp > Date.now()) {
        console.log(`❌ ${validator.name}: Future timestamp`);
        return false;
      }
      
      // Rule 6: Data integrity
      if (!submission.submissionId) {
        console.log(`❌ ${validator.name}: Missing submission ID`);
        return false;
      }

      console.log(`✅ ${validator.name}: Block is valid`);
      return true;
      
    } catch (error) {
      console.log(`❌ ${validator.name}: Validation error - ${error.message}`);
      return false;
    }
  }

  /**
   * Get statistics for all validators
   */
  getValidatorStats() {
    return Array.from(this.validators.values()).map(v => ({
      id: v.id,
      name: v.name,
      reputation: v.reputation,
      validatedBlocks: v.validatedBlocks,
      isActive: v.isActive
    }));
  }

  /**
   * Get consensus configuration
   */
  getConfig() {
    return {
      minimumValidators: this.minimumValidators,
      validationThreshold: this.validationThreshold,
      activeValidators: this.getActiveValidators().length,
      totalValidators: this.validators.size
    };
  }
}

module.exports = { Validator, ProofOfAuthority };