import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from "prop-types"


const isMobile = () =>
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

ResponsiveDatePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  granularity: PropTypes.string, // date | month | year
  hasTime: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  minTime: PropTypes.string,
  maxTime: PropTypes.string,
  filterDate: PropTypes.any
}

export default function ResponsiveDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  granularity = "date", // date | month | year
  hasTime = false,
  disabled=false,
  className="",
  minTime=null,
  maxTime=null,
  filterDate
}) {
  const times = [
    new Date().setHours(12, 0, 0, 0),
    new Date().setHours(13, 0, 0, 0),
    new Date().setHours(18, 0, 0, 0),
  ].map((t) => new Date(t));
  /* ================= MOBILE ================= */
  if (isMobile()) {
    const type = hasTime ? "datetime-local" : mobileType(granularity);

    return (
      <input
        type={type}
        className={`form-control ${className}`}
        value={formatMobileValue(value, granularity, hasTime)}
        min={formatMobileValue(minDate, granularity, hasTime)}
        max={formatMobileValue(maxDate, granularity, hasTime)}
        onChange={(e) =>
          onChange(parseMobileValue(e.target.value, granularity))
        }
        disabled={disabled}
      />
    );
  }

  /* ================= DESKTOP ================= */
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      minDate={minDate}
      minTime={minTime}
      maxTime={maxTime}
      maxDate={maxDate}
      filterDate={filterDate}
      showTimeSelect={hasTime}
      showMonthYearPicker={granularity === "month"}
      showYearPicker={granularity === "year"}
      dateFormat={getDateFormat(granularity, hasTime)}
      timeFormat="HH:mm"
      className={`form-control ${className}`}
      wrapperClassName="w-100"
      showMonthDropdown={granularity === "date"}
      showYearDropdown
      dropdownMode="select"
      disabled={disabled}
      portalId="datepicker-portal"
      popperStrategy="fixed"
      isClearable
      timeIntervals={60}
      includeTimes={times}
    />
  );
}

/* ================= Helpers ================= */

function mobileType(granularity) {
  switch (granularity) {
    case "month":
      return "month";
    case "year":
      return "number";
    default:
      return "date";
  }
}

function getDateFormat(granularity, hasTime) {
  const time = hasTime ? " HH:mm" : "";

  switch (granularity) {
    case "month":
      return `MM/yyyy${time}`;
    case "year":
      return `yyyy${time}`;
    default:
      return `dd/MM/yyyy${time}`;
  }
}

function formatMobileValue(date, granularity, hasTime) {
  if (!date) return "";

  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");

  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());

  if (hasTime) return `${y}-${m}-${day}T${hh}:${mm}`;

  switch (granularity) {
    case "month":
      return `${y}-${m}`;
    case "year":
      return `${y}`;
    default:
      return `${y}-${m}-${day}`;
  }
}


function parseMobileValue(value, granularity) {
  if (!value) return null;

  if (granularity === "year") {
    return new Date(`${value}-01-01`);
  }

  return new Date(value);
}
