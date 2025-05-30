const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateAvatarData = require("../utils/avatarGenerator");

const TOKEN_EXPIRES_IN = "7d";

// Регистрация пользователя
const registerUser = async (req, res) => {
  const { email, password, nickname } = req.body; // Добавляем nickname в body

  try {
    // Проверка, существует ли уже пользователь
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Хэширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { matrix, color } = generateAvatarData(nickname);

    // Создание нового пользователя
    const newUser = new User({
      email,
      password: hashedPassword,
      nickname, // Добавляем никнейм
      avatarMatrix: matrix,
      avatarColor: color,
    });

    // Сохранение пользователя в базе данных
    await newUser.save();

    // Генерация JWT токена
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRES_IN,
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Вход пользователя
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Поиск пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Генерация JWT токена
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRES_IN,
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserData = async (req, res) => {
  try {
    console.log("User ID from Token:", req.user);

    const user = await User.findById(req.user.id).select(
      "email role nickname avatarMatrix avatarColor"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      nickname: user.nickname,
      avatarMatrix: user.avatarMatrix,
      avatarColor: user.avatarColor,
    });
  } catch (error) {
    console.error("Error in /me route:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, getUserData };
