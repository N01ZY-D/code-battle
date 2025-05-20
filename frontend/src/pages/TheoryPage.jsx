import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom"; // Импортируем Link для навигации
import "../styles/theoryPage.css"; // Импортируем стили для страницы теории
import { FiEdit } from "react-icons/fi";
import AuthContext from "../context/AuthContext";
import ContentContext from "../context/ContentContext";

const TheoryPage = () => {
  const { slug } = useParams(); // Получаем slug из URL
  const [theory, setTheory] = useState(null); // Состояние для хранения теории
  const { user, token } = useContext(AuthContext); // Получаем данные пользователя из контекста
  const { theories } = useContext(ContentContext); // Получаем теории из контекста
  const [prevSlug, setPrevSlug] = useState(null);
  const [nextSlug, setNextSlug] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTheory = async () => {
      try {
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
        setTheory(response.data);

        // Найдём индекс текущей теории в общем списке
        const index = theories.findIndex((t) => t.slug === slug);

        if (index !== -1) {
          const prev = theories[index - 1];
          const next = theories[index + 1];

          setPrevSlug(prev ? prev.slug : null);
          setNextSlug(next ? next.slug : null);
        } else {
          setPrevSlug(null);
          setNextSlug(null);
        }
      } catch (error) {
        console.error("Ошибка загрузки темы:", error);
      }
    };

    if (slug && theories.length > 0) {
      fetchTheory();
    }
  }, [slug, theories]);

  // // Получаем предыдущую и следующую теории
  // let prevTheory = null;
  // let nextTheory = null;

  // if (theories.length > 0 && theory) {
  //   const sameCategory = theories
  //     .filter((t) => t.category === theory.category)
  //     .sort((a, b) => a.order - b.order);

  //   const index = sameCategory.findIndex((t) => t.slug === theory.slug);
  //   if (index > 0) prevTheory = sameCategory[index - 1];
  //   if (index < sameCategory.length - 1) nextTheory = sameCategory[index + 1];
  // }

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
                <button>
                  <FiEdit size={18} />
                </button>
              </Link>
            )}
          </div>
          <h3>{theory.category}</h3>
          <ReactMarkdown
            children={theory.markdownContent}
            remarkPlugins={[remarkGfm]}
          />
          <div className="lower-button-container">
            {prevSlug && (
              <button onClick={() => navigate(`/theory/${prevSlug}`)}>
                ← {prevSlug.title}
              </button>
            )}
            <Link to="/theory">
              <button>К списку</button>
            </Link>
            {nextSlug && (
              <button onClick={() => navigate(`/theory/${nextSlug}`)}>
                {nextSlug.title} →
              </button>
            )}
          </div>
        </div>
      ) : (
        <p>Загрузка...</p> // Показываем сообщение пока данные загружаются
      )}
    </div>
  );
};

export default TheoryPage;
