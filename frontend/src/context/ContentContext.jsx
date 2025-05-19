// ContentContext.js
import React, { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "./AuthContext";

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [theories, setTheories] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksRes, theoriesRes, orderRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/tasks`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/api/category-order`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);
        setTasks(tasksRes.data);
        setTheories(theoriesRes.data);
        setCategoryOrder(orderRes.data);
      } catch (error) {
        console.error(
          "Ошибка при загрузке задач, теорий и порядка категорий:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Функция для обновления порядка категорий и синхронизации с сервером
  const updateCategoryOrder = async (newOrder) => {
    setCategoryOrder(newOrder);
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/category-order`,
        { value: newOrder },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Ошибка при обновлении порядка категорий:", error);
    }
  };

  return (
    <ContentContext.Provider
      value={{
        tasks,
        setTasks,
        theories,
        setTheories,
        categoryOrder,
        setCategoryOrder: updateCategoryOrder,
        loading,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export default ContentContext;
