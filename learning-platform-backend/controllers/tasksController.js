const { VM } = require("vm2");
const _ = require("lodash"); // для deep equality
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

    console.log(
      `[checkSolution] Received request for taskId: ${taskId}, userId: ${userId}`
    );
    console.log(`[checkSolution] User code:\n${code}`);

    const task = await Task.findById(taskId);
    if (!task) {
      console.warn(`[checkSolution] Task with ID ${taskId} not found.`);
      return res.status(404).json({ error: "Task not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[checkSolution] User with ID ${userId} not found.`);
      return res.status(404).json({ error: "User not found" });
    }

    const functionName = task.functionName;
    if (!functionName) {
      console.error(
        `[checkSolution] Function name for task ID ${taskId} is not specified.`
      );
      return res
        .status(400)
        .json({ error: "Task function name is not specified" });
    }

    // НОВОЕ: Получаем inputType из задачи, по умолчанию 'spread_args'
    // Если inputType не указан в задаче, она будет обрабатываться как функция,
    // принимающая несколько аргументов, распакованных из входного массива.
    const inputType = task.inputType || "spread_args";

    console.log(`[checkSolution] Function name to check: ${functionName}`);
    console.log(`[checkSolution] Input type for this task: ${inputType}`);
    console.log(`[checkSolution] Total tests: ${task.tests.length}`);

    let allTestsPassed = true;
    const failedTests = [];

    // Iterate through each test case
    for (const test of task.tests) {
      const inputArgs = test.input; // Can be anything (Mixed type)
      const expectedOutput = test.output; // Can be anything (Mixed type)

      console.log(
        `\n[checkSolution] --- Running test for input: ${JSON.stringify(
          inputArgs
        )} ---`
      );
      console.log(
        `[checkSolution] Expected output: ${JSON.stringify(expectedOutput)}`
      );

      const vm = new VM({
        timeout: 1000, // 1-second timeout
        sandbox: {}, // Empty sandbox
      });

      try {
        // Execute user's code, which should declare the function
        console.log(`[checkSolution] Executing user code in VM...`);
        vm.run(code);
        console.log(`[checkSolution] User code executed.`);

        // Get the function from the sandbox (globalThis)
        const userFunction = vm.run(`globalThis.${functionName}`);
        console.log(
          `[checkSolution] Function obtained from VM: ${userFunction}`
        );

        // Check if it's actually a function
        if (typeof userFunction !== "function") {
          throw new Error(
            `Function "${functionName}" is not correctly defined or is not a function.`
          );
        }

        let actualOutput;
        // Determine how to call the function based on inputType
        if (inputType === "spread_args") {
          // If inputArgs is an array, spread its elements as arguments
          // e.g., sum([3, 5]) becomes sum(3, 5)
          if (Array.isArray(inputArgs)) {
            console.log(
              `[checkSolution] Calling function ${functionName} with spread arguments: ${JSON.stringify(
                inputArgs
              )}`
            );
            actualOutput = userFunction(...inputArgs);
          } else {
            // If inputArgs is not an array but inputType is 'spread_args',
            // this implies it's a single argument not intended for spreading (e.g., a number for fib).
            // Call it with the single argument directly.
            console.warn(
              `[checkSolution] Warning: 'spread_args' input type for a non-array input: ${JSON.stringify(
                inputArgs
              )}. Passing as a single argument.`
            );
            actualOutput = userFunction(inputArgs);
          }
        } else if (inputType === "single_arg") {
          // If the entire inputArgs should be passed as one argument
          // e.g., flattenArray([1, [2,3]]) becomes flattenArray([1, [2,3]])
          console.log(
            `[checkSolution] Calling function ${functionName} with single argument: ${JSON.stringify(
              inputArgs
            )}`
          );
          actualOutput = userFunction(inputArgs);
        } else {
          // Fallback for unknown inputType (shouldn't happen if enum is strict)
          console.warn(
            `[checkSolution] Unknown inputType: ${inputType}. Defaulting to 'spread_args' logic.`
          );
          if (Array.isArray(inputArgs)) {
            actualOutput = userFunction(...inputArgs);
          } else {
            actualOutput = userFunction(inputArgs);
          }
        }

        console.log(
          `[checkSolution] Actual output: ${JSON.stringify(
            actualOutput
          )} (type: ${typeof actualOutput})`
        );

        // Deep comparison of results
        if (!_.isEqual(actualOutput, expectedOutput)) {
          console.log(`[checkSolution] Test FAILED. Mismatch.`);
          allTestsPassed = false;
          failedTests.push({
            _id: test._id,
            input: inputArgs,
            expected: expectedOutput,
            got: actualOutput,
            error: `Expected result: ${JSON.stringify(
              expectedOutput
            )}, but got: ${JSON.stringify(actualOutput)}`,
          });
        } else {
          console.log(`[checkSolution] Test PASSED. Results match.`);
        }
      } catch (err) {
        console.error(
          `[checkSolution] Error executing test for input ${JSON.stringify(
            inputArgs
          )}: ${err.message}`
        );
        allTestsPassed = false;
        failedTests.push({
          _id: test._id,
          input: inputArgs,
          error: `Execution Error: ${err.message}`,
        });
      }
    }

    if (allTestsPassed) {
      console.log(
        `[checkSolution] All tests passed for taskId: ${taskId}, userId: ${userId}.`
      );
      const hasSolvedTaskBefore = user.solvedTasks.includes(taskId);
      user.solutions.push({ taskId, code, createdAt: new Date() });

      if (!hasSolvedTaskBefore) {
        user.solvedTasks.push(taskId);
        user.solvedTasksCount += 1;
      }

      await user.save();
      return res.json({ success: true, message: "Correct code!" });
    } else {
      console.log(
        `[checkSolution] Some tests failed for taskId: ${taskId}, userId: ${userId}.`
      );
      return res.json({
        success: false,
        message: "Incorrect code.",
        failedTests,
      });
    }
  } catch (error) {
    console.error(
      `[checkSolution] Critical server error during solution check: ${error.message}`,
      error
    );
    res.status(500).json({ error: "Server error" });
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
