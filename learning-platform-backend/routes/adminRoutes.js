const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateUserNickname,
  getUserSolutions,
} = require("../controllers/profileController");

// Получить список всех пользователей
router.get("/users", auth, getAllUsers);

// Изменить роль пользователя
router.put("/users/:id/role", auth, updateUserRole);

// Удалить пользователя
router.delete("/users/:id", auth, deleteUser);

// Изменить никнейм пользователя
router.put("/users/:id/nickname", auth, updateUserNickname);

// Получить список решений пользователя
router.get("/users/:id/solutions", auth, getUserSolutions);

module.exports = router;
