import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/createTaskPage.css"; // Импортируем стили для страницы создания задачи

const CreateTaskPage = () => {
  const navigate = useNavigate();
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
          if (data.role !== "admin") navigate("/"); // Не пускаем обычных пользователей
        }
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleTextareaInput = (e) => {
    e.target.style.height = "auto"; // Сначала сбрасываем высоту
    e.target.style.height = `${e.target.scrollHeight}px`; // Потом подстраиваем под содержимое
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/tasks/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(taskData),
        }
      );

      if (response.ok) {
        alert("Задача успешно создана!");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Ошибка при создании задачи:", error);
    }
  };

  if (!user || user.role !== "admin") {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="create-task-page">
      <h2 className="page-title">Создание новой задачи</h2>
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
          <label htmlFor="">Описание</label>
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
          <textarea
            id="markdownContent"
            name="markdownContent"
            placeholder="Markdown описание"
            value={taskData.markdownContent}
            onChange={handleChange}
            onInput={handleTextareaInput}
            required
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
            Создать задачу
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskPage;
