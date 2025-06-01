import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const AdminReportPage = () => {
  const { token, user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/reports`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReports(res.data);
      } catch (err) {
        console.error("Ошибка при загрузке жалоб:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const res = await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/reports/${reportId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? res.data : r))
      );
    } catch (err) {
      console.error("Ошибка при обновлении статуса:", err);
    }
  };

  if (loading) return <p>Загрузка...</p>;

  if (user?.role !== "admin") {
    return <p>Доступ запрещён</p>; // или <Navigate to="/" />
  }

  return (
    <div className="container">
      <h2>Жалобы пользователей</h2>
      {reports.length === 0 ? (
        <p>Жалоб пока нет</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Тип</th>
              <th>Цель</th>
              <th>Причина</th>
              <th>Описание</th>
              <th>Автор</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id}>
                <td>{r._id}</td>
                <td>{r.targetType}</td>
                <td>{r.targetId}</td>
                <td>{r.reason}</td>
                <td>{r.description || "-"}</td>
                <td>{r.reporterId?.nickname || r.reporterId?.email}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>{r.status}</td>
                <td>
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r._id, e.target.value)}
                  >
                    <option value="pending">На рассмотрении</option>
                    <option value="reviewed">Рассмотрена</option>
                    <option value="rejected">Отклонена</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReportPage;
