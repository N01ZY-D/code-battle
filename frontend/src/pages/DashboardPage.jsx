import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
//import AdminReportPage from "./AdminReportPage";

const DashboardPage = () => {
  const { user, token } = useContext(AuthContext);

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
        {user && user.role === "admin" && (
          <Link to="/reports" className="dashboard-button">
            <button>Перейти к жалобам</button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
