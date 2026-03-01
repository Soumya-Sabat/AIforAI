// import express from "express";
// import {
//   assignPeers,
//   getPeerAssignments,
//   completeAssignment
// } from "../controllers/assignmentController.js";

// import { protect, authorize } from "../middlewares/Auth.js";

// const router = express.Router();

// /* ADMIN */
// router.post(
//   "/assign",
//   protect,
//   authorize("admin"),
//   assignPeers
// );

// /* PEER */
// router.get(
//   "/my",
//   protect,
//   authorize("peer"),
//   getPeerAssignments
// );

// router.put(
//   "/complete/:id",
//   protect,
//   authorize("peer"),
//   completeAssignment
// );

// export default router;
