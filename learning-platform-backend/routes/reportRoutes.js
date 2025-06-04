const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  createReport,
  getAllReports,
  updateReportStatus,
  getPendingReportsCount,
} = require("../controllers/reportController");

const router = express.Router();

router.post("/", auth, createReport); // Создание жалобы

router.get("/", auth, getAllReports); // Получение всех жалоб (только для администраторов)

router.put("/:id", auth, updateReportStatus); // Обновление статуса жалобы (только для администраторов)

router.get("/count", auth, getPendingReportsCount);

module.exports = router;
