const express = require("express");
const { getAllTasks, getTaskById } = require("../controllers/tasksController");

const router = express.Router();

// Маршрут для получения всех заданий
router.get("/", getAllTasks);

// Маршрут для получения конкретного задания по ID
router.get("/tasks/:id", getTaskById);

module.exports = router;
