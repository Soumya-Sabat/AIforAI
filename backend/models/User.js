import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    userID:{
      type: String,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "peer", "admin"],
      default: "user"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);
userSchema.pre("save", async function () {
  if (!this.userID) {
    const random = crypto.randomBytes(3).toString("hex").toUpperCase();
    this.userID = `USR-${new Date().getFullYear()}-${random}`;
  }

  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});



userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Optional: Check if user is admin/peer
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

userSchema.methods.isPeer = function () {
  return this.role === "peer";
};

export default mongoose.model("User", userSchema);
