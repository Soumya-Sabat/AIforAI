import express from "express";
import { signup, login } from "../controllers/authController.js";
import User from "../models/User.js";
import { protect, authorize } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/create-user", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    if (!["peer", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    // Check if email exists
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    // Create user (password hashing happens in User.js)
    const user = await User.create({
      name,
      email,
      password,
      role,
      createdBy: req.user._id, // who created this user
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
});

export default router;
