import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TheoryListPage = () => {
  const [theories, setTheories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTheories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTheories(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке теорий:", error);
      }
    };

    fetchTheories();
  }, []);

  const handleTheoryClick = (slug) => {
    navigate(`/theory/${slug}`);
  };

  const handleMoveTheory = async (theoryId, direction) => {
    const newTheories = [...theories];
    const theoryIndex = newTheories.findIndex(
      (theory) => theory._id === theoryId
    );

    if (direction === "up" && theoryIndex > 0) {
      [newTheories[theoryIndex], newTheories[theoryIndex - 1]] = [
        newTheories[theoryIndex - 1],
        newTheories[theoryIndex],
      ];
    } else if (direction === "down" && theoryIndex < newTheories.length - 1) {
      [newTheories[theoryIndex], newTheories[theoryIndex + 1]] = [
        newTheories[theoryIndex + 1],
        newTheories[theoryIndex],
      ];
    }

    // Обновление порядка
    const reorderedTheories = newTheories.map((theory, index) => ({
      _id: theory._id,
      order: index, // Здесь устанавливаем новый порядок
    }));

    setTheories(newTheories);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory/reorder`,
        { theories: reorderedTheories },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Ответ от сервера:", response.data); // Логируем ответ от сервера
    } catch (error) {
      console.error("Ошибка при обновлении порядка теорий:", error);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <h1>Выберите раздел теории</h1>
      <div>
        {theories.map((theory, index) => (
          <div key={theory._id} style={{ marginBottom: "10px" }}>
            <button onClick={() => handleTheoryClick(theory.slug)}>
              {theory.title}
            </button>
            <div style={{ marginTop: "5px" }}>
              <button
                onClick={() => handleMoveTheory(theory._id, "up")}
                disabled={index === 0} // Отключаем кнопку "вверх", если теория первая
              >
                Вверх
              </button>
              <button
                onClick={() => handleMoveTheory(theory._id, "down")}
                disabled={index === theories.length - 1} // Отключаем кнопку "вниз", если теория последняя
              >
                Вниз
              </button>
            </div>
          </div>
        ))}
        <button onClick={handleBackToDashboard}>Вернуться в Dashboard</button>
      </div>
    </div>
  );
};

export default TheoryListPage;
