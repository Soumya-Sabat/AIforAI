import User from "./models/User.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    // prevent duplicate admin
    const exists = await User.findOne({ email: "xyz123@gmail.com" });
    if (exists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    await User.create({
      name: "Admin",
      email: "xyz123@gmail.com",
      password: "xyz123", // ✅ PLAIN TEXT ONLY
      role: "admin",
      isActive: true
    });

    console.log("Admin created successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
