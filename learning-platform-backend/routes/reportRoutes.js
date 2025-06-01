const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  createReport,
  getAllReports,
  updateReportStatus,
} = require("../controllers/reportController");

const router = express.Router();

router.post("/", auth, createReport); // Создание жалобы

router.get("/", auth, getAllReports); // Получение всех жалоб (только для администраторов)

router.put("/:id", auth, updateReportStatus); // Обновление статуса жалобы (только для администраторов)

module.exports = router;
