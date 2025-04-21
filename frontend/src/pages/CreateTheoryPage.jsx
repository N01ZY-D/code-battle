import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/createTheoryPage.css";

const CreateTheoryPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [theoryData, setTheoryData] = useState({
    title: "",
    slug: "",
    category: "",
    markdownContent: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          if (data.role !== "admin") navigate("/"); // Не пускаем обычных пользователей
        }
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTheoryData({ ...theoryData, [name]: value });
  };

  const handleTextareaInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(theoryData),
        }
      );

      if (response.ok) {
        alert("Теория успешно создана!");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Ошибка при создании теории:", error);
    }
  };

  if (!user || user.role !== "admin") {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="create-theory-page">
      <h2 className="page-title">Создание новой теории</h2>
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
          <textarea
            id="markdownContent"
            name="markdownContent"
            placeholder="Markdown описание"
            value={theoryData.markdownContent}
            onChange={handleChange}
            onInput={handleTextareaInput}
            required
          />
        </div>
        <div className="buttons">
          <button type="submit" className="submit-button">
            Создать теорию
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTheoryPage;
