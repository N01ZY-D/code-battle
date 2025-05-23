const express = require("express");
const router = express.Router();
const {
  getCommentsByTask,
  addComment,
} = require("../controllers/commentController");
const auth = require("../middleware/authMiddleware");

router.get("/:taskId", getCommentsByTask);
router.post("/:taskId", auth, addComment);

module.exports = router;
