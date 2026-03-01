import axios from "axios";
import ChatHistory from "../models/ChatHistory.js";


async function checkSafety(prompt) {
  await new Promise((r) => setTimeout(r, 600));

  const badWords = [
    "malicious"
  ];
  if (badWords.some((w) => prompt.toLowerCase().includes(w))) return true;

  return Math.random() < 0.15;
}


const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
];

async function callGemini(prompt, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your gemini api key here") {
    throw new Error("GEMINI_API_KEY is not set. Add it to your .env file.");
  }

  // Only pass user/AI messages to Gemini (not blocked ones)
  const contents = [
    ...history
      .filter((m) => m.role === "user" || m.role === "AI")
      .map((m) => ({
        role: m.role === "AI" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    { role: "user", parts: [{ text: prompt }] },
  ];

  const body = {
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  };

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log(`Gemini trying model: ${model}`);

      const { data } = await axios.post(url, body, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      });

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`[Gemini]  Success with model: ${model}`);
        return text;
      }
      throw new Error("Empty response from model");
    } catch (err) {
      const status = err?.response?.status;
      const errMsg = err?.response?.data?.error?.message || err.message;
      console.log(`Gemini ${model} failed (${status || "network"}): ${errMsg}`);
      lastError = err;
      continue;
    }
  }

  const status = lastError?.response?.status;
  const apiMsg = lastError?.response?.data?.error?.message;

  if (status === 400 && apiMsg?.includes("API_KEY")) {
    throw new Error("Invalid Gemini API key. Check your GEMINI_API_KEY in .env");
  }
  if (status === 429) {
    throw new Error("Gemini API quota exceeded. Get a new key from https://aistudio.google.com/app/apikey");
  }
  throw new Error(apiMsg || lastError?.message || "All Gemini models failed.");
}


// GET /api/chatbot/history
// Returns the full chat history for the logged-in user
export const getHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({ user: req.user._id });

    return res.status(200).json({
      success: true,
      messages: chatHistory ? chatHistory.messages : [],
    });
  } catch (error) {
    console.error("[History Error]", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load history",
      details: error.message,
    });
  }
};

//DELETE /api/chatbot/history
// Clears the chat history for the logged-in user
export const clearHistory = async (req, res) => {
  try {
    await ChatHistory.findOneAndUpdate(
      { user: req.user._id },
      { messages: [] },
      { upsert: true }
    );

    return res.status(200).json({ success: true, message: "History cleared" });
  } catch (error) {
    console.error("[Clear History Error]", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to clear history",
      details: error.message,
    });
  }
};

// ── POST /api/chatbot/chat
export const chat = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ success: false, message: "prompt is required" });
  }

  try {
    // Step 1 — Load this user's history from MongoDB
    let chatDoc = await ChatHistory.findOne({ user: req.user._id });
    if (!chatDoc) {
      chatDoc = await ChatHistory.create({ user: req.user._id, messages: [] });
    }
    const history = chatDoc.messages;

    // Step 2 — Safety check
    console.log(`[Safety] Checking: "${prompt.slice(0, 60)}"`);
    const isMalicious = await checkSafety(prompt);

    if (isMalicious) {
      console.log("BLOCKED");

      // Save blocked message to history too (so user can see it later)
      chatDoc.messages.push({ role: "user", content: prompt });
      chatDoc.messages.push({
        role: "blocked",
        content: "We can't give you any output regarding what you ask for.",
      });
      // Keep last 100 messages max
      if (chatDoc.messages.length > 100) {
        chatDoc.messages = chatDoc.messages.slice(-100);
      }
      await chatDoc.save();

      return res.status(200).json({
        success: true,
        blocked: true,
        reply: "We can't give you any output regarding what you ask for.",
      });
    }

    // Step 3— Call Gemini
    console.log("[Safety]  PASSED → Calling Gemini...");
    const reply = await callGemini(prompt, history);

    // Step 4 — Save both messages to MongoDB
    chatDoc.messages.push({ role: "user", content: prompt });
    chatDoc.messages.push({ role: "AI", content: reply });
    // Keep last 100 messages max
    if (chatDoc.messages.length > 100) {
      chatDoc.messages = chatDoc.messages.slice(-100);
    }
    await chatDoc.save();

    return res.status(200).json({ success: true, blocked: false, reply });
  } catch (error) {
    console.error("[Chatbot Error]", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

// POST (/api/chatbotinterface/safety-check)
export const safetyCheck = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, message: "prompt is required" });
  }
  try {
    const isMalicious = await checkSafety(prompt);
    return res.status(200).json({ success: true, isMalicious });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Safety model error",
      details: error.message,
    });
  }
};

