import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../styles/createTaskPage.css";
import MarkdownEditorPreview from "../components/MarkdownEditorPreview";

const CreateTaskPage = ({ mode = "create", initialData = null }) => {
  const { user, token, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    markdownContent: "",
    functionName: "",
    parameters: "",
    inputType: "spread_args", // НОВОЕ: Добавляем inputType со значением по умолчанию
    tests: [{ input: "", output: "" }], // Инициализируем как строки для полей ввода
  });

  useEffect(() => {
    if (initialData) {
      // При редактировании, если initialData.tests.input/output уже не строки,
      // преобразуем их в JSON-строки для отображения в полях ввода
      const formattedTests = initialData.tests.map((test) => ({
        input: JSON.stringify(test.input),
        output: JSON.stringify(test.output),
      }));
      setTaskData({ ...initialData, tests: formattedTests });
      setTimeout(() => {
        document.querySelectorAll("textarea").forEach((textarea) => {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight + 2}px`;
        });
      }, 100);
    }
  }, [initialData]);

  const handleTextareaInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight + 2}px`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTests = [...taskData.tests];
    updatedTests[index][name] = value; // Здесь значение пока остается строкой
    setTaskData({ ...taskData, tests: updatedTests });
  };

  const addTest = () => {
    setTaskData((prev) => ({
      ...prev,
      tests: [...prev.tests, { input: "", output: "" }],
    }));
  };

  const removeTest = (index) => {
    if (taskData.tests.length <= 1) return;
    const updatedTests = taskData.tests.filter((_, i) => i !== index);
    setTaskData((prev) => ({ ...prev, tests: updatedTests }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Нет токена, авторизуйтесь заново.");

    // ПРЕОБРАЗОВАНИЕ ТЕСТОВ ПЕРЕД ОТПРАВКОЙ НА БЭКЕНД
    const parsedTests = taskData.tests.map((test) => {
      try {
        // Пробуем распарсить input. Если это просто число или строка, JSON.parse не сработает.
        // Используем более гибкий подход или стандартизируем ввод.
        // Для простоты будем считать, что для чисел и булевых значений
        // они введены без кавычек, а для строк - в кавычках.
        let parsedInput;
        let parsedOutput;

        try {
          parsedInput = JSON.parse(test.input);
        } catch (error) {
          parsedInput = test.input; // Если не JSON, оставляем как есть (например, для простых строк/чисел)
        }

        try {
          parsedOutput = JSON.parse(test.output);
        } catch (error) {
          parsedOutput = test.output; // Если не JSON, оставляем как есть
        }

        return { input: parsedInput, output: parsedOutput };
      } catch (error) {
        alert(
          `Ошибка парсинга теста: ${error.message}. Убедитесь, что ввод и вывод в формате JSON (для массивов, объектов) или прямые значения (для чисел, строк, булевых).`
        );
        throw new Error("Неверный формат теста"); // Останавливаем отправку
      }
    });

    const dataToSend = {
      ...taskData,
      tests: parsedTests, // Отправляем преобразованные тесты
    };
    // Убираем поле parameters, если оно не используется на бэкенде для других целей
    // delete dataToSend.parameters; // Если вы решили полностью убрать `parameters`

    try {
      const url =
        mode === "edit"
          ? `${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/api/tasks/${taskId}`
          : `${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/api/tasks/create`;

      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend), // Отправляем преобразованные данные
      });

      if (response.ok) {
        alert(mode === "edit" ? "Задача обновлена!" : "Задача создана!");
        navigate("/tasks");
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.message}`);
      }
    } catch (error) {
      console.error(
        `Ошибка при ${mode === "edit" ? "обновлении" : "создании"} задачи:`,
        error
      );
    }
  };

  if (isLoading) return <p>Загрузка...</p>;
  if (!user || user.role !== "admin") return navigate("/dashboard");

  return (
    <div className="create-task-page">
      <h2 className="page-title">
        {mode === "edit" ? "Редактирование задачи" : "Создание новой задачи"}
      </h2>
      <div className="back-to-dashboard">
        <Link to="/dashboard">
          <button
            className="back-button"
            style={{ backgroundColor: "#cd853f" }}
          >
            Вернуться в Dashboard
          </button>
        </Link>
      </div>
      <form className="task-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Название</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="Название"
            value={taskData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            placeholder="Описание"
            value={taskData.description}
            onChange={handleChange}
            onInput={handleTextareaInput}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Категория</label>
          <input
            id="category"
            type="text"
            name="category"
            placeholder="Категория"
            value={taskData.category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="difficulty">Сложность</label>
          <input
            id="difficulty"
            type="text"
            name="difficulty"
            placeholder="Сложность"
            value={taskData.difficulty}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="markdownContent">Markdown описание</label>
          <MarkdownEditorPreview
            value={taskData.markdownContent}
            onChange={(val) =>
              setTaskData((prev) => ({ ...prev, markdownContent: val }))
            }
            placeholder="Markdown описание"
          />
        </div>
        <div className="form-group">
          <label htmlFor="functionName">Имя функции</label>
          <input
            id="functionName"
            type="text"
            name="functionName"
            placeholder="Имя функции"
            value={taskData.functionName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="parameters">Параметры функции (через запятую)</label>
          <input
            id="parameters"
            type="text"
            name="parameters"
            placeholder="Например: a, b или str"
            value={taskData.parameters}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="inputType">Тип входных данных для функции</label>
          <select
            id="inputType"
            name="inputType"
            value={taskData.inputType}
            onChange={handleChange}
            required
          >
            <option value="spread_args">Несколько аргументов (a, b, c)</option>
            <option value="single_arg">
              Один аргумент (например, массив целиком)
            </option>
          </select>
        </div>

        <h3 className="sub-title">Тесты</h3>
        {taskData.tests.map((test, index) => (
          <div className="test-group" key={index}>
            <input
              type="text"
              name="input"
              placeholder="Вход (JSON: [3,5]; 8; 'строка')"
              value={test.input}
              onChange={(e) => handleTestChange(index, e)}
              required
            />
            <input
              type="text"
              name="output"
              placeholder="Выход (JSON: 8; [1,2,3]; 'результат')"
              value={test.output}
              onChange={(e) => handleTestChange(index, e)}
              required
            />
            <button
              type="button"
              className="remove-test-button"
              onClick={() => removeTest(index)}
              disabled={taskData.tests.length <= 1}
            >
              ✖
            </button>
          </div>
        ))}

        <div className="create-task-buttons">
          <button
            type="button"
            className="add-test-button"
            onClick={addTest}
            disabled={taskData.tests.length >= 10}
          >
            Добавить тест
          </button>
          <button type="submit" className="submit-button">
            {mode === "edit" ? "Сохранить изменения" : "Создать задачу"}
          </button>
          {mode === "edit" && (
            <Link to="/tasks">
              <button>Назад к списку задач</button>
            </Link>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateTaskPage;
