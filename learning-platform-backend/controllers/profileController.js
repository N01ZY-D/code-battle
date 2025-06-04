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

const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("solvedTasksCount solutions")
      .populate({
        path: "solutions.taskId",
        select: "title",
      });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json({
      solvedTasksCount: user.solvedTasksCount,
      solutions: user.solutions || [],
    });
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
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Супер-админ — email из env, его роль менять нельзя
    if (userToUpdate.email === process.env.SUPER_ADMIN_EMAIL) {
      return res
        .status(403)
        .json({ message: "Нельзя изменить роль супер-админа" });
    }

    // Если пытаемся понизить роль с admin до user,
    // нужно проверить, что это не последний админ в базе
    if (userToUpdate.role === "admin" && role !== "admin") {
      const adminsCount = await User.countDocuments({ role: "admin" });

      // Если админов всего 1, запрещаем понижение роли
      if (adminsCount <= 1) {
        return res.status(400).json({
          message:
            "Нельзя понизить роль. В базе должен оставаться хотя бы один админ.",
        });
      }
    }

    // Всё прошло — обновляем роль
    userToUpdate.role = role;
    await userToUpdate.save();

    const userSafe = userToUpdate.toObject();
    delete userSafe.password;

    res.json({ message: "Роль обновлена", user: userSafe });
  } catch (error) {
    console.error(error);
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
  getUserStats,
};
