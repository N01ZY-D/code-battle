import { useState } from "react";
import ReportModal from "./ReportModal";

const ReportButton = ({ entityId, entityType }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="report-btn" onClick={() => setOpen(true)}>
        🚩 Пожаловаться
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
