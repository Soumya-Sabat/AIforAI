import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";


console.log("Admin created");
/* USER SIGNUP (ONLY ROLE = user) */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    

    const user = await User.create({
      name,
      email,
      password,
      role: "user"
    });

    res.status(201).json({
      token: generateToken(user),
      user: {
        id: user.userID,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
};

/* LOGIN (ALL ROLES) */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await user.matchPassword(password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({
      token: generateToken(user),
      user: {
        id: user.userID,
        _id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
