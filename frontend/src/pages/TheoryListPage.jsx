import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TheoryListPage = () => {
  const [theories, setTheories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTheories = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/theory", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Используем токен
          },
        });
        setTheories(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке теорий:", error);
      }
    };

    fetchTheories();
  }, []);

  const handleTheoryClick = (slug) => {
    navigate(`/theory/${slug}`); // Перенаправление на страницу конкретной теории
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <h1>Выберите раздел теории</h1>
      <div>
        {theories.map((theory) => (
          <button
            key={theory._id}
            onClick={() => handleTheoryClick(theory.slug)}
          >
            {theory.title}
          </button>
        ))}
        <button onClick={handleBackToDashboard}>Вернуться в Dashboard</button>
      </div>
    </div>
  );
};

export default TheoryListPage;
