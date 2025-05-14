import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext"; // Убедись в корректном пути
import MarkdownEditorPreview from "../components/MarkdownEditorPreview";
import "../styles/createTheoryPage.css";

const CreateTheoryPage = ({ slug, initialData }) => {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext); // Используем контекст
  const [theoryData, setTheoryData] = useState({
    title: "",
    slug: "",
    category: "",
    markdownContent: "",
  });

  // Перенаправление, если не админ
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Заполнение формы при редактировании
  useEffect(() => {
    if (slug && initialData) {
      setTheoryData({
        title: initialData.title,
        slug: initialData.slug,
        category: initialData.category,
        markdownContent: initialData.markdownContent,
      });

      setTimeout(() => {
        const textareas = document.querySelectorAll("textarea");
        textareas.forEach((textarea) => {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight + 2}px`;
        });
      }, 100);
    }
  }, [slug, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTheoryData({ ...theoryData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = slug ? "PUT" : "POST";
    const url = slug
      ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory/${slug}`
      : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory/create`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(theoryData),
      });

      if (response.ok) {
        alert("Теория успешно " + (slug ? "обновлена" : "создана"));
        navigate("/theory");
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Ошибка при сохранении теории:", error);
    }
  };

  if (!user || user.role !== "admin") {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="create-theory-page">
      <h2 className="page-title">
        {slug ? "Редактирование теории" : "Создание новой теории"}
      </h2>
      <form className="theory-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Название</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="Название"
            value={theoryData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="slug">Уникальный URL (slug)</label>
          <input
            id="slug"
            type="text"
            name="slug"
            placeholder="Уникальный URL (slug)"
            value={theoryData.slug}
            onChange={handleChange}
            required
            disabled={!!slug}
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Категория</label>
          <input
            id="category"
            type="text"
            name="category"
            placeholder="Категория"
            value={theoryData.category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="markdownContent">Markdown описание</label>
          <MarkdownEditorPreview
            value={theoryData.markdownContent}
            onChange={(val) =>
              setTheoryData({ ...theoryData, markdownContent: val })
            }
            placeholder="Напишите содержание в формате Markdown..."
          />
        </div>
        <div className="buttons">
          <button type="submit" className="submit-button">
            {slug ? "Обновить теорию" : "Создать теорию"}
          </button>
          {slug && (
            <Link to="/theory">
              <button type="button">Назад к списку теорий</button>
            </Link>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateTheoryPage;
