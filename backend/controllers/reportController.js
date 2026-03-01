

import Report from "../models/Report.js";
import Counter from "../models/Counter.js";
import Review from "../models/Review.js";

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("submittedBy", "name email role")
      .sort({ createdAt: -1 });

    const reportsWithReviews = await Promise.all(
      reports.map(async (report) => {

        // Generate reportId if missing
        if (!report.reportId) {
          const counter = await Counter.findOneAndUpdate(
            { name: "report" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
          );

          report.reportId = `AFA-${String(counter.seq).padStart(4, "0")}`;
          await report.save();
        }

        // Fetch all reviews for this report
        const reviews = await Review.find({ report: report._id })
          .populate("reviewedBy", "name email role");

        return {
          ...report.toObject(),
          reviews
        };
      })
    );

    res.json(reportsWithReviews);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* USER SUBMIT REPORT */
export const submitReport = async (req, res) => {
  try {
    const { prompt, description } = req.body;

    if (!req.file)
      return res.status(400).json({ message: "Video required" });

    const report = await Report.create({
      prompt,
      description,
      videoUrl: req.file.filename,
      submittedBy: req.user._id
    });

    res.status(201).json(report);
  } catch (err) {
  console.error("SUBMIT ERROR:", err);
  res.status(500).json({ message: err.message });
}
};

/* get all */



export const addPeerReview = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!remarks || remarks.trim().length < 3)
      return res.status(400).json({ message: "Feedback required" });

    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const report = await Report.findById(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Report not found" });

    // prevent duplicate review
    const existingReview = await Review.findOne({
      report: report._id,
      reviewedBy: req.user._id,
    });

    if (existingReview)
      return res.status(400).json({ message: "You already reviewed this report" });

    // create review document
    const review = await Review.create({
      report: report._id,
      reviewedBy: req.user._id,
      status,
      remarks,
      reviewType: "peer",
    });

    res.json({
      message: "Peer review submitted successfully",
      review,
    });

  } catch (err) {
    console.error("REVIEW ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const addAdminReview = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!remarks || remarks.trim().length < 3)
      return res.status(400).json({ message: "Feedback required" });

    const report = await Report.findById(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Report not found" });

    const review = await Review.create({
      report: report._id,
      reviewedBy: req.user._id,
      status,
      remarks,
      reviewType: "admin"
    });

    // Only admin controls final report status
    report.status = status;
    await report.save();

    res.json({
      message: "Admin review completed",
      review,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// export const finalDecision = async (req, res) => {
//   const { finalStatus, finalFeedback } = req.body;

//   if (!finalFeedback)
//     return res.status(400).json({ message: "Feedback required" });

//   const report = await Report.findById(req.params.id);
//   if (!report)
//     return res.status(404).json({ message: "Report not found" });

//   report.finalStatus = finalStatus;
//   report.finalFeedback = finalFeedback;
//   report.finalReviewedBy = req.user._id;

//   await report.save();
//   res.json({ message: "Final decision recorded" });
// };
