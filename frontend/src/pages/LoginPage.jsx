import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // Импортируем Link для навигации
import AuthContext from "../context/AuthContext"; // Импортируем контекст

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
    <div>
      <h1>Авторизация</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>}
        <button type="submit">Войти</button>
      </form>
      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>{" "}
        {/* Ссылка на страницу регистрации */}
      </p>
      <p>
        Вернуться на <Link to="/">главную</Link>
      </p>
    </div>
  );
};

export default LoginPage;
