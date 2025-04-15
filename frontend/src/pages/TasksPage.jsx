import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/tasks`
        );
        console.log("Полученные данные:", response.data); // Логируем данные
        setTasks(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке заданий:", error);
      }
    };
    fetchTasks();
  }, []);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <h1>Список Заданий</h1>
      <ul>
        {tasks.length === 0 ? (
          <p>Нет доступных заданий</p>
        ) : (
          tasks.map((task) => (
            <li key={task._id}>
              <Link to={`/tasks/${task._id}`}>{task.title}</Link>
            </li>
          ))
        )}
      </ul>
      <button onClick={handleBackToDashboard}>Вернуться в Dashboard</button>
    </div>
  );
};

export default TasksPage;
