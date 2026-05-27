import moment from "moment";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/table/Pagination";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllNotifications,
  selectAllData,
  selectTotalAllData,
  selectTotalPageAllData,
  setReadNotification,
  setReadAllNotifications
} from "@/stores/slices/notificationSlice";
import { toast } from "react-toastify";
import { getIcons } from "@/utils/notificationHelper";

export default function NotificationAll() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sort: "created_at desc",
  });
  const [filters, setFilters] = useState({ state: null, leave_type: null });


  const tableData = useSelector(selectAllData);
  const total = useSelector(selectTotalAllData);
  const totalPages = useSelector(selectTotalPageAllData);

  useEffect(() => {
    dispatch(getAllNotifications(query));
  }, [dispatch, query]);

  // ================== Functions =====================

  const linkTo = (link)=> {
    try {
      if (link) {
        navigate(`/${link}`);
      }
    } catch (error) {
      console.log("Error at function linkTo() : ", error)
      toast.error(`Navigate Failed`)
    }
  }

  const onMarkReadAll = async() => {
    // set Read all notification
    try {
      const resp = await dispatch(setReadAllNotifications()).unwrap()
      toast.success(resp?.message || "The notification marked all as read successfully !!")
    } catch (error) {
      console.error(error)
      toast.error("The notification marked all as read failed !!")
    }
  };

  const onMarkReadNotification = async (data) => {
    try {
      if(!data.is_read) {
        await dispatch(setReadNotification({ id: data.id  })).unwrap();
        toast.success("The notification marked as read successfully");
      }

      linkTo(data.link)

    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "The notification marked as read failed",
      );
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <PageHeader
          title={t("common:titles.notification.name")}
          subtitle={t("common:titles.notification.subtitle")}
          action={
            <button
              type="button"
              className="btn btn-primary"
              disabled={!tableData.some((t)=> !t.is_read)}
              onClick={() => onMarkReadAll()}
            >
              {t("common:button.notification")}
            </button>
          }
        />
        {tableData.length === 0 && (
          <div
            className="card bg-secondary bg-opacity-10"
            style={{ height: "123px" }}
          >
            <div className="card-body d-flex justify-content-center align-items-center ">
              <span className="text-muted fs-6">
                {t("common:label.empty-text")}
              </span>
            </div>
          </div>
        )}
        {tableData.map((noti, index) => (
          <div
            key={index}
            className={`card mb-2 ${noti.is_read ? "noti-read" : "noti-unread"}`}
            onClick={() => onMarkReadNotification(noti)}
          >
            <div className="card-body">
              <div className="d-flex gap-3 align-items-center">
                <FontAwesomeIcon
                  icon={getIcons(noti.type).icon}
                  className={`fs-2 ${getIcons(noti.type).class}`}
                />
                <div className="">
                  <h6 className="card-title position-relative">
                    {noti.title}{" "}
                  </h6>
                  <p className="card-text">{noti.message}</p>
                  {/* <p className="card-text">
                    <small className="text-muted">
                      {noti.created_at
                        ? moment.parseZone(noti.created_at)
                            .format("DD/MM/YYYY - HH:mm")
                        : ""}
                    </small>
                  </p> */}
                </div>
              </div>
            </div>
          </div>
        ))}
        <Pagination
          page={query.page}
          limit={query.limit}
          total={total}
          totalPages={totalPages}
          onPageChange={(p) => setQuery((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => {
            setQuery((prev) => ({ ...prev, limit: l, page: 1 }));
          }}
          setLimit={(l) => {
            setQuery((prev) => ({ ...prev, limit: l }));
          }}
          setPage={(p) => {
            setQuery((prev) => ({ ...prev, page: p }));
          }}
        />
      </div>
    </div>
  );
}
