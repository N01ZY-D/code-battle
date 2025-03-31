import React, { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import axios from "axios";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/leaderboard"
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
    <div>
      <h2>Таблица лидеров</h2>
      <table>
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
                <Avatar
                  matrix={user.avatarMatrix}
                  color={user.avatarColor}
                  size={48}
                />
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
