import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import AuthContext from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const token = localStorage.getItem("token");
  //     if (!token) return;

  //     try {
  //       const response = await fetch(
  //         `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/me`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       if (response.ok) {
  //         const data = await response.json();
  //         setUser(data);
  //       }
  //     } catch (error) {
  //       console.error("Ошибка загрузки данных пользователя:", error);
  //     }
  //   };

  //   fetchUser();
  // }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 1rem",
      }}
    >
      {user && (
        <div
          className="user-links"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              matrix={user.avatarMatrix}
              color={user.avatarColor}
              size={60}
            />
          </div>
          <Link to="/dashboard">
            <button className="nav-button">На главную</button>
          </Link>
          <Link to="/profile">
            <button className="nav-button">Профиль</button>
          </Link>
          <Link to="/leaderboard">
            <button className="nav-button">Таблица Лидеров</button>
          </Link>
        </div>
      )}

      {user && (
        <button onClick={handleLogout} className="nav-button exit">
          Выйти
        </button>
      )}
    </nav>
  );
};

export default Navbar;
