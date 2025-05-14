const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUserData,
} = require("../controllers/authController");

const router = express.Router();

// Регистрация нового пользователя
router.post("/register", registerUser);

// Логин пользователя
router.post("/login", loginUser);

// Получение данных текущего пользователя
router.get("/me", authMiddleware, getUserData); // Защищенный маршрут

module.exports = router;
