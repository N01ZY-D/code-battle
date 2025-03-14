import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TheoryListPage from "./pages/TheoryListPage"; // Новый компонент для списка теорий
import TheoryPage from "./pages/TheoryPage"; // Страница с конкретной теорией
import TasksPage from "./pages/TasksPage"; // Новый компонент для страницы с заданиями
import PrivateRoute from "./components/PrivateRoute"; // Компонент для защиты маршрутов

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Страница для выбора между теорией и заданиями (доступна только после авторизации) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Страница выбора теории */}
        <Route
          path="/theory"
          element={
            <PrivateRoute>
              <TheoryListPage />
            </PrivateRoute>
          }
        />

        {/* Страница с конкретной теорией */}
        <Route
          path="/theory/:slug"
          element={
            <PrivateRoute>
              <TheoryPage />
            </PrivateRoute>
          }
        />

        {/* Страница с заданиями */}
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <TasksPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
