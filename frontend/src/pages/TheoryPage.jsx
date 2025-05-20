import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/theoryPage.css";
import { FiEdit } from "react-icons/fi";
import AuthContext from "../context/AuthContext";
import ContentContext from "../context/ContentContext";

const TheoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [theory, setTheory] = useState(null);
  const [prevSlug, setPrevSlug] = useState(null);
  const [nextSlug, setNextSlug] = useState(null);

  const { user } = useContext(AuthContext);
  const { theories, categoryOrder } = useContext(ContentContext);

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
        const currentTheory = response.data;
        setTheory(currentTheory);

        // Сортировка теорий по порядку категорий и порядку внутри категории
        const sortedTheories = [...theories].sort((a, b) => {
          const categoryIndexA = categoryOrder.indexOf(a.category);
          const categoryIndexB = categoryOrder.indexOf(b.category);

          if (categoryIndexA !== categoryIndexB) {
            return categoryIndexA - categoryIndexB;
          }
          return a.order - b.order;
        });

        // Поиск текущей теории в отсортированном списке
        const index = sortedTheories.findIndex(
          (t) => t.slug === currentTheory.slug
        );

        setPrevSlug(index > 0 ? sortedTheories[index - 1].slug : null);
        setNextSlug(
          index < sortedTheories.length - 1
            ? sortedTheories[index + 1].slug
            : null
        );
      } catch (error) {
        console.error("Ошибка загрузки теории:", error);
      }
    };

    if (slug && theories.length > 0 && categoryOrder.length > 0) {
      fetchTheory();
    }
  }, [slug, theories, categoryOrder]);

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
                ← Назад
              </button>
            )}
            <Link to="/theory">
              <button>К списку</button>
            </Link>
            {nextSlug && (
              <button onClick={() => navigate(`/theory/${nextSlug}`)}>
                Далее →
              </button>
            )}
          </div>
        </div>
      ) : (
        <p>Загрузка...</p>
      )}
    </div>
  );
};

export default TheoryPage;
