import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reportRoutes from "./routes/reportRoutes.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
// import assignmentRoutes from "./routes/assignmentRoutes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";

// POST /api/AI_FOR_AI/chatbot/chat
const chat = async (req, res) => {
  const { prompt, history } = req.body;
  // For testing, we just echo back the prompt with a dummy reply
  res.json({
    success: true,
    blocked: false,
    reply: `Echo: "${prompt}". (This is a dummy response from the chatbot.)`,
  });
};

// POST /api/AI_FOR_AI/chatbot/safety-check
import path from 'path';
import { fileURLToPath } from "url";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/api/chatbot", chatbotRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
// app.use("/api/assignments", assignmentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend running...");
});


// Start server
app.listen(process.env.PORT, () => {
  console.log("Server running on port 5000");
});
