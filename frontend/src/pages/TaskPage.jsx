import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const TaskPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [failedTests, setFailedTests] = useState([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/tasks/${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTask(response.data);

        // Генерируем сигнатуру функции
        if (response.data.functionName) {
          const params =
            response.data.parameters.split(" ").join(", ") || "...args";
          setUserCode(
            `function ${response.data.functionName}(${params}) {\n  // Ваш код здесь\n}`
          );
        }
      } catch (error) {
        console.error("Ошибка при загрузке задания:", error);
        setError("Не удалось загрузить задание.");
      }
    };

    if (taskId) fetchTask();
  }, [taskId]);

  const handleCodeChange = (e) => {
    setUserCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task || !task.tests || task.tests.length === 0) {
      setError("Ошибка: нет тестов для проверки.");
      return;
    }

    console.log("Sending data:", {
      code: userCode,
      tests: task.tests,
    });

    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/tasks/${taskId}/check`,
        {
          code: userCode,
          tests: task.tests,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setResult("Правильный код!");
        setFailedTests([]);
      } else {
        setResult("Неправильный код.");
        setFailedTests(response.data.failedTests);
      }

      setError("");
    } catch (error) {
      setError("Ошибка при проверке кода.");
      console.error(error);
    }
  };

  if (error)
    return (
      <>
        <p style={{ color: "red" }}>{error}</p>
        <Link to="/tasks">
          <button style={{ marginBottom: "10px" }}>Назад к списку задач</button>
        </Link>
      </>
    );

  if (!task)
    return (
      <>
        <p>Задание не найдено</p>
        <Link to="/tasks">
          <button style={{ marginBottom: "10px" }}>Назад к списку задач</button>
        </Link>
      </>
    );

  return (
    <div
      className="main-task-content"
      style={{ maxWidth: "800px", padding: "20px" }}
    >
      <h1>{task.title}</h1>
      <p>
        <strong>Категория:</strong> {task.category} |{" "}
        <strong>Сложность:</strong> {task.difficulty}
      </p>

      <Link to="/tasks">
        <button style={{ marginBottom: "10px" }}>Назад к списку задач</button>
      </Link>

      <h3>Условие:</h3>
      <ReactMarkdown>{task.markdownContent}</ReactMarkdown>

      {task.tests.length > 0 && (
        <>
          <h3>Примеры входных данных:</h3>
          {task.tests.map((test, index) => (
            <pre key={index}>
              Вход: {test.input} → Ожидаемый выход: {test.output}
            </pre>
          ))}
        </>
      )}

      <h3>Ваш код:</h3>
      <textarea
        value={userCode}
        onChange={handleCodeChange}
        rows="10"
        cols="60"
        placeholder="Введите ваш код..."
        style={{ width: "100%", fontSize: "16px" }}
      />

      <button
        onClick={handleSubmit}
        style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}
      >
        Проверить код
      </button>

      {result && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>{result}</p>
      )}

      {failedTests.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Ошибки тестов:</h3>
          {failedTests.map((test, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <p>
                <strong>Тест {index + 1}:</strong>
              </p>
              <p>Вход: {test.input}</p>
              <p>Ожидаемый выход: {test.expected}</p>
              <p>Получено: {test.got}</p>
              {test.error && (
                <p style={{ color: "red" }}>Ошибка: {test.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskPage;
