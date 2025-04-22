import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import axios from "axios";
import "../styles/profilePage.css"; // Импортируем стили для страницы профиля

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNickname, setNewNickname] = useState("");
  const [newAvatar, setNewAvatar] = useState("");

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

  if (loading) return <div>Загрузка...</div>;

  console.log("ProfilePage received user:", user);
  console.log("Avatar matrix:", user?.avatarMatrix);
  console.log("Avatar color:", user?.avatarColor);

  return (
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
        <p>Решено задач: {user.solvedTasksCount}</p>

        <h3>Решения задач</h3>
        {user?.solutions?.length > 0 ? (
          <ul>
            {user.solutions.map((solution) => (
              <li key={solution._id}>
                <Link to={`/tasks/${solution.taskId._id}`}>
                  {solution.taskId.title}
                </Link>
                <pre>
                  <code>{solution.code}</code>
                </pre>
              </li>
            ))}
          </ul>
        ) : (
          <p>Пока нет решений</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
