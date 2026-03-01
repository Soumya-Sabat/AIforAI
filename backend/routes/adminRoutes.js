import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, authorize } from "../middlewares/Auth.js";


import {
  getDashboardStats,
  getReviewerPerformance,
  getReviewOutcomes,
  getPeerMetrics,
  createTeamMember,
  getTeamMembers,
  toggleUserStatus
} from "../controllers/adminController.js";

const router = express.Router();




/* LIST ALL USERS */
router.get(
  "/users",
  protect,
  authorize("admin"),
  async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
  }
);
/* ADMIN ONLY */
router.post("/create-user", protect, authorize("admin"), createTeamMember);

router.get("/team", protect, authorize("admin"), getTeamMembers);
router.put("/toggle/:id", protect, authorize("admin"), toggleUserStatus);

router.get("/dashboard-stats", protect, authorize("admin"), getDashboardStats);
router.get("/reviewer-performance", protect, authorize("admin"), getReviewerPerformance);
router.get("/review-outcomes", protect, authorize("admin"), getReviewOutcomes);
router.get("/peer/:peerId/metrics", protect, authorize("admin"), getPeerMetrics);
export default router;
