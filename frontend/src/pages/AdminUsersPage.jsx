import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/adminUsersPage.css"; // Импортируем стили для страницы администрирования пользователей
import Avatar from "../components/Avatar";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingNicknameId, setEditingNicknameId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [viewingSolutionsId, setViewingSolutionsId] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Ошибка при загрузке пользователей:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const updateUserInState = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить пользователя?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Ошибка при удалении:", err);
    }
  };

  const handleEditRole = async (id) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/admin/users/${id}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      updateUserInState(res.data.user);
      setEditingRoleId(null);
    } catch (err) {
      console.error("Ошибка при изменении роли:", err);
    }
  };

  const handleEditNickname = async (id) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/admin/users/${id}/nickname`,
        { nickname: newNickname },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      updateUserInState(res.data.user);
      setEditingNicknameId(null);
    } catch (err) {
      console.error("Ошибка при изменении никнейма:", err);
    }
  };

  const handleViewSolutions = async (userId) => {
    setViewingSolutionsId(userId);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/users/${userId}/solutions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSolutions(res.data.solutions);
    } catch (err) {
      console.error("Ошибка при получении решений:", err);
    }
  };

  if (loading)
    return <div className="admin-loading">Загрузка пользователей...</div>;

  return (
    <div className="admin-users-page">
      <h1 className="admin-title">Управление пользователями</h1>

      {users.map((user) => (
        <div key={user._id} className="user-card">
          <div className="user-header">
            <div className="user-info">
              <div className="avatar-wrapper">
                <Avatar
                  matrix={user.avatarMatrix}
                  color={user.avatarColor}
                  size={60}
                />
              </div>
              <div>
                <p className="user-nickname">{user.nickname}</p>
                <p className="user-role">Роль: {user.role}</p>
                <p className="user-email">{user.email}</p>
              </div>
            </div>

            <div className="user-actions">
              <button
                onClick={() => {
                  setEditingRoleId(user._id);
                  setEditingNicknameId(null);
                  setViewingSolutionsId(null);
                  setNewRole(user.role);
                }}
              >
                Изм. роль
              </button>
              <button
                onClick={() => {
                  setEditingNicknameId(user._id);
                  setEditingRoleId(null);
                  setViewingSolutionsId(null);
                  setNewNickname(user.nickname);
                }}
              >
                Изм. ник
              </button>

              <button
                onClick={() => {
                  handleViewSolutions(user._id);
                  setEditingRoleId(null);
                  setEditingNicknameId(null);
                }}
              >
                Решения
              </button>

              <button className="danger" onClick={() => handleDelete(user._id)}>
                Удалить
              </button>
            </div>
          </div>

          {editingRoleId === user._id && (
            <div className="edit-section">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <button
                className="success"
                onClick={() => handleEditRole(user._id)}
              >
                Сохранить
              </button>
              <button onClick={() => setEditingRoleId(null)}>Отмена</button>
            </div>
          )}

          {editingNicknameId === user._id && (
            <div className="edit-section">
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
              />
              <button
                className="success"
                onClick={() => handleEditNickname(user._id)}
              >
                Сохранить
              </button>
              <button onClick={() => setEditingNicknameId(null)}>Отмена</button>
            </div>
          )}

          {viewingSolutionsId === user._id && (
            <div className="solutions-section">
              <div className="solutions-header">
                <h4>Решения:</h4>
                <button
                  onClick={() => {
                    setViewingSolutionsId(null);
                    setSolutions([]);
                  }}
                >
                  Закрыть
                </button>
              </div>

              <div className="solutions-list">
                {solutions.length === 0 ? (
                  <p className="muted">Нет решений</p>
                ) : (
                  solutions.map((sol) => (
                    <div key={sol._id} className="solution">
                      <p className="solution-title">
                        {sol.taskId?.title || "Задача"}
                      </p>
                      <pre>{sol.code}</pre>
                      <p className="solution-date">
                        {new Date(sol.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminUsersPage;
