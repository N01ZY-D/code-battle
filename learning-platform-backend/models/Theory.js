const mongoose = require("mongoose");

const TheorySchema = new mongoose.Schema({
  title: { type: String, required: true }, // Название темы
  slug: { type: String, required: true, unique: true }, // Уникальный URL-идентификатор
  category: { type: String, required: true }, // Например, "Основы"
  markdownContent: { type: String, required: true }, // Текст в формате Markdown
  createdAt: { type: Date, default: Date.now }, // Дата создания
});

module.exports = mongoose.model("Theory", TheorySchema);
