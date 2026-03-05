// core/submission.js
// COMPLETE FILE - Replace your entire submission.js with this

const crypto = require('crypto-js');

/**
 * Submission - Modified to handle video with text description
 */
class Submission {
  constructor(actorId, description, videoData = null, fileName = null) {
    this.submissionId = this.generateId();
    this.actorId = actorId;
    this.description = description;      // Text description (always required)
    this.videoData = null;                // Video data (will be null after IPFS upload)
    this.videoMetadata = null;            // IPFS metadata for the video
    this.fileName = fileName;
    
    this.timestamp = Date.now();
    this.status = 'pending';              // 'pending', 'verified', 'rejected'
    this.reviews = [];                    // Array of reviews
    this.certificate = null;              // Generated after verification
  }

  /**
   * Generate unique submission ID
   */
  generateId() {
    return crypto.SHA256(
      Date.now() + Math.random().toString()
    ).toString().substring(0, 16);
  }

  /**
   * Add review from a peer reviewer
   */
  addReview(reviewerId, approved, comments) {
    this.reviews.push({
      reviewerId,
      approved,
      comments,
      timestamp: Date.now()
    });
  }

  /**
   * Check if submission is verified
   */
  isVerified(requiredApprovals = 2) {
    const approvals = this.reviews.filter(r => r.approved).length;
    return approvals >= requiredApprovals;
  }

  /**
   * Generate certificate after verification
   */
  generateCertificate() {
    if (!this.isVerified()) {
      return null;
    }

    this.certificate = {
      certificateId: crypto.SHA256(
        this.submissionId + Date.now()
      ).toString(),
      submissionId: this.submissionId,
      actorId: this.actorId,
      description: this.description,
      issuedAt: Date.now(),
      reviewers: this.reviews.map(r => r.reviewerId),
      videoHash: this.videoMetadata?.ipfsCID || null,
      ipfsUrl: this.videoMetadata?.ipfsUrl || null,
      hash: crypto.SHA256(JSON.stringify(this)).toString()
    };
    
    this.status = 'verified';
    return this.certificate;
  }

  /**
   * Set video metadata after IPFS upload
   */
  setVideoMetadata(metadata) {
    this.videoMetadata = metadata;
    // Clear video data after upload to save space
    this.videoData = null;
  }

  /**
   * Get submission summary
   */
  getSummary() {
    return {
      submissionId: this.submissionId,
      actorId: this.actorId,
      description: this.description.substring(0, 100) + (this.description.length > 100 ? '...' : ''),
      hasVideo: !!this.videoMetadata,
      status: this.status,
      reviews: this.reviews.length,
      approvals: this.reviews.filter(r => r.approved).length,
      rejections: this.reviews.filter(r => !r.approved).length,
      hasCertificate: !!this.certificate,
      ipfsCID: this.videoMetadata?.ipfsCID || null,
      ipfsUrl: this.videoMetadata?.ipfsUrl || null
    };
  }

  /**
   * Get full details for blockchain storage
   */
  getBlockchainData() {
    return {
      submissionId: this.submissionId,
      actorId: this.actorId,
      description: this.description,
      videoMetadata: this.videoMetadata,
      fileName: this.fileName,
      timestamp: this.timestamp,
      status: this.status,
      reviews: this.reviews,
      certificate: this.certificate
    };
  }
}

module.exports = Submission;