import { useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const ReportModal = ({ onClose, entityId, entityType }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const { token } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!reason.trim()) return alert("Укажите причину");

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
      onClose();
      alert("Жалоба отправлена");
    } catch (err) {
      alert("Ошибка при отправке жалобы");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Пожаловаться</h3>
        <label>Причина:</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">-- Выберите --</option>
          <option value="spam">Спам</option>
          <option value="abuse">Оскорбления</option>
          <option value="error">Ошибка / Недочёт</option>
          <option value="other">Другое</option>
        </select>

        <label>Комментарий:</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={handleSubmit}>Отправить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
