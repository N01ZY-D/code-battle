import React, { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import axios from "axios";
import "../styles/leaderboardPage.css"; // Импортируем стили для страницы таблицы лидеров

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/leaderboard`
        );
        const sortedLeaderboard = response.data.sort(
          (a, b) => b.solvedTasksCount - a.solvedTasksCount
        );
        setLeaderboard(sortedLeaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Таблица лидеров</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Место</th>
            <th>Никнейм</th>
            <th>Аватар</th>
            <th>Решено задач</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.nickname}</td>
              <td>
                <div className="leaderboard-avatar">
                  <Avatar
                    matrix={user.avatarMatrix}
                    color={user.avatarColor}
                    size={48}
                  />
                </div>
              </td>
              <td>{user.solvedTasksCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardPage;
