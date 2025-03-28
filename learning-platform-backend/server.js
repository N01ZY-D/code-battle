const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const theoryRoutes = require("./routes/theoryRoutes.js");
const tasksRoutes = require("./routes/tasksRoutes"); // Подключаем маршруты для заданий
const profileRoutes = require("./routes/profileRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // Позволяет серверу читать JSON в `req.body`
app.use(cors());

// Подключаем маршруты
app.use("/api/auth", authRoutes);
app.use("/api/theory", theoryRoutes);
app.use("/api/tasks", tasksRoutes); // Добавляем маршруты для заданий
app.use("/api/profile", profileRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
