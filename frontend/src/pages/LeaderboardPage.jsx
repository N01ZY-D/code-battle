import React, { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/leaderboardPage.css";
import { useWindowSize } from "../hooks/useWindowSize"; // путь подкорректируй

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const { width } = useWindowSize();

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

  const isMobile = width <= 600;

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Таблица лидеров</h2>
      <div className="leaderboard-back-button-container">
        <Link to="/dashboard">
          <button className="leaderboard-back-button">
            Вернуться в Dashboard
          </button>
        </Link>
      </div>

      {isMobile ? (
        <div className="leaderboard-cards">
          {leaderboard.map((user, index) => (
            <div key={user._id} className="leaderboard-card">
              <div
                className="leaderboard-card-rank"
                style={{
                  backgroundColor:
                    index === 0
                      ? "#ffd700"
                      : index === 1
                      ? "#c0c0c0"
                      : index === 2
                      ? "#cd7f32"
                      : "transparent",
                  color: index <= 2 ? "#2c2f36" : "white",
                }}
              >
                {index + 1}
              </div>
              <Avatar
                matrix={user.avatarMatrix}
                color={user.avatarColor}
                size={64}
              />
              <div className="leaderboard-card-info">
                <p className="leaderboard-card-nickname">{user.nickname}</p>
                <p className="leaderboard-card-solved">
                  Решено задач: {user.solvedTasksCount}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="leaderboard-table-wrapper">
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
      )}
    </div>
  );
};

export default LeaderboardPage;
