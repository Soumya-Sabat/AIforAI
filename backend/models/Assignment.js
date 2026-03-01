// // import mongoose from "mongoose";

// // const assignmentSchema = new mongoose.Schema(
// //   {
// //     report: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Report",
// //       required: true
// //     },

// //     peer: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //       required: true
// //     },

// //     assignedBy: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //       required: true
// //     },

// //     deadline: {
// //       type: Date,
// //       required: true
// //     },

// //     status: {
// //       type: String,
// //       enum: ["assigned", "completed", "expired"],
// //       default: "assigned"
// //     },

// //     reviewedAt: {
// //       type: Date
// //     }
// //   },
// //   { timestamps: true }
// // );

// // /* Prevent duplicate assignment */
// // assignmentSchema.index({ report: 1, peer: 1 }, { unique: true });

// // export default mongoose.model("Assignment", assignmentSchema);


// import mongoose from "mongoose";

// const assignmentSchema = new mongoose.Schema(
//   {
//     report: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Report",
//       required: true
//     },

//     reviewer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     assignedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // admin
//       required: true
//     },

//     status: {
//       type: String,
//       enum: ["assigned", "in_review", "completed"],
//       default: "assigned"
//     },

//     reviewDecision: {
//       type: String,
//       enum: ["approved", "rejected", "revision"],
//     },

//     feedback: {
//       type: String
//     },

//     deadline: {
//       type: Date,
//       required: true
//     },

//     reviewedAt: {
//       type: Date
//     }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Assignment", assignmentSchema);
