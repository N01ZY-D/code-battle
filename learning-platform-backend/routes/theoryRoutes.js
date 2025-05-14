// В файле routes/theoryRoutes.js
const express = require("express");
const User = require("../models/User");
const Theory = require("../models/Theory");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllTheories,
  getTheory,
  createTheory,
  updateTheory,
  reorderTheories,
  deleteTheory,
} = require("../controllers/theoryController");

const router = express.Router();

// Получение списка всех теорий
router.get("/", authMiddleware, getAllTheories);

// Получение теории по slug
router.get("/:slug", authMiddleware, getTheory);

// Создание новой теории
router.post("/create", authMiddleware, createTheory);

// Изменение порядка теорий
router.put("/reorder", authMiddleware, reorderTheories);

// Обновление теории
router.put("/:slug", authMiddleware, updateTheory);

// Удаление теории
router.delete("/:slug", authMiddleware, deleteTheory);

module.exports = router;
