const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUserData,
} = require("../controllers/authController");
const User = require("../models/User"); // Убедись, что модель импортирована

const router = express.Router();

router.post("/register", registerUser); // <-- Тут важен `POST`
router.post("/login", loginUser);

router.get("/me", authMiddleware, getUserData); // Защищенный маршрут

module.exports = router;
