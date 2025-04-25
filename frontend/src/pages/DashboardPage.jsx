import React from "react";
import { Link, useNavigate } from "react-router-dom";

const DashboardPage = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Добро пожаловать!</h1>
      <p className="dashboard-description">Выберите, что хотите изучать:</p>
      <div className="dashboard-buttons">
        <Link to="/theory" className="dashboard-button">
          <button>Перейти к теории</button>
        </Link>
        <Link to="/tasks" className="dashboard-button">
          <button>Перейти к заданиям</button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
