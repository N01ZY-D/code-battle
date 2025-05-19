import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/theoryListPage.css";
import { FiArrowUp, FiArrowDown, FiEdit, FiTrash2 } from "react-icons/fi";
import AuthContext from "../context/AuthContext";
import ContentContext from "../context/ContentContext";

const TheoryListPage = () => {
  const { theories, setTheories, categoryOrder, setCategoryOrder } =
    useContext(ContentContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/category-order`
      );
      setCategoryOrder(res.data); // ← res.data — это массив!
      console.log("Fetched category order:", res.data);
    };
    fetchOrder();
  }, []);

  const handleTheoryClick = (slug) => {
    navigate(`/theory/${slug}`);
  };

  const handleMoveTheory = async (theoryId, direction, category) => {
    const categoryTheories = theories
      .filter((t) => t.category === category)
      .sort((a, b) => a.order - b.order);
    const fullList = [...theories];

    const index = categoryTheories.findIndex((t) => t._id === theoryId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === categoryTheories.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [categoryTheories[index], categoryTheories[targetIndex]] = [
      categoryTheories[targetIndex],
      categoryTheories[index],
    ];

    // Обновляем порядок внутри категории
    const reordered = categoryTheories.map((t, i) => ({
      ...t,
      order: i,
    }));

    // Объединяем с остальными теориями
    const newTheories = fullList.map((t) => {
      const updated = reordered.find((r) => r._id === t._id);
      return updated || t;
    });

    setTheories(newTheories);

    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory/reorder`,
        {
          theories: newTheories.map(({ _id, order }) => ({ _id, order })),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Ошибка при обновлении порядка теорий:", error);
    }
  };

  const handleMoveCategory = (index, direction) => {
    const newOrder = [...categoryOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];

    setCategoryOrder(newOrder);
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

  // Сгруппировать теории по категориям
  const grouped = {};
  theories.forEach((t) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  const allCategories = Object.keys(grouped);
  const sortedCategories = [
    ...categoryOrder,
    ...allCategories.filter((c) => !categoryOrder.includes(c)),
  ];

  const nonEmptyCategories = sortedCategories.filter(
    (category) => grouped[category] && grouped[category].length > 0
  );

  return (
    <div className="theory-list-page">
      <h1 className="theory-list-page__title">Выберите раздел теории</h1>
      <div className="theory-list-page__content">
        {nonEmptyCategories.map((category, index) => (
          <div key={category} className="theory-list-page__category">
            <div className="theory-list-page__category-header">
              <h2 className="theory-list-page__category-title">{category}</h2>

              {user?.role === "admin" && (
                <div className="theory-list-page__category-controls">
                  <button
                    className="theory-list-page__move-button"
                    onClick={() => handleMoveCategory(index, "up")}
                    disabled={index === 0}
                  >
                    <FiArrowUp size={18} />
                  </button>
                  <button
                    className="theory-list-page__move-button"
                    onClick={() => handleMoveCategory(index, "down")}
                    disabled={index === nonEmptyCategories.length - 1}
                  >
                    <FiArrowDown size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="theory-list-page__links">
              {grouped[category]
                ?.sort((a, b) => a.order - b.order)
                .map((theory, idx) => (
                  <div key={theory._id} className="theory-list-page__item">
                    <button
                      className="theory-list-page__button"
                      onClick={() => handleTheoryClick(theory.slug)}
                    >
                      {theory.title}
                    </button>

                    {user?.role === "admin" && (
                      <div className="theory-list-page__buttons">
                        <button
                          className="theory-list-page__move-button"
                          onClick={() =>
                            handleMoveTheory(theory._id, "up", category)
                          }
                          disabled={idx === 0}
                        >
                          <FiArrowUp size={18} />
                        </button>
                        <button
                          className="theory-list-page__move-button"
                          onClick={() =>
                            handleMoveTheory(theory._id, "down", category)
                          }
                          disabled={idx === grouped[category].length - 1}
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
          </div>
        ))}

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
