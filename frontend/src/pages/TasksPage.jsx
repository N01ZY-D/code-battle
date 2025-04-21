import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
        }
      } catch (error) {
        console.error("Ошибка загрузки данных пользователя:", error);
      }
    };

    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Токен отсутствует");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Задания успешно загружены:", response.data);
        setTasks(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке заданий:", error);
      }
    };

    fetchUser();
    fetchTasks();
  }, []);

  const handleMoveTask = async (taskId, direction) => {
    const newTasks = [...tasks];
    const taskIndex = newTasks.findIndex((task) => task._id === taskId);

    if (direction === "up" && taskIndex > 0) {
      [newTasks[taskIndex], newTasks[taskIndex - 1]] = [
        newTasks[taskIndex - 1],
        newTasks[taskIndex],
      ];
    } else if (direction === "down" && taskIndex < newTasks.length - 1) {
      [newTasks[taskIndex], newTasks[taskIndex + 1]] = [
        newTasks[taskIndex + 1],
        newTasks[taskIndex],
      ];
    }

    // Переназначаем правильные порядковые номера
    const reorderedTasks = newTasks.map((task, index) => ({
      _id: task._id,
      order: index,
    }));

    setTasks(newTasks);

    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/tasks/reorder`,
        { tasks: reorderedTasks }, // отправляем задачи с _id и order
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Ошибка при обновлении порядка задач:", error);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <h1>Список Заданий</h1>
      <div>
        {tasks.length === 0 ? (
          <p>Нет доступных заданий</p>
        ) : (
          tasks.map((task, index) => (
            <div key={task._id} style={{ marginBottom: "10px" }}>
              <button
                onClick={() => navigate(`/tasks/${task._id}`)} // Перенаправление на страницу задания
                style={{ fontSize: "16px" }}
              >
                {task.title}
              </button>
              {user && user.role === "admin" && (
                <div style={{ marginTop: "5px" }}>
                  <button
                    onClick={() => handleMoveTask(task._id, "up")}
                    disabled={index === 0} // Отключаем кнопку "вверх", если задание первое
                  >
                    Вверх
                  </button>
                  <button
                    onClick={() => handleMoveTask(task._id, "down")}
                    disabled={index === tasks.length - 1} // Отключаем кнопку "вниз", если задание последнее
                  >
                    Вниз
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <button onClick={handleBackToDashboard}>Вернуться в Dashboard</button>
    </div>
  );
};

export default TasksPage;
