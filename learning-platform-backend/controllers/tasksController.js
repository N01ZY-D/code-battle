const Task = require("../models/Task");

// Получение всех заданий
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find(); // Извлечение всех заданий из базы
    console.log(tasks); // Логирование полученных заданий
    res.json(tasks); // Отправка заданий в ответ
  } catch (error) {
    res.status(500).json({ message: "Ошибка при загрузке заданий" });
  }
};

// Получение задания по ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId); // Предполагаем, что используем Mongoose
    if (!task) {
      return res.status(404).json({ message: "Задание не найдено" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при загрузке задания" });
  }
};

const checkTaskCode = async (req, res) => {
  const { code, input, expectedOutput } = req.body;

  try {
    // Логика для проверки кода
    const result = runUserCode(code, input); // Выполнение кода

    // Проверка на совпадение с ожидаемым результатом
    if (result === expectedOutput) {
      return res.json({ isCorrect: true });
    } else {
      return res.json({ isCorrect: false });
    }
  } catch (error) {
    return res.status(500).json({ message: "Ошибка при проверке кода." });
  }
};

module.exports = { getAllTasks, getTaskById };
