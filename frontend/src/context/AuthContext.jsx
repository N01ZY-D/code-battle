import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Если не установлен, установите пакет: npm install jwt-decode

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка наличия токена при старте приложения
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Token decoding error:", err);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  // Логика для логина и логаута
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken); // Сохраняем токен в localStorage
  };
  const logout = () => {
    setToken(null);
    localStorage.removeItem("token"); // Удаляем токен при логауте
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {!isLoading && children} {/* Показываем контент только после загрузки */}
    </AuthContext.Provider>
  );
};

export default AuthContext;
