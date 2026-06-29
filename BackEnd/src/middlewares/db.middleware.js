const mongoose = require("mongoose");

function requireDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database unavailable",
      details: "MongoDB is not connected. Check MONGODB_URI in BackEnd/.env, then restart the server.",
    });
  }
  next();
}

module.exports = { requireDB };