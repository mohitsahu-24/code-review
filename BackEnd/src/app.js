const express = require("express");
const cors = require("cors");
const aiRoutes = require("./routes/ai.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configure CORS using the official package
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*",
  methods: ["GET", "POST", "PATCH", "OPTIONS", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Code review API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/ai", aiRoutes);

module.exports = app;
