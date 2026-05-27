import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LeavePanel({
  title,
  used,
  total,
  remaining,
  icon,
  leaveList,
  index,
}) {
  const { t } = useTranslation();
  const [showRemaining, setShowRemaining] = useState(false);
  const currentVal = showRemaining ? remaining : used;
  const percent = total > 0 ? (currentVal / total) * 100 : 0;
  const navigate = useNavigate();

  const toggleDisplay = () => {
    setShowRemaining(!showRemaining);
  };


  const handleNavigate = (item) => {
    try {
      if (!item || !item.type) return;
      const leaveType = item.type.toLowerCase();
      navigate("/leave-requests/my-leaves", {
        state: { selectedType: leaveType }
      });
    } catch (error) {
      console.error("Navigation Error:", error);
      toast.error("Navigate Failed");
    }
  };

  return (
    <div className="leave-card">
      <div className="leave-card-header">
        <div className="leave-icon">
          <FontAwesomeIcon
            icon={icon}
            onClick={() => handleNavigate(leaveList[index])}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div className="leave-remaining">
          <div className="leave-remaining-number">{currentVal}</div>
          <div className="leave-remaining-text">
            {showRemaining ? t("common:dashboard.remaining") : t("common:dashboard.days-used")}
          </div>
        </div>
      </div>

      <div className="leave-title">{title}</div>

      <div
        className="leave-progress"
        onClick={toggleDisplay}
        style={{ cursor: 'pointer', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}
      >
        <div
          className="leave-progress-bar"
          style={{
            width: `${percent}%`,
            transition: 'width 0.3s ease',
            backgroundColor: '#3b82f6'
          }}
        />
      </div>

      <div className="leave-footer">
        <span>{t("common:dashboard.all")} {total} {t("common:dashboard.days")}</span>
        <span>
          {showRemaining
            ? `${t("common:dashboard.days-used")} ${used}`
            : `${t("common:dashboard.remaining")} ${remaining}`}
          {` ${t("common:dashboard.days")}`}
        </span>
      </div>
    </div>
  );
}