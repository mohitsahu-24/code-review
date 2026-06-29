const generateContent = require("../services/ai.service");
const Review = require("../models/review.model");

function getReadableError(error) {
  const statusCode = error.status || error.statusCode || 500;
  const rawMessage = error.message || "Unknown error";

  if (statusCode === 429 || rawMessage.includes("RESOURCE_EXHAUSTED") || rawMessage.includes("rate_limit") || rawMessage.includes("429")) {
    return {
      statusCode: 429,
      payload: {
        error: "Groq quota exceeded",
        details: "Your Groq API rate limit is exhausted. Wait a moment and try again.",
      },
    };
  }

  if (statusCode === 401 || statusCode === 403 || rawMessage.includes("API key") || rawMessage.includes("authentication")) {
    return {
      statusCode: 401,
      payload: {
        error: "Authentication failed",
        details: "The Groq API key is invalid or unauthorized. Please check the backend .env configuration.",
      },
    };
  }

  return {
    statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
    payload: { error: "Failed to generate review", details: rawMessage },
  };
}

function resolveTitle(title, code) {
  if (title && title.trim()) return title.trim().slice(0, 60);
  return code.trim().split("\n")[0].slice(0, 24) || "Untitled Snippet";
}

async function getReview(req, res) {
  try {
    const { code, language, preset, title } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: "Code is required" });
    }

    const review = await generateContent(code, language, preset);
    const resolvedTitle = resolveTitle(title, code);

    let dbItem = null;
    if (req.user) {
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newReview = new Review({
        userId: req.user.id,
        title: resolvedTitle,
        code,
        review,
        language,
        preset,
        timestamp,
      });
      dbItem = await newReview.save();
    }

    return res.json({
      review,
      id: dbItem ? dbItem._id : null,
      timestamp: dbItem ? dbItem.timestamp : null,
      title: resolvedTitle,
    });
  } catch (error) {
    console.error("Review generation failed:", error);
    const readableError = getReadableError(error);
    return res.status(readableError.statusCode).json(readableError.payload);
  }
}

async function getHistory(req, res) {
  try {
    const reviews = await Review.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    console.error("Fetch history failed:", error);
    return res.status(500).json({ error: "Failed to load review history" });
  }
}

async function renameHistoryItem(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const updated = await Review.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { title: title.trim().slice(0, 60) },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "History item not found" });
    }
    return res.json(updated);
  } catch (error) {
    console.error("Rename history item failed:", error);
    return res.status(500).json({ error: "Failed to rename history item" });
  }
}

async function deleteHistoryItem(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Review.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ error: "History item not found" });
    }
    return res.json({ success: true, message: "History item deleted" });
  } catch (error) {
    console.error("Delete history item failed:", error);
    return res.status(500).json({ error: "Failed to delete history item" });
  }
}

module.exports = { getReview, getHistory, deleteHistoryItem, renameHistoryItem };