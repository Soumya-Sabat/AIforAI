import express from "express";
import multer from "multer";
import path from "path";

import {
  submitReport,
  getAllReports,
  addPeerReview,
  addAdminReview
} from "../controllers/reportController.js";

import { protect, authorize } from "../middlewares/Auth.js";

const router = express.Router();

/*MULTER CONFIG*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos");
  },
  filename: (req, file, cb) => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    cb(
      null,
      `${dateStr}-${Math.round(Math.random() * 1e9)}${path.extname(
        file.originalname
      )}`
    );
  }
});

const upload = multer({ storage });

/*USER SUBMIT REPORT*/

router.post(
  "/submit",
  protect,
  authorize("user"),
  upload.single("video"),
  submitReport
);

/*ADMIN & PEER VIEW ALL REPORTS*/

router.get(
  "/all",
  protect,
  authorize("admin", "peer"),
  getAllReports
);

/*PEER REVIEW */

router.post(
  "/peer-review/:id",
  protect,
  authorize("peer"),
  addPeerReview
);

/*ADMIN FINAL REVIEW */

router.post(
  "/admin-review/:id",
  protect,
  authorize("admin"),
  addAdminReview
);

export default router;