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

  useEffect(() => {
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

    if (slug) fetchTheory(); // Загружаем теорию, если есть slug
  }, [slug]); // Эффект сработает при изменении slug

  return (
    <div>
      {theory ? (
        <div className="main-content">
          <h1>{theory.title}</h1>
          <h3>{theory.category}</h3>
          <ReactMarkdown
            children={theory.markdownContent}
            remarkPlugins={[remarkGfm]}
          />
          <Link to="/theory">
            <button>Назад к списку теорий</button>
          </Link>
        </div>
      ) : (
        <p>Загрузка...</p> // Показываем сообщение пока данные загружаются
      )}
    </div>
  );
};

export default TheoryPage;
