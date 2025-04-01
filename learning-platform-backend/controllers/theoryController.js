const Theory = require("../models/Theory");
const User = require("../models/User");

const createTheory = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const { title, slug, category, markdownContent } = req.body;

    if (!title || !slug || !category || !markdownContent) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    const newTheory = new Theory({
      title,
      slug,
      category,
      markdownContent,
    });

    await newTheory.save();
    res
      .status(201)
      .json({ message: "Теория успешно создана", theory: newTheory });
  } catch (error) {
    console.error("Ошибка при создании теории:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = { createTheory };
