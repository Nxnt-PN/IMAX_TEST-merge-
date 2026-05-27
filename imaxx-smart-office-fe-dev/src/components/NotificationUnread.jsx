import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAllUnreadData,
  selectTotalUnreadData,
  setReadNotification,
} from "@/stores/slices/notificationSlice";
import { toast } from "react-toastify";
import { getIcons } from "@/utils/notificationHelper";

export default function NotificationUnread() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();


  const tableData = useSelector(selectAllUnreadData);
  const totalTableData = useSelector(selectTotalUnreadData);

  const onMarkReadAll = () => {
    // set Read all notification
    console.log("ยังไม่มี mark read all");
  };

  const onMarkReadNotification = async (id, link) => {
    try {
      await dispatch(setReadNotification({ id, isUnreadOnly: false })).unwrap();

      if (link) {
        navigate(`/${link}`);
      }

      toast.success("The notification marked as read successfully");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "The notification marked as read failed",
      );
    }
  };

  return (
    <>
      <li className="dropdown-header">
        <span className="fw-bold fs-6">{t("common:menu.notification")}</span>
        { tableData.length > 0 && (<span className="badge text-bg-danger ms-2">{totalTableData}</span>)}
      </li>
      {tableData.length ? (
        <NotificationList
          tableData={tableData}
          onMarkReadNotification={onMarkReadNotification}
        />
      ) : (
        <li className="dropdown-item">
          <small className="text-muted">{t("common:label.empty-text")}</small>
        </li>
      )}
    </>
  );
}

function NotificationList({ tableData, onMarkReadNotification }) {
  return tableData.map((noti) => (
    <li
      key={noti.id}
      className="dropdown-item"
      onClick={() => onMarkReadNotification(noti.id, noti.link)}
    >
      <div className={`d-flex align-items-center gap-2 p-2 `}>
        <FontAwesomeIcon
          icon={getIcons(noti.type).icon}
          className={`fs-6 ${getIcons(noti.type).class} me-2`}
        />
        <div className="title">
          <div className="title-header fw-bold">{noti.title}</div>
          <div className="date text-muted text-wrap">{noti.message}</div>
        </div>
      </div>
    </li>
  ));
}
