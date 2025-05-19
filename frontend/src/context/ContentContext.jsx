import React, { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "./AuthContext";

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [theories, setTheories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksRes, theoriesRes] = await Promise.all([
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
        ]);
        setTasks(tasksRes.data);
        setTheories(theoriesRes.data);
      } catch (error) {
        console.error("Ошибка при загрузке задач и теорий:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <ContentContext.Provider
      value={{ tasks, setTasks, theories, setTheories, loading }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export default ContentContext;
