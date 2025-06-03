import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Удаляем токен
    navigate("/"); // Перенаправляем на главную
  };

  return (
    <nav className="navbar">
      {/* {user && user.role === "admin" && (
        <div className="admin-panel">
          <span className="admin-badge">Admin</span>
          <Link to="/create-task" className="create-task-btn">
            <button>Новая Задача</button>
          </Link>
          <Link to="/create-theory" className="create-theory-btn">
            <button>Новая Теория</button>
          </Link>
        </div>
      )} */}
      {user && (
        <div className="user-links">
          <Link to="/dashboard" className="dashboard-btn">
            <button>На главную</button>
          </Link>
          <Link to="/profile" className="profile-btn">
            <button>Профиль</button>
          </Link>
          <Link to="/leaderboard" className="leaderboard-btn">
            <button>Таблица Лидеров</button>
          </Link>
        </div>
      )}
      <button onClick={handleLogout} className="logout-btn">
        Выйти
      </button>
    </nav>
  );
};

export default Navbar;
