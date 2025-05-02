import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/theoryListPage.css";
import { FiArrowUp, FiArrowDown, FiEdit, FiTrash2 } from "react-icons/fi";

const TheoryListPage = () => {
  const [theories, setTheories] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

    const fetchTheories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Токен отсутствует");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTheories(data);
        } else {
          console.error("Ошибка при загрузке теорий:", response.statusText);
        }
      } catch (error) {
        console.error("Ошибка при загрузке теорий:", error);
      }
    };

    fetchUser();
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

  const handleDeleteTheory = async (slug) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту теорию?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory/${slug}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setTheories((prev) => prev.filter((t) => t.slug !== slug));
      } else {
        const error = await response.json();
        alert("Ошибка: " + error.message);
      }
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="theory-list-page">
      <h1 className="theory-list-page__title">Выберите раздел теории</h1>
      <div className="theory-list-page__content">
        <div className="theory-list-page__links">
          {theories.map((theory, index) => (
            <div key={theory._id} className="theory-list-page__item">
              <button
                className="theory-list-page__button"
                onClick={() => handleTheoryClick(theory.slug)}
              >
                {theory.title}
              </button>
              {user && user.role === "admin" && (
                <div className="theory-list-page__buttons">
                  <button
                    className="theory-list-page__move-button"
                    onClick={() => handleMoveTheory(theory._id, "up")}
                    disabled={index === 0} // Отключаем кнопку "вверх", если теория первая
                  >
                    <FiArrowUp size={18} />
                  </button>
                  <button
                    className="theory-list-page__move-button"
                    onClick={() => handleMoveTheory(theory._id, "down")}
                    disabled={index === theories.length - 1} // Отключаем кнопку "вниз", если теория последняя
                  >
                    <FiArrowDown size={18} />
                  </button>
                  <Link to={`/theories/edit/${theory.slug}`}>
                    <button className="theory-list-page__edit-button">
                      <FiEdit size={18} />
                    </button>
                  </Link>
                  <button
                    className="theory-list-page__delete-button"
                    onClick={() => handleDeleteTheory(theory.slug)}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          className="theory-list-page__back-button"
          onClick={handleBackToDashboard}
        >
          Вернуться в Dashboard
        </button>
      </div>
    </div>
  );
};

export default TheoryListPage;
