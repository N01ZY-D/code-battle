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
    const { code } = req.body; // Код пользователя

    // Находим задание
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Задание не найдено" });
    }

    // Регулярное выражение для поиска имени первой объявленной функции
    const functionNameMatch = code.match(/function (\w+)\s?\(/);
    if (!functionNameMatch) {
      return res
        .status(400)
        .json({ error: "Не удалось найти объявление функции." });
    }

    const functionName = functionNameMatch[1]; // Извлекаем имя функции
    console.log("Определенное имя функции:", functionName);

    let allTestsPassed = true;
    const failedTests = [];

    for (const test of task.tests) {
      const { input, output } = test;

      // Разделяем входные данные и преобразуем их в массив чисел
      const inputArgs = input.split(" ").map(Number);

      // Логируем входные данные
      console.log(`Тест: Вход: ${input} → Ожидаемый выход: ${output}`);
      console.log(`Преобразованные входные данные: ${inputArgs}`);

      // Запускаем код в изолированной среде
      const vm = new VM({
        timeout: 1000,
        sandbox: {},
      });

      try {
        // Генерируем код с вызовом функции
        const userFunction = `
          (function() {
            ${code}
            console.log('Запуск функции с аргументами:', ${JSON.stringify(
              inputArgs
            )});
            return ${functionName}(...${JSON.stringify(inputArgs)});
          })();
        `;

        // Логируем сгенерированный код
        console.log("Сгенерированный код:", userFunction);

        // Выполняем код
        const result = vm.run(userFunction);

        // Логируем результат выполнения
        console.log("Результат выполнения:", result);

        // Приводим результат и ожидаемый результат к строкам для точного сравнения
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
