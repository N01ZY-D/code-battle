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

const updateTheory = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const { theoryId } = req.params;
    const updates = req.body;

    const updatedTheory = await Theory.findByIdAndUpdate(theoryId, updates, {
      new: true,
    });

    res.json({ message: "Теория обновлена", theory: updatedTheory });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const reorderTheories = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const { theories } = req.body;

    if (!theories || theories.length === 0) {
      return res.status(400).json({ message: "Нет теорий для обновления" });
    }

    for (const theory of theories) {
      await Theory.findByIdAndUpdate(theory._id, { order: theory.order });
    }

    res.status(200).json({ message: "Порядок теорий обновлен" });
  } catch (error) {
    console.error("Ошибка при обновлении порядка теорий:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const deleteTheory = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const { slug } = req.params;
    const deleted = await Theory.findOneAndDelete({ slug });

    if (!deleted) {
      return res.status(404).json({ message: "Теория не найдена" });
    }

    res.status(200).json({ message: "Теория удалена" });
  } catch (error) {
    console.error("Ошибка при удалении теории:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = { createTheory, updateTheory, reorderTheories, deleteTheory };

module.exports = { createTheory, updateTheory, reorderTheories, deleteTheory };
