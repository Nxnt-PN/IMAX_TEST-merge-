import Swal from "sweetalert2";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCancel } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import {
  cancelLeaveRequest
} from "@/stores/slices/leaveRequestSlice";
export default function TeamLeaveDetailModal({ event, onClose, Can, PERMISSION, authPermissions }) {
  const dispatch = useDispatch();
  const { title, startStr, endStr, extendedProps, id } = event;
  const { t, i18n } = useTranslation();
  const [loadingAction, setLoadingAction] = useState(null);
  const endDate = endStr
    ? new Date(new Date(endStr).setDate(new Date(endStr).getDate() - 1))
      .toISOString()
      .split("T")[0]
    : startStr;
  const submitForm = async (action, id) => {
    setLoadingAction(action);

    const result = await Swal.fire({
      title: t("common:label.confirm", {
        action: t(`common:action.${action}`),
      }),
      text: t("common:label.confirm-subtitle"),
      icon: "warning",
      input: "text",
      inputPlaceholder: t("common:placeholder.confirm-remark"),
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: t("common:button.confirm"),
      cancelButtonText: t("common:button.cancel"),
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await handleSubmit({
        remark: result.value,
        leave_id: id,
      });
    }

    setLoadingAction(null);
  };
  const handleSubmit = async (data) => {
    try {
      await dispatch(
        cancelLeaveRequest({
          id: data.leave_id,
          data,
          pageName: "teamDashboard",
        })
      ).unwrap();

      onClose();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="leave-modal-overlay" onClick={onClose}>
      <div className="leave-modal" onClick={(e) => e.stopPropagation()}>
        <div className="leave-modal-header">
          <span>{title}</span>
          <button onClick={onClose}>×</button>
        </div>

        <div className="leave-modal-body">
          <div className="leave-modal-row">
            <strong>{t("common:dashboard.employee")}</strong>
            <p>{extendedProps.employeeName}</p>
          </div>

          <div className="leave-modal-row">
            <strong>{t("common:dashboard.leave-type")}</strong>
            <p>{extendedProps.type}</p>
          </div>

          <div className="leave-modal-row">
            <strong>{t("common:dashboard.details")}</strong>
            <p>{extendedProps.description || "-"}</p>
          </div>

          <div className="leave-modal-row">
            <strong>{t("common:dashboard.leave-date-range")}</strong>
            <p>
              {startStr} – {endDate}
            </p>
          </div>
          <div className="d-flex justify-content-end">
            <Can
              required={[PERMISSION.CANCEL_LEAVE]}
              permissions={authPermissions}
            >
              <button
                className="btn btn-danger w-50"
                type="button"
                onClick={() => submitForm("cancel", id)}
              >
                <FontAwesomeIcon icon={faCancel} className="me-2" />
                {t("common:button.cancel")}
              </button>
            </Can>
          </div>
        </div>
      </div>
    </div>
  );
}
