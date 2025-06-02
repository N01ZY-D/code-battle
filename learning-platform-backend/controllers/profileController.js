const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("nickname avatarMatrix avatarColor solvedTasksCount solutions")
      .populate({
        path: "solutions.taskId",
        select: "title",
      });
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    res.json({
      nickname: user.nickname,
      avatarMatrix: user.avatarMatrix,
      avatarColor: user.avatarColor,
      solvedTasksCount: user.solvedTasksCount,
      solutions: user.solutions || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nickname, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar; // Должна быть ссылка на изображение

    await user.save();
    res.json({ message: "Профиль обновлён", user });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const getAllUsers = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Доступ запрещён" });
  }

  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateUserRole = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Доступ запрещён" });
  }

  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Недопустимая роль" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    res.json({ message: "Роль обновлена", user });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const deleteUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Доступ запрещён" });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    res.json({ message: "Пользователь удалён" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateUserNickname = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Доступ запрещён" });
  }

  const { nickname } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nickname },
      { new: true }
    ).select("-password");
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    res.json({ message: "Никнейм обновлён", user });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const getUserSolutions = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Доступ запрещён" });
  }

  try {
    const user = await User.findById(req.params.id)
      .select("nickname solutions")
      .populate({
        path: "solutions.taskId",
        select: "title",
      });

    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    res.json({
      nickname: user.nickname,
      solutions: user.solutions || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateUserNickname,
  getUserSolutions,
};
