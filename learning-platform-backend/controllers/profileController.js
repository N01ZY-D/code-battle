const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user)
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
    const user = await User.findById(req.user);

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

module.exports = { getProfile, updateProfile };
