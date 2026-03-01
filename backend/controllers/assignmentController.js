// import Assignment from "../models/Assignment.js";
// import Report from "../models/Report.js";
// /* ADMIN – ASSIGN REPORT TO PEERS */
// export const assignPeers = async (req, res) => {
//   try {
//     const { reportId, peers, deadline } = req.body;

//     if (!reportId || !peers?.length || !deadline) {
//       return res.status(400).json({ message: "Missing fields" });
//     }


//     const existingAssignments = await Assignment.find({
//       report: reportId,
//       reviewer: { $in: peers }
//     });

//     const alreadyAssigned = existingAssignments.map(a => a.reviewer.toString());


//     const newPeers = peers.filter(p => !alreadyAssigned.includes(p));

//     if (newPeers.length === 0) {
//       return res.status(409).json({
//         message: "Selected peers are already assigned"
//       });
//     }

//     await Promise.all(
//       newPeers.map(peerId =>
//         Assignment.create({
//           report: reportId,
//           reviewer: peerId,
//           assignedBy: req.user._id,
//           deadline
//         })
//       )
//     );

//    await Report.findByIdAndUpdate(reportId, {
//       isAssigned: true
//     });
    
//     res.status(201).json({ message: "Peers assigned successfully" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Assignment failed" });
//   }
// };



// /* PEER – GET MY ASSIGNMENTS */
// export const getPeerAssignments = async (req, res) => {
//   try {
//     const assignments = await Assignment.find({
//       reviewer: req.user._id
//     })
//       .populate("report")
//       .sort({ deadline: 1 });

//     res.json(assignments);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch assignments" });
//   }
// };


// /* MARK ASSIGNMENT COMPLETE */
// /* PEER – COMPLETE REVIEW */
// export const completeAssignment = async (req, res) => {
//   try {
//     const { status, feedback } = req.body;

//     const assignment = await Assignment.findById(req.params.id);

//     if (!assignment)
//       return res.status(404).json({ message: "Assignment not found" });

//     if (!assignment.reviewer.equals(req.user._id))
//       return res.status(403).json({ message: "Unauthorized" });

//     assignment.reviewDecision = status;
//     assignment.feedback = feedback;
//     assignment.status = "completed";
//     assignment.reviewedAt = new Date();

//     await assignment.save();

//     res.json(assignment);
//   } catch (err) {
//     res.status(500).json({ message: "Review submission failed" });
//   }
// };

