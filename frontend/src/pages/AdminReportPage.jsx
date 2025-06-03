import { useContext, useMemo, useState } from "react";
import useSWR from "swr";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/adminReportPage.css";

const AdminReportPage = () => {
  const { token, user } = useContext(AuthContext);
  const [statusFilter, setStatusFilter] = useState("open");
  const [openReportId, setOpenReportId] = useState(null);

  const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
  const fetcher = (url) =>
    axios
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.data);

  const {
    data: reports = [],
    isLoading,
    error,
    mutate,
  } = useSWR(token ? `${BASE_URL}/api/reports` : null, fetcher);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/reports/${reportId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      mutate(); // Обновляем данные
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

  const visibleReports = useMemo(() => {
    return statusFilter === "all"
      ? reports
      : reports.filter((r) => r.status === statusFilter);
  }, [reports, statusFilter]);

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка загрузки данных</p>;
  if (user?.role !== "admin") return <p>Доступ запрещён</p>;

  return (
    <div className="admin-report-container">
      <h2 className="admin-report-title">Жалобы пользователей</h2>
      <div className="back-to-dashboard">
        <Link to="/dashboard">
          <button
            className="back-button"
            style={{ backgroundColor: "#cd853f" }}
          >
            Вернуться в Dashboard
          </button>
        </Link>
      </div>
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
