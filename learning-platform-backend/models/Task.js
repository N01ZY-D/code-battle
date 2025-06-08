const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  markdownContent: { type: String, required: true },
  tests: [
    {
      input: { type: mongoose.Schema.Types.Mixed, required: true }, // Изменено на Mixed
      output: { type: mongoose.Schema.Types.Mixed, required: true }, // Изменено на Mixed
    },
  ],
  functionName: { type: String, required: true }, // Имя функции
  parameters: { type: String, required: true }, // Параметры функции
  inputType: {
    type: String,
    enum: ["single_arg", "spread_args"], // 'single_arg' - один аргумент, 'spread_args' - распаковать массив в аргументы
    default: "spread_args", // По умолчанию большинство функций принимают несколько аргументов
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model("Task", TaskSchema);
