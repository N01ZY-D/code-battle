import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { FiEdit, FiAlertOctagon, FiCheck } from "react-icons/fi";
import Editor from "@monaco-editor/react";
import "../styles/taskPage.css";

const TaskPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [failedTests, setFailedTests] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Токен отсутствует");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error(
            "Ошибка при загрузке данных пользователя:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователя:", error);
      }
    };
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

    fetchUser();
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
      <div className="upper-button-container">
        <Link to="/tasks">
          <button>Назад к списку задач</button>
        </Link>
        {user && user.role === "admin" && (
          <Link to={`/tasks/edit/${task._id}`}>
            <button>
              <FiEdit size={18} />
            </button>
          </Link>
        )}
      </div>

      <h3>Условие:</h3>
      <ReactMarkdown>{task.markdownContent}</ReactMarkdown>

      {task.tests.length > 0 && (
        <>
          <h3>Примеры входных данных (первые 3):</h3>
          {task.tests.slice(0, 3).map((test, index) => (
            <pre key={index}>
              Вход: {test.input} → Ожидаемый выход: {test.output}
            </pre>
          ))}
        </>
      )}

      <h3>Ваш код:</h3>
      <Editor
        className="code-editor"
        height="400px"
        defaultLanguage="javascript"
        value={userCode}
        onChange={(value) => setUserCode(value || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          scrollbar: {
            vertical: "auto", // <-- ключевая строка
            horizontal: "auto",
          },
          fontSize: 16,
          wordWrap: "on",
          lineNumbers: "on",
          automaticLayout: true,
        }}
      />

      <button
        onClick={handleSubmit}
        style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}
      >
        Проверить код
      </button>

      {result === "Правильный код!" && (
        <div className="test-success-box">
          <FiCheck className="test-success-icon" />
          {result}
        </div>
      )}

      {failedTests.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Ошибки в тестах:</h3>
          {(() => {
            // Берём только первый проваленный тест
            const failedTest = failedTests[0];

            const originalIndex = task.tests.findIndex((t) => {
              const taskId = t._id?.$oid || t._id;
              const failedId = failedTest._id?.$oid || failedTest._id;
              return taskId === failedId;
            });

            const displayIndex = originalIndex >= 0 ? originalIndex : 0;
            const isFirstThree = displayIndex < 3;

            return (
              <div
                className="test-error-box"
                key={failedTest._id || Math.random()}
              >
                <p className="test-error-title">
                  <FiAlertOctagon size={25} /> Ошибка в тесте {displayIndex + 1}
                </p>

                {isFirstThree ? (
                  <>
                    <p className="test-error-entry">
                      <strong>Вход:</strong> <code>{failedTest.input}</code>
                    </p>
                    <p className="test-error-entry">
                      <strong>Ожидаемый результат:</strong>{" "}
                      <code>{failedTest.expected}</code>
                    </p>
                    <p className="test-error-entry">
                      <strong>Получено:</strong> <code>{failedTest.got}</code>
                    </p>
                    {failedTest.error && (
                      <p className="test-error-entry">
                        <strong>Ошибка от сервера:</strong> {failedTest.error}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="test-error-entry">
                    Тест {displayIndex + 1} не пройден.
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TaskPage;
