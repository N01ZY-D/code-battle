import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import axios from "axios";
import "../styles/profilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNickname, setNewNickname] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [expandedTasks, setExpandedTasks] = useState({}); // хранит состояния открытых блоков

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(
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
      setUser(response.data.user);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Группировка решений по задаче
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

  if (loading) return <div>Загрузка...</div>;

  const groupedSolutions = groupSolutionsByTask(user.solutions);

  return (
    <div>
      <div className="back-to-dashboard">
        <Link to="/dashboard">
          <button
            className="back-button"
            style={{ backgroundColor: "#cd853f", marginTop: "100px" }}
          >
            Вернуться в Dashboard
          </button>
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
            Решения задач (уникальных задач решено: {user.solvedTasksCount})
          </h3>
          {user?.solutions?.length > 0 ? (
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
