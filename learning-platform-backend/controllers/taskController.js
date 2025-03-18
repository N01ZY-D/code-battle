const Task = require("../models/Task");
const { VM } = require("vm2");

exports.checkSolution = async (req, res) => {
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
    let failedTest = null;

    for (const test of task.tests) {
      const { input, output } = test;

      // Запускаем код в изолированной среде
      const vm = new VM({
        timeout: 1000,
        sandbox: {},
      });

      try {
        // Генерируем код с вызовом найденной функции
        const userFunction = `
          (function() {
            ${code}
            return ${functionName}(${input});
          })();
        `;

        const result = vm.run(userFunction);

        if (result.toString() !== output.toString()) {
          allTestsPassed = false;
          failedTest = { input, expected: output, got: result };
          break;
        }
      } catch (err) {
        return res
          .status(400)
          .json({ error: "Ошибка выполнения кода", details: err.message });
      }
    }

    if (allTestsPassed) {
      return res.json({ success: true, message: "Правильный код!" });
    } else {
      return res.json({
        success: false,
        message: "Неправильный код.",
        failedTest,
      });
    }
  } catch (error) {
    console.error("Ошибка при проверке решения:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
