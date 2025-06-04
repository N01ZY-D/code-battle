import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { usePendingReportsCount } from "../hooks/usePendingReportsCount";

const DashboardPage = () => {
  const { user, token } = useContext(AuthContext);
  const { data, error, isLoading } = usePendingReportsCount(token);

  const pendingCount = data?.count || 0;

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/reports/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.count);
        } else {
          console.error("Ошибка при получении количества жалоб");
        }
      } catch (err) {
        console.error("Ошибка при загрузке количества жалоб:", err);
      }
    };

    if (user?.role === "admin") {
      fetchPendingCount();
    }
  }, [token, user]);

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
                <button>
                  Перейти к жалобам
                  {pendingCount > 0 && (
                    <span className="notification-badge">{pendingCount}</span>
                  )}
                </button>
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
