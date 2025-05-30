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
  console.log(req.body);

  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    if (type === "solution") {
      const solved = user.solutions?.some(
        (s) => s.taskId.toString() === taskId
      );
      if (!solved) {
        return res.status(403).json({
          message: "Вы не решили эту задачу и не можете опубликовать решение",
        });
      }
    }

    const comment = await Comment.create({
      taskId,
      userId: req.user.id,
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
  const { id: requesterId, role } = req.user;

  try {
    const comment = await Comment.findById(commentId).populate("userId");

    if (!comment) {
      return res.status(404).json({ message: "Комментарий не найден" });
    }

    const isAuthor = comment.userId?._id.toString() === requesterId;
    const isAdmin = role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Недостаточно прав" });
    }

    await comment.deleteOne();

    res.status(200).json({ message: "Комментарий удалён" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const editComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findById(id);
    if (!comment)
      return res.status(404).json({ message: "Комментарий не найден" });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Нет прав на редактирование" });
    }

    comment.content = content;
    await comment.save();

    res.json({ message: "Комментарий обновлён" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const likeComment = async (req, res) => {
  const userId = req.user.id;
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
  const userId = req.user.id;
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
  editComment,
  likeComment,
  dislikeComment,
};
