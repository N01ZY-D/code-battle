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
//const { checkSolution } = require("../controllers/taskController");

const router = express.Router();

// Маршрут для получения всех заданий
router.get("/", getAllTasks);

router.get("/:taskId", getTaskById);

router.post("/:taskId/check", authMiddleware, checkSolution);

router.post("/create", authMiddleware, createTask);

router.patch("/:taskId", authMiddleware, updateTask);

router.put("/reorder", authMiddleware, reorderTasks);

router.delete("/:taskId", authMiddleware, deleteTask);

module.exports = router;
