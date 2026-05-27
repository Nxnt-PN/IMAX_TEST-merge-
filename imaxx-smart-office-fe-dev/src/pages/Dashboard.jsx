import LeavePanel from "@/components/dashboard/LeavePanel";
import LeaveCalendar from "@/components/dashboard/LeaveCalendar";
import TeamLeaveCalendar from "@/components/dashboard/TeamLeaveCalendar";
import {
  getAllMyLeaveCarlendar,
  selectMyLeaveCalendar,
  getAllTeamLeaveCarlendar,
  selectTeamLeaveCalendar,
  getAllMyLeaveSummary,
  selectLeaveSummary,
} from "@/stores/slices/dashboardSlice";
import {
  faCalendarDays,
  faHeartPulse,
  faBusinessTime,
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux"
import { useState, useEffect, useMemo } from "react";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import { hasPermission } from "@/utils/helpers";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const myLeaveApiData = useSelector(selectMyLeaveCalendar) || [];
  const teamLeaveApiData = useSelector(selectTeamLeaveCalendar) || [];
  const summaryData = useSelector(selectLeaveSummary) || {};
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sort: "",
    keyword: "",
  });
  const leaveList = useMemo(() => {
    if (!summaryData || Object.keys(summaryData).length === 0) return [];

    const config = {
      annual: {
        title: t("common:leave-type.annual"),
        type: "annual",
        icon: faCalendarDays,
      },
      sick: {
        title: t("common:leave-type.sick"),
        type: "sick",
        icon: faHeartPulse,
      },
      absence: {
        title: t("common:leave-type.absence"),
        type: "absence",
        icon: faBusinessTime,
      },
      other: {
        title: t("common:leave-type.other"),
        type: "other",
        icon: faFileSignature,
      }
    };

    return Object.keys(config)
      .filter((key) => summaryData[key])
      .map((key) => {
        const { use, quota } = summaryData[key];

        return {
          title: config[key].title,
          icon: config[key].icon,
          type: config[key].type,
          used: use,
          total: quota,
          remaining: Math.max(quota - use, 0),
        };
      });
  }, [summaryData, t]);

  const getLeaveColor = (type) => {
    switch (type?.toLowerCase()) {
      case "absence":
        return "#22c55e";
      case "sick":
        return "#ef4444";
      case "annual":
        return "#3b82f6";
      default:
        return "#9ca3af";
    }
  };
  const getType = (type) => {
    switch (type?.toLowerCase()) {
      case "absence":
        return t("common:leave-type.absence");
      case "sick":
        return t("common:leave-type.sick");
      case "annual":
        return t("common:leave-type.annual");
      case "other":
        return t("common:leave-type.other");
    }
  };
  const myLeaveEvents = useMemo(() => {
  return (myLeaveApiData || []).map((item) => ({
    title: getType(item.type),
    description: item.reason,
    start: item.start_date.split("T")[0],
    end: item.end_date
      ? dayjs(item.end_date).format("YYYY-MM-DD")
      : undefined,
    color: getLeaveColor(item.type),
    type: item.type?.toUpperCase(),
  }));
}, [myLeaveApiData, t]);
  const teamLeaveEvents = useMemo(() => {
  return (teamLeaveApiData || []).map((item) => {
    const fullName = item.user
      ? `${item.user.first_name} ${item.user.last_name}`
      : "Unknown";

    return {
      title: fullName,
      employeeName: fullName,
      id: item.id,
      email: item.user?.email,
      description: item.reason,
      start: item.start_date.split("T")[0],
      end: item.end_date
        ? dayjs(item.end_date).format("YYYY-MM-DD")
        : undefined,
      color: getLeaveColor(item.type),
      type: item.type?.toUpperCase(),
      typeLabel: getType(item.type),
    };
  });
}, [teamLeaveApiData, t]);
  const canViewTeamLeave = useMemo(() => {
    return teamLeaveEvents.length > 0;
  }, [teamLeaveEvents]);
  useEffect(() => {
    dispatch(getAllMyLeaveSummary());
    dispatch(getAllMyLeaveCarlendar());
    dispatch(getAllTeamLeaveCarlendar());
  }, [dispatch]);
  return (
    <div className="dashboard-page vertical-layout">
      {/* ===== Summary ===== */}
      <section className="dashboard-section">
        <h4 className="section-title">{t("common:dashboard.leave-summary")}</h4>
        <div className="leave-grid">
          {leaveList.map((item, index) => (
            <LeavePanel key={index} {...item} leaveList={leaveList} index={index} />
          ))}
        </div>
      </section>

      {/* ===== My Leave ===== */}
      <section className="dashboard-section">
        <div className="calendar-wrapper">
          <div className="section-title">
            <h4>{t("common:dashboard.m-leave-calendar")}</h4>
          </div>

          <div className="calendar-card full-width">
            <LeaveCalendar myLeaveEvents={myLeaveEvents} />
          </div>
        </div>
      </section>

      {/* ===== Team Leave  ===== */}
      {canViewTeamLeave && (
        <section className="dashboard-section">
          <div className="calendar-wrapper">
            <div className="section-title">
              <h4>{t("common:dashboard.t-leave-calendar")}</h4>
            </div>
            <div className="calendar-card full-width">
              <TeamLeaveCalendar events={teamLeaveEvents} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
