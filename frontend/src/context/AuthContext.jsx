// AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          // Загружаем данные пользователя
          const response = await axios.get(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            }
          );
          setUser(response.data); // email, role и т.п.
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Ошибка авторизации:", err);
        localStorage.removeItem("token");
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        }
      );
      setUser(response.data);
    } catch (err) {
      console.error("Ошибка при получении данных пользователя:", err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, setUser, login, logout, isLoading }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
