// run-node.js - Start a blockchain node with P2P
const BlockchainModule = require('./index');
const P2PNode = require('./network/p2pNetwork');
const readline = require('readline');

// Get port from command line argument
const args = process.argv.slice(2);
const port = args[0] ? parseInt(args[0]) : 6001;
const connectTo = args.slice(1); // Other nodes to connect to

// Colors for console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function startNode() {
  console.clear();
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  BLOCKCHAIN NODE - Port ${port}`, 'bright');
  log('='.repeat(60), 'cyan');

  // Initialize blockchain
  const blockchain = new BlockchainModule({
    storage: {
      mediaStorage: 'ipfs', // Changed to IPFS
      paths: {
        blockchain: `./data/node-${port}/blockchain`,
        media: `./data/node-${port}/media`,
        temp: `./data/node-${port}/temp`
      }
    }
  });

  await blockchain.initialize();

  // Create P2P node
  const p2pNode = new P2PNode(port, null, blockchain.blockchain);
  p2pNode.startServer();

  // Connect to other nodes
  if (connectTo.length > 0) {
    log(`\n🔗 Connecting to other nodes...`, 'cyan');
    connectTo.forEach(address => {
      p2pNode.connectToPeer(address);
    });
  } else {
    log(`\n💡 This is the first node (no peers to connect to)`, 'yellow');
    log(`   Other nodes can connect to: ws://localhost:${port}`, 'yellow');
  }

  // Setup interactive commands
  setupCommands(blockchain, p2pNode);

  // Intercept blockchain operations to broadcast
  const originalAddBlock = blockchain.blockchain.addBlockWithConsensus.bind(blockchain.blockchain);
  blockchain.blockchain.addBlockWithConsensus = async function(block, submission) {
    const result = await originalAddBlock(block, submission);
    if (result.success) {
      // Broadcast to network
      p2pNode.broadcastBlock(block);
    }
    return result;
  };

  // Show menu
  showMenu();
}

function setupCommands(blockchain, p2pNode) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\nnode> '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim().toLowerCase();

    try {
      switch(input) {
        case 'help':
        case 'menu':
          showMenu();
          break;

        case 'status':
          showStatus(blockchain, p2pNode);
          break;

        case 'peers':
          showPeers(p2pNode);
          break;

        case 'chain':
          showBlockchain(blockchain);
          break;

        case 'submit':
          await submitContent(blockchain , rl);
          break;

        case 'pending':
          showPending(blockchain);
          break;

        case 'review':
          await reviewSubmission(blockchain , rl);
          break;
          
        case 'upload':
          await vedioUploadIPFS(blockchain,rl);
          break;

        case 'sync':
          await p2pNode.syncWithNetwork();
          break;

        case 'clear':
          console.clear();
          showMenu();
          break;

        case 'exit':
        case 'quit':
          await shutdown(blockchain, p2pNode);
          process.exit(0);
          break;

        default:
          log(`Unknown command: ${input}`, 'yellow');
          log(`Type 'help' to see available commands`, 'yellow');
      }
    } catch (error) {
      log(`Error: ${error.message}`, 'yellow');
    }

    rl.prompt();
  });

  rl.on('close', async () => {
    await shutdown(blockchain, p2pNode);
    process.exit(0);
  });
}

function showMenu() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  AVAILABLE COMMANDS', 'bright');
  log('='.repeat(60), 'cyan');
  log('  status   - Show blockchain and node status', 'cyan');
  log('  peers    - Show connected peers', 'cyan');
  log('  chain    - Show blockchain summary', 'cyan');
  log('  submit   - Submit new content', 'cyan');
  log('  pending  - Show pending submissions', 'cyan');
  log('  review   - Review a submission', 'cyan');
  log('  upload   - Uplaod to the IFPS', 'cyan');
  log('  sync     - Sync with network', 'cyan');
  log('  clear    - Clear screen', 'cyan');
  log('  help     - Show this menu', 'cyan');
  log('  exit     - Shutdown node', 'cyan');
  log('='.repeat(60), 'cyan');
}

function showStatus(blockchain, p2pNode) {
  const status = blockchain.getStatus();
  const peers = p2pNode.getConnectedPeers();

  log('\n' + '='.repeat(60), 'cyan');
  log('  NODE STATUS', 'bright');
  log('='.repeat(60), 'cyan');
  log(`  Port: ${p2pNode.port}`, 'green');
  log(`  Node ID: ${p2pNode.nodeId}`, 'green');
  log(`  Connected Peers: ${peers.length}`, 'green');
  log('', 'reset');
  log('  BLOCKCHAIN STATUS', 'bright');
  log('─'.repeat(60), 'cyan');
  log(`  Total Blocks: ${status.totalBlocks}`, 'green');
  log(`  Verified Submissions: ${status.verifiedSubmissions}`, 'green');
  log(`  Pending Submissions: ${status.review.pendingSubmissions}`, 'green');
  log(`  Active Validators: ${status.consensus.activeValidators}`, 'green');
  log(`  Chain Valid: ${status.isValid ? '✅' : '❌'}`, 'green');
  log('='.repeat(60), 'cyan');
}

function showPeers(p2pNode) {
  const peers = p2pNode.getConnectedPeers();

  log('\n' + '='.repeat(60), 'cyan');
  log('  CONNECTED PEERS', 'bright');
  log('='.repeat(60), 'cyan');

  if (peers.length === 0) {
    log('  No peers connected', 'yellow');
  } else {
    peers.forEach((peer, i) => {
      log(`  ${i + 1}. Node ID: ${peer.nodeId}`, 'green');
      log(`     Chain Length: ${peer.chainLength}`, 'green');
      log(`     Connected: ${peer.connected ? '✅' : '❌'}`, 'green');
      log('', 'reset');
    });
  }
  log('='.repeat(60), 'cyan');
}

function showBlockchain(blockchain) {
  const summary = blockchain.getBlockchainSummary();

  log('\n' + '='.repeat(60), 'cyan');
  log('  BLOCKCHAIN SUMMARY', 'bright');
  log('='.repeat(60), 'cyan');

  summary.forEach(block => {
    log(`  Block ${block.index}:`, 'bright');
    log(`    Hash: ${block.hash}`, 'cyan');
    log(`    Type: ${block.dataType}`, 'cyan');
    log(`    Consensus: ${block.consensusReached ? '✅' : '❌'}`, 'cyan');
    log(`    Validators: ${block.validators}`, 'cyan');
    log('', 'reset');
  });
  log('='.repeat(60), 'cyan');
}

// ============================================================
// MODIFIED: submitContent Function
// ============================================================
async function submitContent(blockchain, rl) {
  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

  log('\n' + '─'.repeat(60), 'cyan');
  log('  SUBMIT VIDEO WITH DESCRIPTION', 'bright');
  log('─'.repeat(60), 'cyan');

  // Get actor ID
  const actorId = await question('  Actor ID: ');
  
  // Get video file path
  const videoPath = await question('  Video file path: ');
  
  // Get file name (optional, will use from path if not provided)
  let fileName = await question('  Video file name (or press Enter to auto-detect): ');
  if (!fileName || fileName.trim() === '') {
    fileName = require('path').basename(videoPath);
  }
  
  // Get description (required)
  log('\n  📝 Enter description for this video:', 'cyan');
  const description = await question('  Description: ');

  // Validate inputs
  if (!actorId || !videoPath || !description) {
    log('\n❌ Error: All fields are required!', 'yellow');
    return;
  }

  try {
    log('\n  Processing...', 'cyan');
    log('  📹 Video will be uploaded to IPFS first', 'cyan');
    log('  📝 Description will be stored in blockchain', 'cyan');
    
    const submission = await blockchain.submitForReview({
      actorId,
      description: description,
      videoData: videoPath,
      fileName: fileName
    });

    log('\n' + '='.repeat(60), 'green');
    log('  ✅ SUBMISSION CREATED SUCCESSFULLY!', 'bright');
    log('='.repeat(60), 'green');
    log(`  Submission ID: ${submission.submissionId}`, 'green');
    log(`  Status: ${submission.status}`, 'green');
    log(`  Storage Type: ${submission.storageType.toUpperCase()}`, 'green');
    log('', 'reset');
    log('  📝 DESCRIPTION:', 'cyan');
    log(`     ${submission.description}`, 'cyan');
    log('', 'reset');
    
    if (submission.ipfsCID) {
      log('  🎥 VIDEO INFO:', 'cyan');
      log(`     IPFS CID: ${submission.ipfsCID}`, 'cyan');
      log(`     IPFS URL: ${submission.ipfsUrl}`, 'cyan');
      log('', 'reset');
      log('  📌 HOW IT WORKS:', 'yellow');
      log('     ✓ Video is stored on IPFS (decentralized)', 'yellow');
      log('     ✓ Only video hash (CID) is in blockchain', 'yellow');
      log('     ✓ Description is stored directly in blockchain', 'yellow');
      log('', 'reset');
      log('  🔗 VIEW YOUR VIDEO:', 'cyan');
      log(`     http://localhost:8080/ipfs/${submission.ipfsCID}`, 'cyan');
    } else {
      log('  📁 Video stored locally (IPFS not available)', 'yellow');
    }
    
    log('', 'reset');
    log('  📋 NEXT STEPS:', 'cyan');
    log(`     • ${submission.requiredReviews} reviewers need to approve`, 'cyan');
    log('     • Use "review" command to review this submission', 'cyan');
    log('     • Use "pending" to see all pending submissions', 'cyan');
    log('='.repeat(60), 'green');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'yellow');
    log('\n💡 Troubleshooting:', 'cyan');
    log('   • Make sure the video file exists', 'cyan');
    log('   • Check if IPFS daemon is running (ipfs id)', 'cyan');
    log('   • Verify file path is correct', 'cyan');
  }
}

// ============================================================
// MODIFIED: showPending Function
// ============================================================
function showPending(blockchain) {
  const pending = blockchain.getPendingSubmissions();

  log('\n' + '='.repeat(60), 'cyan');
  log('  PENDING SUBMISSIONS', 'bright');
  log('='.repeat(60), 'cyan');

  if (pending.length === 0) {
    log('  No pending submissions', 'yellow');
  } else {
    pending.forEach((sub, i) => {
      const summary = sub.getSummary();
      log(`  ${i + 1}. ${summary.submissionId}`, 'bright');
      log(`     Actor: ${summary.actorId}`, 'cyan');
      log(`     Description: ${summary.description}`, 'cyan');
      log(`     Video: ${summary.hasVideo ? '✅ On IPFS' : '❌ No video'}`, 'cyan');
      if (summary.ipfsCID) {
        log(`     IPFS CID: ${summary.ipfsCID}`, 'cyan');
        log(`     View at: http://localhost:8080/ipfs/${summary.ipfsCID}`, 'cyan');
      }
      log(`     Status: ${summary.status}`, 'cyan');
      log(`     Reviews: ${summary.reviews}/${blockchain.config.review.totalReviewers} (${summary.approvals} approved)`, 'cyan');
      log('', 'reset');
    });
  }
  log('='.repeat(60), 'cyan');
}

async function reviewSubmission(blockchain , rl) {
  const pending = blockchain.getPendingSubmissions();

  if (pending.length === 0) {
    log('\n⚠️  No pending submissions to review', 'yellow');
    return;
  }

  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

  showPending(blockchain);

  const submissionId = await question('\n  Submission ID: ');
  const reviewerId = await question('  Reviewer ID (reviewer1/reviewer2/reviewer3): ');
  const approved = await question('  Approve? (yes/no): ');
  const comments = await question('  Comments: ');

  const result = await blockchain.addReview(
    submissionId,
    reviewerId,
    approved.toLowerCase() === 'yes',
    comments
  );

  log(`\n✓ Review submitted!`, 'green');
  log(`  Status: ${result.status}`, 'green');
  
  if (result.status === 'verified') {
    log(`  Certificate: ${result.certificate.certificateId}`, 'green');
    log(`  Block Index: ${result.blockIndex}`, 'green');
  }
}

async function vedioUploadIPFS(blockchain, rl) {
  const { execSync } = require('child_process');

  log('\n' + '='.repeat(60), 'cyan');
  log('  UPLOAD VERIFIED VIDEOS TO IPFS MFS', 'bright');
  log('='.repeat(60), 'cyan');

  // Get all verified submissions from blockchain chain
  const verifiedBlocks = blockchain.blockchain.chain.filter(
    block => block.data?.certificate && block.data?.submission?.videoMetadata?.ipfsCID
  );

  if (verifiedBlocks.length === 0) {
    log('\n⚠️  No verified submissions found to upload.', 'yellow');
    log('   Make sure submissions are reviewed and approved first.', 'yellow');
    return;
  }

  log(`\n  Found ${verifiedBlocks.length} verified submission(s). Uploading...\n`, 'cyan');

  for (const block of verifiedBlocks) {
    const cid = block.data.submission.videoMetadata.ipfsCID;
    const submissionId = block.data.certificate.submissionId;

    try {
      // Direct upload to MFS root using submissionId as filename
      execSync(`ipfs files cp /ipfs/${cid} /${submissionId}.mp4`);

      log(`  ✅ Uploaded: ${submissionId}`, 'green');
      log(`     CID: ${cid}`, 'cyan');
      log(`     MFS Path: /${submissionId}`, 'cyan');
      log(`     View at: http://localhost:8080/ipfs/${cid}`, 'cyan');
      log('', 'reset');

    } catch (err) {
      if (err.message.includes('already exists')) {
        log(`  ⚠️  Already in MFS: ${submissionId}`, 'yellow');
      } else {
        log(`  ❌ Failed: ${submissionId} → ${err.message}`, 'yellow');
      }
    }
  }

  log('='.repeat(60), 'cyan');
}

async function shutdown(blockchain, p2pNode) {
  log('\n🛑 Shutting down node...', 'yellow');
  await blockchain.shutdown();
  p2pNode.shutdown();
  log('✓ Node shut down successfully\n', 'green');
}

// Start the node
startNode().catch(error => {
  console.error('\n💥 Failed to start node:', error.message);
  process.exit(1);
});