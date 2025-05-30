const express = require("express");
const router = express.Router();
const {
  getCommentsByTask,
  addComment,
  deleteComment,
  editComment,
  likeComment,
  dislikeComment,
} = require("../controllers/commentController");
const auth = require("../middleware/authMiddleware");

router.get("/:taskId", getCommentsByTask);
router.post("/:taskId", auth, addComment);
router.delete("/:commentId", auth, deleteComment);

router.post("/:id/like", auth, likeComment);
router.post("/:id/dislike", auth, dislikeComment);

router.patch("/:id", auth, editComment);

module.exports = router;
