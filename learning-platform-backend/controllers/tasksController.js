const { VM } = require("vm2");
const Task = require("../models/Task");
const User = require("../models/User");

// Получение всех заданий
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ order: 1 }); // Извлечение всех заданий из базы
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

const checkSolution = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { code } = req.body;
    const userId = req.user.id;

    // Находим задание
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Задание не найдено" });
    }

    // Находим пользователя
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const hasSolvedTaskBefore = user.solvedTasks.includes(taskId);

    // Извлекаем имя функции
    const functionNameMatch = code.match(
      /(?:function|const|let|var)\s+(\w+)\s*=?\s*\(?/
    );
    if (!functionNameMatch) {
      return res
        .status(400)
        .json({ error: "Не удалось найти объявление функции." });
    }

    const functionName = functionNameMatch[1];
    console.log("Определенное имя функции:", functionName);

    let allTestsPassed = true;
    const failedTests = [];

    for (const test of task.tests) {
      const { input, output } = test;

      // Универсальный парсинг аргументов
      let inputArgs = input
        .trim()
        .split(/\s+/)
        .map((arg) => {
          if (!isNaN(arg)) return Number(arg);
          return arg;
        });

      console.log(`Тест: Вход: ${input} → Ожидаемый выход: "${output}"`);

      const vm = new VM({
        timeout: 1000,
        sandbox: {},
      });

      try {
        const userFunctionCode = `
          ${code}
          globalThis.${functionName} = ${functionName};
        `;

        // Загружаем функцию
        vm.run(userFunctionCode);

        // Вызываем её
        const result = vm.run(
          `${functionName}(...${JSON.stringify(inputArgs)})`
        );

        // Нормализуем результат и ожидаемый вывод
        const normalizedExpected =
          output === undefined || output === null ? "" : String(output).trim();
        const normalizedResult =
          result === undefined || result === null ? "" : String(result).trim();

        console.log("Результат выполнения:", normalizedResult);

        if (normalizedResult !== normalizedExpected) {
          allTestsPassed = false;
          failedTests.push({
            _id: test._id,
            input,
            expected: normalizedExpected,
            got: normalizedResult,
            error: `Ожидался результат: "${normalizedExpected}", но получено: "${normalizedResult}"`,
          });
        }
      } catch (err) {
        console.error("Ошибка выполнения кода:", err);
        failedTests.push({
          _id: test._id,
          input,
          error: `Ошибка выполнения: ${err.message}`,
        });
        allTestsPassed = false;
      }
    }

    if (allTestsPassed) {
      // Если задача уже была решена, просто добавим новую версию решения
      if (hasSolvedTaskBefore) {
        user.solutions.push({
          taskId,
          code,
          createdAt: new Date(),
        });
        await user.save();
        return res.json({ success: true, message: "Правильный код!" });
      }

      // Первая успешная попытка
      user.solvedTasks.push(taskId);
      user.solvedTasksCount += 1;
      user.solutions.push({
        taskId,
        code,
        createdAt: new Date(),
      });
      await user.save();

      return res.json({ success: true, message: "Правильный код!" });
    } else {
      return res.json({
        success: false,
        message: "Неправильный код.",
        failedTests,
      });
    }
  } catch (error) {
    console.error("Ошибка при проверке решения:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

const createTask = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const {
      title,
      description,
      category,
      difficulty,
      markdownContent,
      tests,
      functionName,
      parameters,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !difficulty ||
      !markdownContent ||
      !tests ||
      !functionName ||
      !parameters
    ) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    // ➔ Вот это новенькое:
    const maxOrderTask = await Task.findOne().sort({ order: -1 });
    const nextOrder = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const newTask = new Task({
      title,
      description,
      category,
      difficulty,
      markdownContent,
      tests,
      functionName,
      parameters,
      order: nextOrder, // ➔ Ставим правильный порядок
    });

    await newTask.save();
    res.status(201).json({ message: "Задача успешно создана", task: newTask });
  } catch (error) {
    console.error("Ошибка при создании задачи:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateTask = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const { taskId } = req.params;
    const updates = req.body;

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
    });

    res.json({ message: "Задача обновлена", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const reorderTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const { tasks } = req.body;

    for (const task of tasks) {
      await Task.findByIdAndUpdate(task._id, { order: task.order });
    }

    res.status(200).json({ message: "Порядок задач обновлен" });
  } catch (error) {
    console.error("Ошибка при обновлении порядка задач:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const { taskId } = req.params;

    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return res.status(404).json({ message: "Задача не найдена" });
    }

    res.json({ message: "Задача удалена" });
  } catch (error) {
    console.error("Ошибка при удалении задачи:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  checkSolution,
  createTask,
  updateTask,
  reorderTasks,
  deleteTask,
};
