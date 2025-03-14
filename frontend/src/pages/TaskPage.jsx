import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Используем useParams
import { Link } from "react-router-dom"; // Импортируем Link для навигации

const TaskPage = () => {
  const { taskId } = useParams(); // Получаем taskId из параметров URL
  const [task, setTask] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  console.log("taskId:", taskId);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/tasks/${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTask(response.data); // Сохраняем одно задание в state
        console.log("Полученное задание:", response.data); // Логируем задание
      } catch (error) {
        console.error("Ошибка при загрузке задания:", error);
        setError("Не удалось загрузить задание.");
      }
    };

    if (taskId) fetchTask(); // Загружаем задание, если есть taskId
  }, [taskId]);

  const handleCodeChange = (e) => {
    setUserCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5000/api/tasks/${taskId}/check`,
        {
          code: userCode,
          input: task.tests[0].input,
          expectedOutput: task.tests[0].output,
        }
      );
      setResult(
        response.data.isCorrect ? "Правильный код!" : "Неправильный код."
      );
      setError("");
    } catch (error) {
      setError("Ошибка при проверке кода.");
      console.error(error);
    }
  };

  if (!task) {
    return <p>Задание не найдено</p>;
  }

  return (
    <div>
      <h1>{task.title}</h1>
      <Link to="/tasks">
        <button>Назад к списку теорий</button>
      </Link>
      <p>{task.description}</p>
      <h3>Входные данные:</h3>
      <pre>{task.tests[0].input}</pre>
      <h3>Ваш код:</h3>
      <textarea
        value={userCode}
        onChange={handleCodeChange}
        rows="10"
        cols="50"
        placeholder="Введите ваш код..."
      />
      <br />
      <button onClick={handleSubmit}>Проверить код</button>
      {result && <p>{result}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default TaskPage;
