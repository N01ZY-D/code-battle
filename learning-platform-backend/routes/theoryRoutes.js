// В файле routes/theoryRoutes.js
const express = require("express");
const Theory = require("../models/Theory");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Получение списка всех теорий
router.get("/", authMiddleware, async (req, res) => {
  try {
    const theories = await Theory.find();
    res.json(theories); // Отправляем список всех теорий
  } catch (err) {
    console.error("Ошибка при получении теорий:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/:slug", authMiddleware, async (req, res) => {
  try {
    const theory = await Theory.findOne({ slug: req.params.slug });
    if (!theory) {
      return res.status(404).json({ message: "Тема не найдена" });
    }
    res.json(theory); // Отправляем теорию
  } catch (err) {
    console.error("Ошибка при получении теории:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
