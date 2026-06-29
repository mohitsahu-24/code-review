const express = require("express");
const aiController = require("../controllers/ai.controller");
const { requireAuth, optionalAuth } = require("../middlewares/auth.middleware");
const { requireDB } = require("../middlewares/db.middleware");

const router = express.Router();

router.post("/get-review", optionalAuth, aiController.getReview);
router.get("/history", requireAuth, aiController.getHistory);
router.delete("/history/:id", requireAuth, aiController.deleteHistoryItem);
router.patch("/history/:id", requireAuth, requireDB, aiController.renameHistoryItem);

module.exports = router;
