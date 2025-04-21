// В файле routes/theoryRoutes.js
const express = require("express");
const Theory = require("../models/Theory");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTheory,
  reorderTheories,
} = require("../controllers/theoryController");

const router = express.Router();

// Получение списка всех теорий
router.get("/", authMiddleware, async (req, res) => {
  try {
    const theories = await Theory.find().sort({ order: 1 }); // Извлечение всех теорий из базы
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

router.post("/create", authMiddleware, createTheory);

router.put("/reorder", authMiddleware, reorderTheories);

module.exports = router;
