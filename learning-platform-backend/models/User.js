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
  avatar: { type: String, default: "/avatars/default.png" }, // Здесь можешь поменять путь
  solvedTasksCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
