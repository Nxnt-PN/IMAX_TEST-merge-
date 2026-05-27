import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import TeamLeaveDetailModal from "./TeamLeaveDetailModal";
import LeaveTypeDropdown from "./LeaveTypeDropdown";
import Can from "@/components/Can";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import { useSelector } from "react-redux";
import { selectPermissions } from "@/stores/slices/authSlice";
import { useTranslation } from "react-i18next";
import thLocale from "@fullcalendar/core/locales/th";

export default function TeamLeaveCalendar({ events = [] }) {
  const authPermissions = useSelector(selectPermissions);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { t, i18n } = useTranslation();

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const typeOk =
        typeFilter === "ALL" ||
        e.type?.toUpperCase() === typeFilter;

      return typeOk ;
    });
  }, [events, typeFilter, roleFilter]);


  return (
    <>
      <div className="leave-calendar-card">
        <div className="leave-calendar-header">
          <div style={{ display: "flex", gap: 8 }}>
            {/* type filter */}
            <div className="leave-calendar-header">
              <div style={{ display: "flex", gap: 8 }}>
                <LeaveTypeDropdown
                  value={typeFilter}
                  onChange={setTypeFilter}
                />
              </div>
            </div>
          </div>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={filteredEvents}
          locale={i18n.language}
          locales={[thLocale]}
          height="auto"
          dayMaxEvents={5}
          moreLinkText={t('common:calendar.more')}
          eventDisplay="block"
          eventClick={(info) => setSelectedEvent(info.event)}
        />
      </div>

      {selectedEvent && (
        <TeamLeaveDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          Can={Can}
          PERMISSION={PERMISSION}
          authPermissions={authPermissions}
        />
      )}
    </>
  );
}