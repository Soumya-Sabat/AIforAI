class PeerReviewer {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.reviewCount = 0;
    this.approvalRate = 0;
  }

  reviewSubmission(submission, approved, comments) {
    if (submission.actorId === this.id) {
      throw new Error('Cannot review your own submission');
    }

    submission.addReview(this.id, approved, comments);
    this.reviewCount++;

    return {
      reviewerId: this.id,
      submissionId: submission.submissionId,
      approved,
      comments,
      timestamp: Date.now()
    };
  }

  calculateApprovalRate(reviews) {
    if (reviews.length === 0) return 0;
    const approved = reviews.filter(r => r.approved).length;
    this.approvalRate = (approved / reviews.length) * 100;
    return this.approvalRate;
  }
}


class ReviewManager {
  constructor(blockchain, totalReviewers = 3) {
    this.blockchain = blockchain;
    this.totalReviewers = totalReviewers; // Total number of reviewers available
    this.pendingSubmissions = new Map();
  }

  submitForReview(submission) {
    this.pendingSubmissions.set(submission.submissionId, submission);
    console.log(`📝 New submission: ${submission.submissionId} (${submission.mediaType})`);
    console.log(`   Waiting for ${this.totalReviewers} reviews...`);
    return submission.submissionId;
  }

  async processReview(submissionId, reviewer, approved, comments) {
    const submission = this.pendingSubmissions.get(submissionId);
    
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Check if reviewer already reviewed
    const alreadyReviewed = submission.reviews.some(
      r => r.reviewerId === reviewer.id
    );
    
    if (alreadyReviewed) {
      throw new Error('You have already reviewed this submission');
    }

    // Add the review
    const review = reviewer.reviewSubmission(submission, approved, comments);
    console.log(`Review added by ${reviewer.name}: ${approved ? '✅ Approved' : '❌ Rejected'}`);

    // Show progress
    console.log(`   Reviews: ${submission.reviews.length}/${this.totalReviewers}`);

    // Wait for ALL reviewers before finalizing
    if (submission.reviews.length >= this.totalReviewers) {
      return await this.finalizeSubmission(submission);
    }

    return {
      status: 'pending',
      reviewsReceived: submission.reviews.length,
      reviewsRemaining: this.totalReviewers - submission.reviews.length,
      message: `Waiting for ${this.totalReviewers - submission.reviews.length} more review(s)`,
      currentApprovals: submission.reviews.filter(r => r.approved).length,
      currentRejections: submission.reviews.filter(r => !r.approved).length
    };
  }

  /**
   * Finalize submission after ALL reviews are received
   * Uses majority voting: need at least 2 approvals out of 3
   */
  async finalizeSubmission(submission) {
    const totalReviews = submission.reviews.length;
    const approvals = submission.reviews.filter(r => r.approved).length;
    const rejections = submission.reviews.filter(r => !r.approved).length;
    
    console.log(`\n📊 All reviews received for ${submission.submissionId}`);
    console.log(`   Approvals: ${approvals}/${totalReviews}`);
    console.log(`   Rejections: ${rejections}/${totalReviews}`);
    
    // Majority voting: need at least 2 approvals
    const majorityNeeded = Math.ceil(totalReviews / 2); // For 3 reviewers: 2 needed
    
    if (approvals >= majorityNeeded) {
      // APPROVED: Has majority
      console.log(`✅ Submission APPROVED with majority (${approvals}/${totalReviews})`);
      
      // Generate certificate
      const certificate = submission.generateCertificate();
      
      // Create block
      const Block = require('./block');
      const block = new Block(
        this.blockchain.chain.length,
        Date.now(),
        {
          type: 'verified_submission',
          submission: submission,
          certificate: certificate
        }
      );
      
      // Add to blockchain with consensus
      const consensusResult = await this.blockchain.addBlockWithConsensus(
        block,
        submission
      );

      if (consensusResult.success) {
        this.pendingSubmissions.delete(submission.submissionId);

        return {
          status: 'verified',
          decision: 'approved',
          certificate: certificate,
          blockIndex: this.blockchain.chain.length - 1,
          blockHash: block.hash,
          consensus: consensusResult.consensus,
          validators: consensusResult.consensus.validations.length,
          approvals: approvals,
          rejections: rejections,
          totalReviews: totalReviews,
          message: `Submission APPROVED with ${approvals}/${totalReviews} approvals (majority reached)`
        };
      } else {
        return {
          status: 'rejected',
          decision: 'consensus_failed',
          reason: 'Consensus not reached on blockchain',
          info: consensusResult.consensus.message,
          approvals: approvals,
          rejections: rejections,
          totalReviews: totalReviews
        };
      }
      
    } else {
      // REJECTED: Does not have majority
      console.log(`❌ Submission REJECTED - insufficient approvals (${approvals}/${totalReviews})`);
      
      submission.status = 'rejected';
      this.pendingSubmissions.delete(submission.submissionId);
      
      return {
        status: 'rejected',
        decision: 'insufficient_approvals',
        reason: 'Did not receive majority approval',
        info: `Only ${approvals}/${totalReviews} reviewers approved (need ${majorityNeeded})`,
        message: `Submission REJECTED with only ${approvals}/${totalReviews} approvals`,
        approvals: approvals,
        rejections: rejections,
        totalReviews: totalReviews
      };
    }
  }

  getPendingSubmissions() {
    return Array.from(this.pendingSubmissions.values());
  }

  getSubmission(submissionId) {
    return this.pendingSubmissions.get(submissionId);
  }

  /**
   * Get review statistics
   */
  getStats() {
    const pending = this.pendingSubmissions.size;
    const total = this.blockchain.chain.length - 1;
    
    // Calculate how many pending submissions need more reviews
    let needingReviews = 0;
    this.pendingSubmissions.forEach(sub => {
      if (sub.reviews.length < this.totalReviewers) {
        needingReviews++;
      }
    });
    
    return {
      pendingSubmissions: pending,
      verifiedSubmissions: total,
      totalReviewers: this.totalReviewers,
      submissionsNeedingReviews: needingReviews
    };
  }
}

module.exports = { PeerReviewer, ReviewManager };