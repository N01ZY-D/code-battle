const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");
const User = require("../models/User");

const router = express.Router();

// Получение профиля
router.get("/", authMiddleware, getProfile);

// Обновление профиля
router.put("/", authMiddleware, updateProfile);

module.exports = router;
