const Comment = require("../models/Comment");
const User = require("../models/User");

const buildCommentTree = (comments) => {
  const map = {};
  const roots = [];

  comments.forEach((comment) => {
    comment = comment.toObject(); // конвертация из Mongoose
    comment.replies = [];
    map[comment._id] = comment;
  });

  comments.forEach((comment) => {
    const parent = comment.parentId?.toString();
    if (parent && map[parent]) {
      map[parent].replies.push(map[comment._id]);
    } else {
      roots.push(map[comment._id]);
    }
  });

  return roots;
};

const getCommentsByTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const comments = await Comment.find({ taskId })
      .populate("userId", "nickname avatarMatrix avatarColor")
      .sort({ createdAt: 1 }); // порядок важен для дерева

    const tree = buildCommentTree(comments);

    res.json(tree);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const addComment = async (req, res) => {
  const { taskId } = req.params;
  const { content, type, solutionCode, parentId } = req.body;

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
      solutionCode,
      parentId: parentId || null,
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

const deleteComment = async (req, res) => {
  const commentId = req.params.commentId;
  const requesterId = req.user;

  try {
    const comment = await Comment.findById(commentId).populate("userId");

    if (!comment) {
      return res.status(404).json({ message: "Комментарий не найден" });
    }

    // Только автор может удалить — проверка id
    if (comment.userId?._id.toString() !== requesterId) {
      return res.status(403).json({ message: "Недостаточно прав" });
    }

    await comment.deleteOne();

    res.status(200).json({ message: "Комментарий удалён" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const likeComment = async (req, res) => {
  const userId = req.user;
  const commentId = req.params.id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment)
      return res.status(404).json({ message: "Комментарий не найден" });

    if (!comment.likes.includes(userId)) {
      comment.likes.push(userId);
      comment.dislikes = comment.dislikes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    }

    await comment.save();
    res.json({
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const dislikeComment = async (req, res) => {
  const userId = req.user;
  const commentId = req.params.id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment)
      return res.status(404).json({ message: "Комментарий не найден" });

    if (!comment.dislikes.includes(userId)) {
      comment.dislikes.push(userId);
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.dislikes = comment.dislikes.filter(
        (id) => id.toString() !== userId
      );
    }

    await comment.save();
    res.json({
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  getCommentsByTask,
  addComment,
  deleteComment,
  likeComment,
  dislikeComment,
};
