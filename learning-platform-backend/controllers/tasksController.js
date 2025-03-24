const Task = require("../models/Task");
const { VM } = require("vm2");

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

const checkSolution = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { code } = req.body;

    // Находим задание
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Задание не найдено" });
    }

    // Регулярное выражение для поиска имени функции
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
      const inputArgs = input.split(" ").map(Number);
      console.log(`Тест: Вход: ${input} → Ожидаемый выход: ${output}`);

      const vm = new VM({
        timeout: 1000,
        sandbox: {},
      });

      try {
        // Исполняемый код: объявляем переменную с функцией, затем вызываем её
        const userFunction = `
          ${code}
          globalThis.${functionName} = ${functionName};
        `;

        // Выполняем код в изолированной среде
        vm.run(userFunction);

        // Вызываем функцию и получаем результат
        const result = vm.run(
          `${functionName}(...${JSON.stringify(inputArgs)})`
        );

        console.log("Результат выполнения:", result);

        if (String(result) !== String(output)) {
          allTestsPassed = false;
          failedTests.push({
            input,
            expected: output,
            got: result,
            error: `Ожидался результат: ${output}, но получено: ${result}`,
          });
        }
      } catch (err) {
        console.error("Ошибка выполнения кода:", err);
        failedTests.push({
          input,
          error: `Ошибка выполнения: ${err.message}`,
        });
        allTestsPassed = false;
      }
    }

    if (allTestsPassed) {
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

module.exports = { getAllTasks, getTaskById, checkSolution };
