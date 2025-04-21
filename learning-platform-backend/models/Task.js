const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  markdownContent: { type: String, required: true },
  tests: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
  functionName: { type: String, required: true }, // Имя функции
  parameters: { type: String, required: true }, // Параметры функции
  createdAt: { type: Date, default: Date.now },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model("Task", TaskSchema);
