import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/tasksPage.css"; // Импортируем стили для страницы заданий
import { FiArrowUp, FiArrowDown, FiEdit, FiTrash2 } from "react-icons/fi";

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

  const handleDeleteTask = async (taskId) => {
    const confirm = window.confirm(
      "Вы уверены, что хотите удалить эту задачу?"
    );
    if (!confirm) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Обновляем список задач
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="tasks-page">
      <h1 className="tasks-page__title">Выберете задачу</h1>
      <div className="tasks-page__content">
        {tasks.length === 0 ? (
          <p className="tasks-page__no-tasks">Нет доступных заданий</p>
        ) : (
          <div className="tasks-page__list">
            {tasks.map((task, index) => (
              <div key={task._id} className="tasks-page__item">
                <button
                  className="tasks-page__button"
                  onClick={() => navigate(`/tasks/${task._id}`)} // Перенаправление на страницу задания
                >
                  {task.title}
                </button>
                {user && user.role === "admin" && (
                  <div className="tasks-page__buttons">
                    <button
                      className="tasks-page__move-button"
                      onClick={() => handleMoveTask(task._id, "up")}
                      disabled={index === 0} // Отключаем кнопку "вверх", если задание первое
                    >
                      <FiArrowUp size={18} />
                    </button>
                    <button
                      className="tasks-page__move-button"
                      onClick={() => handleMoveTask(task._id, "down")}
                      disabled={index === tasks.length - 1} // Отключаем кнопку "вниз", если задание последнее
                    >
                      <FiArrowDown size={18} />
                    </button>
                    <Link to={`/tasks/edit/${task._id}`}>
                      <button className="tasks-page__edit-button">
                        <FiEdit size={18} />
                      </button>
                    </Link>
                    <button
                      className="tasks-page__delete-button"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          className="tasks-page__back-button"
          onClick={handleBackToDashboard}
        >
          Вернуться в Dashboard
        </button>
      </div>
    </div>
  );
};

export default TasksPage;
