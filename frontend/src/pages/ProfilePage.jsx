import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNickname, setNewNickname] = useState("");
  const [newAvatar, setNewAvatar] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
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
        "http://localhost:5000/api/profile",
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

  return (
    <div>
      <h2>Мой профиль</h2>
      <div>
        <img src={user.avatar} alt="Avatar" width={100} height={100} />
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
        <div>
          <label>Новый аватар (ссылка):</label>
          <input
            type="text"
            value={newAvatar}
            onChange={(e) => setNewAvatar(e.target.value)}
          />
        </div>
        <button onClick={handleUpdateProfile}>Сохранить изменения</button>
      </div>
    </div>
  );
};

export default ProfilePage;
