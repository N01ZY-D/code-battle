import React from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css"; // Импортируем стили для главной страницы

const HomePage = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Добро пожаловать на сайт!</h1>
      <p className="home-description">
        Это сайт для изучения теории программирования на языке JavaScript.
      </p>
      <div className="home-buttons">
        <Link to="/login" className="home-button">
          <button>Авторизация</button>
        </Link>
        <Link to="/register" className="home-button">
          <button>Регистрация</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
