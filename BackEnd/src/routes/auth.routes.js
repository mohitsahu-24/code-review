const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { requireDB } = require("../middlewares/db.middleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecrettokenhere";

router.post("/register", requireDB, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      error: "Registration failed. Try again later.",
      details: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

router.post("/login", requireDB, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Login failed. Try again later.",
      details: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

module.exports = router;