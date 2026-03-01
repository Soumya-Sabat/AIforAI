import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
      index: true
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reviewType: {
      type: String,
      enum: ["peer", "admin"],
      required: true
    },

    status: {
      type: String,
      enum: ["approved", "rejected", "needs_changes"],
      required: true
    },

    remarks: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

/* Prevent same user reviewing same report twice */
reviewSchema.index(
  { report: 1, reviewedBy: 1 },
  { unique: true }
);

/* Allow only ONE admin review per report */
reviewSchema.index(
  { report: 1, reviewType: 1 },
  {
    unique: true,
    partialFilterExpression: { reviewType: "admin" }
  }
);

export default mongoose.model("Review", reviewSchema);