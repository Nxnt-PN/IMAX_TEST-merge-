import { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import LeaveDetailModal from "./LeaveDetailModal";
import LeaveTypeDropdown from "./LeaveTypeDropdown";
import { useTranslation } from "react-i18next";
import thLocale from "@fullcalendar/core/locales/th";

export default function LeaveCalendar({ myLeaveEvents = [] }) {
  const [filter, setFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { t, i18n } = useTranslation();
  const filteredEvents = useMemo(() => {
    if (filter === "ALL") return myLeaveEvents;

    return myLeaveEvents.filter(
      (e) => e.type?.toUpperCase() === filter
    );
  }, [filter, myLeaveEvents]);

  return (
    <>
      <div className="leave-calendar-card">
        <div className="leave-calendar-header">
          <LeaveTypeDropdown
            value={filter}
            onChange={setFilter}
          />
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
        <LeaveDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
}