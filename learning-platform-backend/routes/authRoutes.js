const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { registerUser, loginUser } = require("../controllers/authController");
const User = require("../models/User"); // Убедись, что модель импортирована

const router = express.Router();

router.post("/register", registerUser); // <-- Тут важен `POST`
router.post("/login", loginUser);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    console.log("User ID from Token:", req.user); // Логируем ID пользователя

    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in /me route:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
