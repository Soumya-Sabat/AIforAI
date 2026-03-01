import User from "../models/User.js";

import Report from "../models/Report.js";
import Review from "../models/Review.js";

export const getPeerMetrics = async (req, res) => {
  try {
    const peerId = req.params.peerId;

    const peer = await User.findOne({ userID: peerId, role: "peer" });
    if (!peer)
      return res.status(404).json({ message: "Peer not found" });

    if (!peer.isActive)
      return res.status(403).json({ message: "Peer is inactive" });

    const reviews = await Review.find({
      reviewedBy: peer._id,
      reviewType: "peer"
    });

    const reviewCount = reviews.length;

    const approvedCount = reviews.filter(
      r => r.status === "approved"
    ).length;

    res.json({
      peerId,
      reviewCount,
      correctnessPercentage:
        reviewCount ? (approvedCount / reviewCount) * 100 : 0
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();

    // Admin reviews determine final decision
    const approvedReports = await Review.countDocuments({
      reviewType: "admin",
      status: "approved"
    });

    const rejectedReports = await Review.countDocuments({
      reviewType: "admin",
      status: "rejected"
    });

    const pendingReports = totalReports - (approvedReports + rejectedReports);

    const totalPeers = await User.countDocuments({ role: "peer" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalUsers = await User.countDocuments({ role: "user" });

    res.json({
      totalSubmissions: totalReports,
      pendingReviews: pendingReports,
      maliciousReports: rejectedReports,
      safeReports: approvedReports,
      peerCount: totalPeers,
      adminCount: totalAdmins,
      totalUsers
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

export const getReviewerPerformance = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewType: "peer" })
      .populate("reviewedBy", "name");

    const performance = {};

    reviews.forEach(review => {
      if (!review.reviewedBy) return;

      const reviewerId = review.reviewedBy._id.toString();

      if (!performance[reviewerId]) {
        performance[reviewerId] = {
          reviewerId,
          name: review.reviewedBy.name,
          reviewCount: 0
        };
      }

      performance[reviewerId].reviewCount++;
    });

    res.json(Object.values(performance));

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviewer performance" });
  }
};

export const getReviewOutcomes = async (req, res) => {
  try {
    const adminReviews = await Review.find({ reviewType: "admin" });

    const outcomes = {
      approved: 0,
      rejected: 0,
      pending: 0
    };

    adminReviews.forEach(review => {
      if (review.status === "approved") outcomes.approved++;
      else if (review.status === "rejected") outcomes.rejected++;
    });

    const totalReports = await Report.countDocuments();
    outcomes.pending = totalReports - (outcomes.approved + outcomes.rejected);

    res.json(outcomes);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch review outcomes" });
  }
};



/* CREATE PEER OR ADMIN */
export const createTeamMember = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["peer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "User already exists" });

    // const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      message: `${role} created successfully`,
      user: {
        id: user.userID,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } 
    catch (err) {
    console.error("CREATE USER FULL ERROR ↓↓↓");
    console.error(err);
    console.error("STACK:", err.stack);

    res.status(500).json({
      message: err.message
    });
  }
  
};

/* GET ALL TEAM MEMBERS */
export const getTeamMembers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["peer", "admin"] }
    }).select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch team members" });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: "User status updated",
      isActive: user.isActive
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

