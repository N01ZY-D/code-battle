const Theory = require("../models/Theory");
const User = require("../models/User");

const getAllTheories = async (req, res) => {
  try {
    const theories = await Theory.find().sort({ order: 1 }); // Извлечение всех теорий из базы
    res.json(theories); // Отправляем список всех теорий
  } catch (err) {
    console.error("Ошибка при получении теорий:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const getTheory = async (req, res) => {
  try {
    const theory = await Theory.findOne({ slug: req.params.slug });
    if (!theory) {
      return res.status(404).json({ message: "Тема не найдена" });
    }
    res.json(theory); // Отправляем теорию
  } catch (err) {
    console.error("Ошибка при получении теории:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

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
    // Используйте slug для поиска
    const theory = await Theory.findOne({ slug: req.params.slug });

    if (!theory) {
      return res.status(404).json({ message: "Теория не найдена" });
    }

    // Обновляем данные теории
    theory.title = req.body.title;
    theory.markdownContent = req.body.markdownContent;
    theory.category = req.body.category;

    await theory.save(); // Сохраняем изменения
    res.json(theory); // Отправляем обновленную теорию
  } catch (err) {
    console.error("Ошибка при обновлении теории:", err);
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

module.exports = {
  getAllTheories,
  getTheory,
  createTheory,
  updateTheory,
  reorderTheories,
  deleteTheory,
};
