import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    <div>
      <h2>Создание новой теории</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Название"
          value={theoryData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="slug"
          placeholder="Уникальный URL (slug)"
          value={theoryData.slug}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Категория"
          value={theoryData.category}
          onChange={handleChange}
          required
        />
        <textarea
          name="markdownContent"
          placeholder="Markdown описание"
          value={theoryData.markdownContent}
          onChange={handleChange}
          required
        />
        <button type="submit">Создать теорию</button>
      </form>
    </div>
  );
};

export default CreateTheoryPage;
