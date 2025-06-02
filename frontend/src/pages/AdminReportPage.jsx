import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/adminReportPage.css";

const AdminReportPage = () => {
  const { token, user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [openReportId, setOpenReportId] = useState(null);

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

  const getLinkForTarget = (type, id) => {
    switch (type) {
      case "task":
        return `/tasks/${id}`;
      case "theory":
        return `/theory/${id}`;
      default:
        return null;
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (user?.role !== "admin") return <p>Доступ запрещён</p>;

  const visibleReports =
    statusFilter === "all"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  return (
    <div className="admin-report-container">
      <h2 className="admin-report-title">Жалобы пользователей</h2>

      <div className="status-filter">
        <label htmlFor="statusSelect">Показать жалобы со статусом: </label>
        <select
          className="status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="open">На рассмотрении</option>
          <option value="reviewed">Рассмотренные</option>
          <option value="rejected">Отклонённые</option>
          <option value="all">Все</option>
        </select>
      </div>

      {visibleReports.length === 0 ? (
        <p className="no-reports">Жалоб нет</p>
      ) : (
        <div className="report-list">
          {visibleReports.map((r) => {
            const link = getLinkForTarget(r.targetType, r.targetId);
            const isOpen = openReportId === r._id;
            return (
              <div key={r._id} className="report-card">
                <div
                  className="report-header"
                  onClick={() => setOpenReportId(isOpen ? null : r._id)}
                >
                  <span className="monospace">#{r._id.slice(-6)}</span>
                  <span>{r.targetType}</span>
                  <span>
                    {r.reporterId?.nickname || r.reporterId?.email || "—"}
                  </span>
                  <span className={`status-cell ${r.status}`}>
                    {r.status === "open"
                      ? "На рассмотрении"
                      : r.status === "reviewed"
                      ? "Рассмотрена"
                      : "Отклонена"}
                  </span>
                  <button className="toggle-details">
                    {isOpen ? "▲" : "▼"}
                  </button>
                </div>

                {isOpen && (
                  <div className="report-details">
                    <p>
                      <strong>Причина:</strong> {r.reason}
                    </p>
                    <p>
                      <strong>Комментарий:</strong>{" "}
                      {r.description || <em className="dimmed">—</em>}
                    </p>
                    <p>
                      <strong>Дата:</strong>{" "}
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Цель:</strong>{" "}
                      {r.targetType === "comment" ? (
                        <>
                          {r.relatedTaskId && (
                            <a
                              href={`/tasks/${r.relatedTaskId}#comment-${r.targetId}`}
                              className="go-to-button"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Коммент. (задача)
                            </a>
                          )}
                          {r.relatedTheorySlug && (
                            <a
                              href={`/theory/${r.relatedTheorySlug}#comment-${r.targetId}`}
                              className="go-to-button"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Коммент. (теория)
                            </a>
                          )}
                          {!r.relatedTaskId && !r.relatedTheorySlug && (
                            <span className="dimmed">Комментарий</span>
                          )}
                        </>
                      ) : link ? (
                        <Link
                          to={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button className="go-to-button">Перейти</button>
                        </Link>
                      ) : (
                        <span className="dimmed">—</span>
                      )}
                    </p>
                    <div className="status-action">
                      <label>Изменить статус:</label>
                      <select
                        className="status-select"
                        value={r.status}
                        onChange={(e) =>
                          handleStatusChange(r._id, e.target.value)
                        }
                      >
                        <option value="open">На рассмотрении</option>
                        <option value="reviewed">Рассмотрена</option>
                        <option value="rejected">Отклонена</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReportPage;
