import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // Импортируем Link для навигации
import AuthContext from "../context/AuthContext"; // Импортируем контекст
import "../styles/LoginPage.css"; // Импортируем стили для страницы логина

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext); // Получаем login из контекста
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/login`,
        {
          email,
          password,
        }
      );
      login(response.data.token); // Сохраняем токен в контексте
      navigate("/dashboard"); // Переходим на главную страницу после успешного логина
    } catch (error) {
      setError("Неверные данные для входа");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Авторизация</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button">
            Войти
          </button>
        </form>
        <div className="login-links">
          <p>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
          <p>
            Вернуться на <Link to="/">главную</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
