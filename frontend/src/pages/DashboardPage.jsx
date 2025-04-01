import React from "react";
import { Link, useNavigate } from "react-router-dom";

const DashboardPage = () => {
  return (
    <div className="dashboard">
      <h1>Добро пожаловать!</h1>
      <div className="dashboard-container">
        <p>Выберите, что хотите изучать:</p>
        <div className="links">
          <Link to="/theory" className="btn">
            <button>Перейти к теории</button>
          </Link>
          <Link to="/tasks" className="btn">
            <button>Перейти к заданиям</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
