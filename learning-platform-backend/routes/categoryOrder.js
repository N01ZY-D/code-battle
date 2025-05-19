const express = require("express");
const CategoryOrder = require("../models/CategoryOrder.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

// GET /api/category-order
router.get("/", async (req, res) => {
  try {
    let doc = await CategoryOrder.findOne({ key: "categoryOrder" });
    console.log("GET /api/category-order:", doc);
    if (!doc) {
      doc = await CategoryOrder.create({ value: [] });
      console.log("Создан новый document с пустым массивом");
    }
    res.json(doc.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// PUT /api/category-order (admin only)
router.put("/", authMiddleware, async (req, res) => {
  //   if (req.user.role !== "admin") {
  //     return res.status(403).json({ message: "Недостаточно прав" });
  //   }

  const { value } = req.body;
  if (!Array.isArray(value)) {
    return res.status(400).json({ message: "Неверный формат" });
  }

  try {
    const doc = await CategoryOrder.findOneAndUpdate(
      { key: "categoryOrder" },
      { value },
      { new: true, upsert: true }
    );
    res.json(doc.value);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при обновлении" });
  }
});

module.exports = router;
