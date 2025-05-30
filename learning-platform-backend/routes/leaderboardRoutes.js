const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Получение топ-10 пользователей по количеству решённых задач
router.get("/", async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ solvedTasksCount: -1 }) // Сортировка по количеству решённых задач
      .limit(10) // Топ-10 пользователей
      .select("nickname avatarMatrix avatarColor solvedTasksCount");

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
