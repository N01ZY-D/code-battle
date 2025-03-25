import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

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
      {user && user.role === "admin" && (
        <div className="admin-panel">
          <span className="admin-badge">Admin</span>
          <Link to="/create-task" className="create-task-btn">
            <button>Новая Задача</button>
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
