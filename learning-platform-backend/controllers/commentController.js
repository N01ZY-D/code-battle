const Comment = require("../models/Comment");
const User = require("../models/User");

const getCommentsByTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const comments = await Comment.find({ taskId })
      .populate("userId", "nickname avatarMatrix avatarColor")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const addComment = async (req, res) => {
  const { taskId } = req.params;
  const { content, type } = req.body;

  try {
    const user = await User.findById(req.user);

    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    if (type === "solution") {
      const solved = user.solutions?.some(
        (s) => s.taskId.toString() === taskId
      );
      if (!solved)
        return res.status(403).json({ message: "Вы не решили эту задачу" });
    }

    const comment = await Comment.create({
      taskId,
      userId: req.user,
      content,
      type,
    });

    const populatedComment = await comment.populate(
      "userId",
      "nickname avatarMatrix avatarColor"
    );

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = { getCommentsByTask, addComment };
