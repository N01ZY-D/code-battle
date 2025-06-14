const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getUserStats,
} = require("../controllers/profileController");

const router = express.Router();

// Получение профиля
router.get("/", authMiddleware, getProfile);

// Обновление профиля
router.put("/", authMiddleware, updateProfile);

router.get("/stats", authMiddleware, getUserStats);

module.exports = router;
