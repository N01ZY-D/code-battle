import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    <div>
      <h2>Создание новой задачи</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Название"
          value={taskData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Описание"
          value={taskData.description}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Категория"
          value={taskData.category}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="difficulty"
          placeholder="Сложность"
          value={taskData.difficulty}
          onChange={handleChange}
          required
        />
        <textarea
          name="markdownContent"
          placeholder="Markdown описание"
          value={taskData.markdownContent}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="functionName"
          placeholder="Имя функции"
          value={taskData.functionName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="parameters"
          placeholder="Параметры функции"
          value={taskData.parameters}
          onChange={handleChange}
          required
        />

        <h3>Тесты</h3>
        {taskData.tests.map((test, index) => (
          <div key={index}>
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

        <button
          type="button"
          onClick={addTest}
          disabled={taskData.tests.length >= 10} // Ограничиваем количество тестов
        >
          Добавить тест
        </button>

        <button type="submit">Создать задачу</button>
      </form>
    </div>
  );
};

export default CreateTaskPage;
