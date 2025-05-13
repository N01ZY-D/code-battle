const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  nickname: {
    type: String,
    default: function () {
      return `User${Math.floor(1000 + Math.random() * 9000)}`;
    },
  },
  avatarMatrix: { type: [[Number]], required: true }, // 12x12 массив 0 и 1
  avatarColor: { type: String, required: true }, // Цвет для единиц
  solvedTasksCount: { type: Number, default: 0 },
  solvedTasks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Task",
    default: [],
  }, // массив ID решённых задач
  solutions: [
    {
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true,
      },
      code: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
