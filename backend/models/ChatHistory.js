import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "AI", "blocked"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false, timestamps: false }
);

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChatHistory", chatHistorySchema);