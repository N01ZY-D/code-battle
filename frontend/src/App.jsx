import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import RegisterPage from "./pages/RegisterPage";
import TheoryListPage from "./pages/TheoryListPage";
import TheoryPage from "./pages/TheoryPage";
import TasksPage from "./pages/TasksPage";
import TaskPage from "./pages/TaskPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import EditTaskPage from "./pages/EditTaskPage";
import CreateTheoryPage from "./pages/CreateTheoryPage";
import EditTheoryPage from "./pages/EditTheoryPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";

import { ContentProvider } from "./context/ContentContext";

import "./main.css";

const AppContent = () => {
  const location = useLocation();

  const hideNavbarOn = ["/", "/login", "/register"];
  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname);

  return (
    <ContentProvider>
      <>
        {shouldShowNavbar && <Navbar />}
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
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TasksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <PrivateRoute>
                <TaskPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks/edit/:taskId"
            element={
              <PrivateRoute>
                <EditTaskPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-task"
            element={
              <PrivateRoute>
                <CreateTaskPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-theory"
            element={
              <PrivateRoute>
                <CreateTheoryPage /> {/* Страница создания теории */}
              </PrivateRoute>
            }
          />
          <Route
            path="/theories/edit/:slug"
            element={
              <PrivateRoute>
                <EditTheoryPage /> {/* Страница редактирования теории */}
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage /> {/* Страница профиля */}
              </PrivateRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <LeaderboardPage /> {/* Страница таблицы лидеров */}
              </PrivateRoute>
            }
          />
        </Routes>
      </>
    </ContentProvider>
  );
};

const App = () => <AppContent />;

export default App;
