// В файле routes/theoryRoutes.js
const express = require("express");
const User = require("../models/User");
const Theory = require("../models/Theory");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTheory,
  updateTheory,
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

// Обновление теории по ID
router.put("/:slug", authMiddleware, async (req, res) => {
  try {
    // Используйте slug для поиска
    const theory = await Theory.findOne({ slug: req.params.slug });

    if (!theory) {
      return res.status(404).json({ message: "Теория не найдена" });
    }

    // Обновляем данные теории
    theory.title = req.body.title;
    theory.markdownContent = req.body.markdownContent;
    theory.category = req.body.category;
    theory.order = req.body.order;

    await theory.save(); // Сохраняем изменения
    res.json(theory); // Отправляем обновленную теорию
  } catch (err) {
    console.error("Ошибка при обновлении теории:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/reorder", authMiddleware, reorderTheories);

module.exports = router;
