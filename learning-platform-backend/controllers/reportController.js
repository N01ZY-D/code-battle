const Report = require("../models/Report");

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    const report = await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason,
    });

    res.status(201).json(report);
  } catch (err) {
    console.error("Ошибка при создании жалобы:", err);
    res.status(500).json({ error: "Не удалось создать жалобу" });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate("reporterId", "email nickname");

    res.json(reports);
  } catch (err) {
    console.error("Ошибка при получении жалоб:", err);
    res.status(500).json({ error: "Не удалось загрузить жалобы" });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ error: "Жалоба не найдена" });
    }

    res.json(updatedReport);
  } catch (err) {
    console.error("Ошибка при обновлении статуса:", err);
    res.status(500).json({ error: "Не удалось обновить статус жалобы" });
  }
};

module.exports = { createReport, getAllReports, updateReportStatus };
