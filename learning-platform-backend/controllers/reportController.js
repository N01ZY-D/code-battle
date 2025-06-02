const Report = require("../models/Report");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Theory = require("../models/Theory");

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    const reportData = {
      reporterId: req.user.id,
      targetType,
      targetId,
      reason,
      description,
    };

    // Жалоба на комментарий
    if (targetType === "comment") {
      const comment = await Comment.findById(targetId);

      if (!comment) {
        return res.status(404).json({ error: "Комментарий не найден" });
      }

      const relatedId = comment.taskId;

      // Пробуем найти по этому ID задачу
      const task = await Task.findById(relatedId);
      if (task) {
        reportData.relatedTaskId = task._id;
      } else {
        // Если задача не найдена — ищем теорию
        const theory = await Theory.findById(relatedId);
        if (theory) {
          reportData.relatedTheoryId = theory._id;
        } else {
          return res
            .status(400)
            .json({ error: "Невозможно определить тип привязки комментария" });
        }
      }
    }

    const report = await Report.create(reportData);

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

    // Собираем все relatedTheoryId, которые есть в отчетах
    const theoryIds = reports
      .map((r) => r.relatedTheoryId)
      .filter((id) => id != null);

    // Убираем дубликаты
    const uniqueTheoryIds = [...new Set(theoryIds.map((id) => id.toString()))];

    // Запрашиваем все теории с этими id
    const theories = await Theory.find({ _id: { $in: uniqueTheoryIds } });

    // Создаём словарь id -> slug
    const theoryIdToSlug = {};
    theories.forEach((t) => {
      theoryIdToSlug[t._id.toString()] = t.slug;
    });

    // Добавляем в каждый отчет поле relatedTheorySlug, если есть relatedTheoryId
    const reportsWithSlugs = reports.map((report) => {
      const reportObj = report.toObject();
      if (reportObj.relatedTheoryId) {
        reportObj.relatedTheorySlug =
          theoryIdToSlug[reportObj.relatedTheoryId.toString()] || null;
      }
      return reportObj;
    });

    res.json(reportsWithSlugs);
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
