const express = require("express");
const {
  getAllTasks,
  getTaskById,
  checkSolution,
} = require("../controllers/tasksController");
//const { checkSolution } = require("../controllers/taskController");

const router = express.Router();

// Маршрут для получения всех заданий
router.get("/", getAllTasks);

// Маршрут для получения конкретного задания по ID
//router.get("/tasks/:id", getTaskById);

router.get("/:taskId", getTaskById);

router.post("/:taskId/check", checkSolution);

module.exports = router;
