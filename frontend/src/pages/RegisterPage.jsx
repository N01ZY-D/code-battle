import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // Импортируем Link для навигации
import "../styles/RegisterPage.css"; // Импортируем стили для страницы регистрации

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState(""); // Состояние для никнейма
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/register`,
        {
          email,
          password,
          nickname, // Добавляем никнейм
        }
      );
      localStorage.setItem("token", response.data.token); // Сохраняем токен
      navigate("/dashboard"); // Переходим на главную страницу после успешной регистрации
    } catch (error) {
      setError("Ошибка регистрации. Попробуйте другой email.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1 className="register-title">Регистрация</h1>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="register-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="register-group">
            <label>Никнейм</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          {error && <p className="register-error">{error}</p>}
          <button type="submit" className="register-button">
            Зарегистрироваться
          </button>
        </form>
        <div className="register-links">
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
          <p>
            Вернуться на <Link to="/">главную</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
