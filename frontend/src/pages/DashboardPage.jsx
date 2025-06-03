import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const DashboardPage = () => {
  const { user, token } = useContext(AuthContext);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Добро пожаловать!</h1>
      <p className="dashboard-description">
        Выберите, что хотите изучать из языка JavaScript:
      </p>
      <div className="dashboard-buttons">
        <Link to="/theory" className="dashboard-button">
          <button>Перейти к теории</button>
        </Link>
        <Link to="/tasks" className="dashboard-button">
          <button>Перейти к заданиям</button>
        </Link>
      </div>
      <div className="admin-buttons">
        {user && user.role === "admin" && (
          <>
            <p>
              Администратор <strong>{user.nickname}</strong>, чем хотите
              заняться?
            </p>
            <div className="dashboard-buttons">
              <Link to="/reports" className="dashboard-button">
                <button>Перейти к жалобам</button>
              </Link>
              <Link to="/adminUsers" className="dashboard-button">
                <button>Перейти к пользователям</button>
              </Link>
            </div>
            <div className="admin-panel">
              <Link to="/create-task" className="dashboard-button">
                <button>Новая Задача</button>
              </Link>
              <Link to="/create-theory" className="dashboard-button">
                <button>Новая Теория</button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
