import React, { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import axios from "axios";

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
    <div>
      <h2>Мой профиль</h2>
      <div>
        <Avatar matrix={user.avatarMatrix} color={user.avatarColor} size={96} />
        <p>Никнейм: {user.nickname}</p>
        <p>Решено задач: {user.solvedTasksCount}</p>
      </div>

      <div>
        <h3>Обновить профиль</h3>
        <div>
          <label>Новый никнейм:</label>
          <input
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
          />
        </div>
        <button onClick={handleUpdateProfile}>Сохранить изменения</button>
      </div>
    </div>
  );
};

export default ProfilePage;
