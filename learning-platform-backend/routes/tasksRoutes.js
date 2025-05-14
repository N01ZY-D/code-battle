const express = require("express");
const {
  getAllTasks,
  getTaskById,
  checkSolution,
  createTask,
  updateTask,
  reorderTasks,
  deleteTask,
} = require("../controllers/tasksController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Маршрут для получения всех заданий
router.get("/", getAllTasks);

// Маршрут для получения задания по ID
router.get("/:taskId", getTaskById);

// Маршрут для проверки решения задания
router.post("/:taskId/check", authMiddleware, checkSolution);

// Маршрут для создания нового задания
router.post("/create", authMiddleware, createTask);

// Маршрут для обновления задания
router.patch("/:taskId", authMiddleware, updateTask);

// Маршрут для изменения порядка заданий
router.put("/reorder", authMiddleware, reorderTasks);

// Маршрут для удаления задания
router.delete("/:taskId", authMiddleware, deleteTask);

module.exports = router;
