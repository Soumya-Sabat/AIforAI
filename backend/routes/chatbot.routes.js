import express from "express";
import { chat, safetyCheck, getHistory, clearHistory } from "../controllers/chatbot.controller.js";
import { protect } from "../middlewares/Auth.js";

const router = express.Router();

// All routes protected — user must be logged in
router.use(protect);

// POST /api/chatbot/chat
router.post("/chat", chat);

// GET  /api/chatbot/history  — load history on page open
router.get("/history", getHistory);

// DELETE /api/chatbot/history  — clear chat
router.delete("/history", clearHistory);

// POST /api/chatbot/safety-check
router.post("/safety-check", safetyCheck);


export default router;