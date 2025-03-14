import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div>
      <h1>Добро пожаловать на сайт!</h1>
      <p>Это сайт для изучения теории программирования.</p>
      <div>
        <Link to="/login">
          <button>Авторизация</button>
        </Link>
        <Link to="/register">
          <button>Регистрация</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
