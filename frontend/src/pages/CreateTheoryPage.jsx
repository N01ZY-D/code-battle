import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/createTheoryPage.css";

const CreateTheoryPage = ({ slug, initialData }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [theoryData, setTheoryData] = useState({
    title: "",
    slug: "",
    category: "",
    markdownContent: "",
  });

  // Получаем информацию о пользователе и проверяем роль администратора
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
          if (data.role !== "admin") navigate("/dashboard"); // Перенаправляем не-администраторов
        }
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      }
    };

    fetchUser();
  }, [navigate]);

  // Если переданы данные для редактирования, заполняем их в состояние
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
  }, [slug, initialData]); // Заполняем форму, если получены данные для редактирования

  // Обработчик изменений
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTheoryData({ ...theoryData, [name]: value });
  };

  // Обработчик изменений высоты текстового поля
  const handleTextareaInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight + 2}px`;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Логируем отправляемые данные
    console.log("Отправляемые данные:", theoryData);

    const token = localStorage.getItem("token");
    const method = slug ? "PUT" : "POST"; // PUT для редактирования, POST для создания
    const url = slug
      ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory/${slug}`
      : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory/create`;

    console.log("URL запроса:", url); // Логируем URL, куда отправляется запрос

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(theoryData),
      });

      // Логируем статус ответа
      console.log("Ответ от сервера:", response);

      if (response.ok) {
        alert("Теория успешно " + (slug ? "обновлена" : "создана"));
        navigate("/theory");
      } else {
        const errorData = await response.json();
        // Логируем ошибку, если запрос не прошел
        console.log("Ошибка от сервера:", errorData);
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
            disabled={slug !== undefined} // Slug отключён в режиме редактирования
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
            {slug ? "Обновить теорию" : "Создать теорию"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTheoryPage;
