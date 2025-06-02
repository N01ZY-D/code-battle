import { useState } from "react";
import ReportModal from "./ReportModal";
import { FiFlag } from "react-icons/fi";
import "./reportButton.css"; // Импортируем стили для кнопки жалобы

const ReportButton = ({ entityId, entityType }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="report-btn" onClick={() => setOpen(true)}>
        <FiFlag size={20} />
      </button>
      {open && (
        <ReportModal
          onClose={() => setOpen(false)}
          entityId={entityId}
          entityType={entityType}
        />
      )}
    </>
  );
};

export default ReportButton;
