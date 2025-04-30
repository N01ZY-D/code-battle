import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom"; // Импортируем Link для навигации
import "../styles/theoryPage.css"; // Импортируем стили для страницы теории

const TheoryPage = () => {
  const { slug } = useParams(); // Получаем slug из URL
  const [theory, setTheory] = useState(null); // Состояние для хранения теории
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Токен отсутствует");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error(
            "Ошибка при загрузке данных пользователя:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователя:", error);
      }
    };
    const fetchTheory = async () => {
      try {
        // Запрос на получение теории по slug
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/theory/${slug}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTheory(response.data); // Сохраняем теорию в state
      } catch (error) {
        console.error("Ошибка загрузки темы:", error);
      }
    };

    fetchUser(); // Загружаем данные пользователя
    if (slug) fetchTheory(); // Загружаем теорию, если есть slug
  }, [slug]); // Эффект сработает при изменении slug

  return (
    <div>
      {theory ? (
        <div className="main-content">
          <h1>{theory.title}</h1>
          <div className="upper-button-container">
            <Link to="/theory">
              <button>Назад к списку теорий</button>
            </Link>
            {user && user.role === "admin" && (
              <Link to={`/theories/edit/${theory.slug}`}>
                <button>Редактировать</button>
              </Link>
            )}
          </div>
          <h3>{theory.category}</h3>
          <ReactMarkdown
            children={theory.markdownContent}
            remarkPlugins={[remarkGfm]}
          />
          <div className="lower-button-container">
            <Link to="/theory">
              <button>Назад к списку теорий</button>
            </Link>
          </div>
        </div>
      ) : (
        <p>Загрузка...</p> // Показываем сообщение пока данные загружаются
      )}
    </div>
  );
};

export default TheoryPage;
