import { useTranslation } from "react-i18next";
export default function LeaveDetailModal({ event, onClose }) {
  const { t } = useTranslation();
  const { title, startStr, endStr, extendedProps } = event;

  const endDate = endStr
    ? new Date(new Date(endStr).setDate(new Date(endStr).getDate() - 1))
        .toISOString()
        .split("T")[0]
    : startStr;

  return (
    <div className="leave-modal-overlay" onClick={onClose}>
      <div className="leave-modal" onClick={(e) => e.stopPropagation()}>
        <div className="leave-modal-header">
          <span>{title}</span>
          <button onClick={onClose}>×</button>
        </div>

        <div className="leave-modal-body">
          <div className="leave-modal-row">
            <strong>{t("common:dashboard.details")}</strong>
            <p>{extendedProps.description || "-"}</p>
          </div>

          <div className="leave-modal-row">
            <strong>{t("common:dashboard.start-date-leave")}</strong>
            <p>{startStr}</p>
          </div>

          <div className="leave-modal-row">
            <strong>{t("common:dashboard.end-date-leave")}</strong>
            <p>{endDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
