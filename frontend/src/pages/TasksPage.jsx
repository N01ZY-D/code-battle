import React from "react";
import { useNavigate } from "react-router-dom";

const TasksPage = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <h1>Задания</h1>
      {/* Заглушка для заданий */}
      <p>Здесь будут отображаться задания.</p>

      <button onClick={handleBackToDashboard}>Вернуться в Dashboard</button>
    </div>
  );
};

export default TasksPage;
