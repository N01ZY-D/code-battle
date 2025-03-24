import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Удаляем токен
    navigate("/"); // Перенаправляем на страницу входа
  };

  return (
    <nav className="navbar">
      <button onClick={handleLogout} className="logout-btn">
        Выйти
      </button>
    </nav>
  );
};

export default Navbar;
