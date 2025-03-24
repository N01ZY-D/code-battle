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
import PrivateRoute from "./components/PrivateRoute";

const AppContent = () => {
  const location = useLocation();

  const hideNavbarOn = ["/", "/login", "/register"];
  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname);

  return (
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
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
