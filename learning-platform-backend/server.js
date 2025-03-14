const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes"); // Подключаем маршруты
const theoryRoutes = require("./routes/theoryRoutes.js");

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // Позволяет серверу читать JSON в `req.body`
app.use(cors());

// Подключаем маршруты
app.use("/api/auth", authRoutes);
app.use("/api/theory", theoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
