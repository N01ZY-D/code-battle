import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/AdminReportPage.css"; // подключи стили

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
  if (user?.role !== "admin") return <p>Доступ запрещён</p>;

  const getLinkForTarget = (type, id) => {
    switch (type) {
      case "task":
        return `/tasks/${id}`;
      case "theory":
        return `/theory/${id}`;
      case "comment":
        return null;
      default:
        return null;
    }
  };

  const statusColors = {
    open: "gray",
    reviewed: "green",
    rejected: "red",
  };

  return (
    <div className="admin-report-container">
      <h2>Жалобы пользователей</h2>
      {reports.length === 0 ? (
        <p>Жалоб пока нет</p>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Тип</th>
              <th>Цель</th>
              <th>Причина</th>
              <th>Комментарий</th>
              <th>Автор</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => {
              const link = getLinkForTarget(r.targetType, r.targetId);
              return (
                <tr key={r._id}>
                  <td className="monospace">{r._id.slice(-6)}</td>
                  <td>{r.targetType}</td>
                  <td>
                    {r.targetType === "comment" ? (
                      <>
                        {r.relatedTaskId && (
                          <a
                            href={`/tasks/${r.relatedTaskId}#comment-${r.targetId}`}
                            className="go-to-comment-button"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Перейти к комментарию (задача)
                          </a>
                        )}
                        {r.relatedTheoryId && r.relatedTheorySlug && (
                          <a
                            href={`/theory/${r.relatedTheorySlug}#comment-${r.targetId}`}
                            className="go-to-comment-button"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Перейти к комментарию (теория)
                          </a>
                        )}
                        {!r.relatedTaskId && !r.relatedTheoryId && (
                          <span className="dimmed">Комментарий</span>
                        )}
                      </>
                    ) : link ? (
                      <Link to={link} target="_blank" rel="noopener noreferrer">
                        Перейти
                      </Link>
                    ) : (
                      <span className="dimmed">—</span>
                    )}
                  </td>
                  <td>{r.reason}</td>
                  <td>{r.description || <em className="dimmed">—</em>}</td>
                  <td>{r.reporterId?.nickname || r.reporterId?.email}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td style={{ color: statusColors[r.status] }}>{r.status}</td>
                  <td>
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(r._id, e.target.value)
                      }
                    >
                      <option value="open">На рассмотрении</option>
                      <option value="reviewed">Рассмотрена</option>
                      <option value="rejected">Отклонена</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReportPage;
