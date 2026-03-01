import mongoose from "mongoose";
import Counter from "./Counter.js";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      required: true,
      default: "pending"
    },
    feedback: {
      type: String,
      required: true,
      default: ""
    },
    reviewedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true
    },
    reportId: {
      type: String,
      unique: true
    },
    description: {
      type: String
    },
    videoUrl: {
      type: String,
      required: true
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    peerReviews: {
      type: [reviewSchema],
      default: []
    }
  },
  { timestamps: true }
);

reportSchema.pre("save", async function () {
  if (this.reportId) return;

  const counter = await Counter.findOneAndUpdate(
    { name: "report" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  this.reportId = `AFA-${String(counter.seq).padStart(4, "0")}`;
  
});

export default mongoose.model("Report", reportSchema);