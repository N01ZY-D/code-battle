import { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "./reportModal.css";

const ReportModal = ({ onClose, entityId, entityType }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const selectRef = useRef(null);

  useEffect(() => {
    // Автофокус на селект при открытии
    selectRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Пожалуйста, выберите причину жалобы");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/reports`,
        {
          targetType: entityType,
          targetId: entityId,
          reason,
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onClose();
      // Можно заменить на что-то более приятное, например, toast
      alert("Жалоба успешно отправлена");
    } catch (err) {
      setLoading(false);
      setError("Ошибка при отправке жалобы. Попробуйте позже.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Пожаловаться</h3>

        <label htmlFor="reasonSelect">Причина:</label>
        <select
          id="reasonSelect"
          ref={selectRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Выберите --</option>
          <option value="spam">Спам</option>
          <option value="abuse">Оскорбления</option>
          <option value="error">Ошибка / Недочёт</option>
          <option value="other">Другое</option>
        </select>
        {error && !reason && (
          <p style={{ color: "red", marginTop: "4px", fontSize: "13px" }}>
            {error}
          </p>
        )}

        <label htmlFor="descriptionTextarea" style={{ marginTop: "12px" }}>
          Комментарий:
        </label>
        <textarea
          id="descriptionTextarea"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          placeholder="Опишите подробнее (необязательно)"
        />

        {error && reason && (
          <p style={{ color: "red", marginTop: "8px", fontSize: "13px" }}>
            {error}
          </p>
        )}

        <div className="modal-actions" style={{ marginTop: "15px" }}>
          <button onClick={handleSubmit} disabled={loading || !reason.trim()}>
            {loading ? "Отправка..." : "Отправить"}
          </button>
          <button onClick={onClose} disabled={loading}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
