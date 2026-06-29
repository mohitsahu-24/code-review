const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  preset: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);
