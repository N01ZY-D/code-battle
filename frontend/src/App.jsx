import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TheoryListPage from "./pages/TheoryListPage";
import TheoryPage from "./pages/TheoryPage";
import TasksPage from "./pages/TasksPage"; // Исправлено название
import TaskPage from "./pages/TaskPage"; // Страница с конкретным заданием
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/theory"
          element={
            <PrivateRoute>
              <TheoryListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/theory/:slug"
          element={
            <PrivateRoute>
              <TheoryPage />
            </PrivateRoute>
          }
        />
        {/* Страница со списком заданий */}
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <TasksPage />
            </PrivateRoute>
          }
        />
        {/* Страница с конкретным заданием */}
        <Route
          path="/tasks/:taskId"
          element={
            <PrivateRoute>
              <TaskPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
