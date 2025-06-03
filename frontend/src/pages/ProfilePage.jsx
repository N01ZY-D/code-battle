import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../styles/profilePage.css";

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);
  const [solutions, setSolutions] = useState([]);
  const [solvedTasksCount, setSolvedTasksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newNickname, setNewNickname] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [expandedTasks, setExpandedTasks] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/profile/stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSolutions(res.data.solutions || []);
        setSolvedTasksCount(res.data.solvedTasksCount || 0);
      } catch (error) {
        console.error("Ошибка загрузки статистики:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/profile`,
        {
          nickname: newNickname || user.nickname,
          avatar: newAvatar || user.avatar,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Обновляем контекст пользователя
      login(localStorage.getItem("token"));
      setNewNickname("");
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
    }
  };

  const groupSolutionsByTask = (solutions) => {
    const grouped = {};
    solutions.forEach((sol) => {
      const taskId = sol.taskId._id;
      if (!grouped[taskId]) {
        grouped[taskId] = {
          taskTitle: sol.taskId.title,
          solutions: [],
        };
      }
      grouped[taskId].solutions.push(sol);
    });
    return grouped;
  };

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  if (!user || loading) return <div>Загрузка...</div>;

  const groupedSolutions = groupSolutionsByTask(solutions);

  return (
    <div>
      <div className="back-button-container">
        <Link to="/dashboard">
          <button className="back-button">Вернуться в Dashboard</button>
        </Link>
      </div>
      <div className="profile-container">
        <div className="profile-left">
          <Avatar
            matrix={user.avatarMatrix}
            color={user.avatarColor}
            size={324}
          />
          <div className="profile-nickname-block">
            <p className="profile-label">Никнейм:</p>
            <p className="profile-nickname">{user.nickname}</p>

            <div className="profile-update-form">
              <h3 className="profile-update-title">Обновить профиль</h3>
              <div className="profile-input-group">
                <label className="profile-input-label">Новый никнейм:</label>
                <input
                  type="text"
                  className="profile-input"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                />
              </div>
              <button
                className="profile-save-button"
                onClick={handleUpdateProfile}
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>

        <div className="profile-right">
          <h3 className="profile-section-title">
            Решения задач (уникальных задач решено: {solvedTasksCount})
          </h3>
          {solutions.length > 0 ? (
            <div className="solutions-accordion">
              {Object.entries(groupedSolutions).map(([taskId, taskData]) => (
                <div key={taskId} className="accordion-task-block">
                  <div
                    className="accordion-task-title"
                    onClick={() => toggleExpand(taskId)}
                  >
                    {expandedTasks[taskId] ? "▾" : "▸"}{" "}
                    <Link to={`/tasks/${taskId}`} className="solution-title">
                      {taskData.taskTitle}
                    </Link>
                  </div>
                  {expandedTasks[taskId] && (
                    <div className="accordion-solutions-list">
                      {taskData.solutions.map((sol) => (
                        <div key={sol._id} className="solution-card">
                          <p className="solution-date">
                            {new Date(sol.createdAt).toLocaleString("ru-RU")}
                          </p>
                          <pre className="solution-code">
                            <code>{sol.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Пока нет решений</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
