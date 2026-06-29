require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// mongoose.set("bufferCommands", false); // Disabled buffering to allow default behavior

if (!MONGODB_URI || MONGODB_URI.includes("<username>")) {
  console.warn("⚠️ MONGODB_URI is not configured. Auth/history routes will return 503 until fixed.");
  app.listen(PORT, () => console.log(`Server running in local-fallback mode on http://localhost:${PORT}`));
} else {
  mongoose
    .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log("✅ Connected to MongoDB");
      app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
      console.warn("⚠️ Falling back to server-only mode. Auth/history routes will return 503.");
      app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    });
}