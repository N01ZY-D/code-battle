import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../styles/createTaskPage.css";
import MarkdownEditorPreview from "../components/MarkdownEditorPreview"; // путь подстрой под свою структуру

const CreateTaskPage = ({ mode = "create", initialData = null }) => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [user, setUser] = useState(null);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    markdownContent: "",
    functionName: "",
    parameters: "",
    tests: [{ input: "", output: "" }],
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          if (data.role !== "admin") navigate("/");
        }
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (initialData) {
      setTaskData(initialData);

      setTimeout(() => {
        const textareas = document.querySelectorAll("textarea");
        textareas.forEach((textarea) => {
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
    setTaskData({ ...taskData, [name]: value });
  };

  const handleTestChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTests = [...taskData.tests];
    updatedTests[index][name] = value;
    setTaskData({ ...taskData, tests: updatedTests });
  };

  const addTest = () => {
    setTaskData({
      ...taskData,
      tests: [...taskData.tests, { input: "", output: "" }],
    });
  };

  const removeTest = (index) => {
    if (taskData.tests.length <= 1) return;
    const updatedTests = taskData.tests.filter((_, i) => i !== index);
    setTaskData({ ...taskData, tests: updatedTests });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

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
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        alert(
          mode === "edit"
            ? "Задача успешно обновлена!"
            : "Задача успешно создана!"
        );
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

  if (!user || user.role !== "admin") {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="create-task-page">
      <h2 className="page-title">
        {mode === "edit" ? "Редактирование задачи" : "Создание новой задачи"}
      </h2>
      <form className="task-form" onSubmit={handleSubmit}>
        {/* Инпуты формы остаются без изменений */}
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
              setTaskData({ ...taskData, markdownContent: val })
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
          <label htmlFor="parameters">Параметры функции</label>
          <input
            id="parameters"
            type="text"
            name="parameters"
            placeholder="Параметры функции"
            value={taskData.parameters}
            onChange={handleChange}
            required
          />
        </div>

        <h3 className="sub-title">Тесты</h3>
        {taskData.tests.map((test, index) => (
          <div className="test-group" key={index}>
            <input
              type="text"
              name="input"
              placeholder="Входные данные"
              value={test.input}
              onChange={(e) => handleTestChange(index, e)}
              required
            />
            <input
              type="text"
              name="output"
              placeholder="Ожидаемый результат"
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

        <div className="buttons">
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
