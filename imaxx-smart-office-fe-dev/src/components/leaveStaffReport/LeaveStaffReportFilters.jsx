import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import moment from "moment";

LeaveStaffReportFilters.propTypes = {
  filters: PropTypes.array,
  onFiltersChange: PropTypes.func,
  query: PropTypes.array,
  onQueryChange: PropTypes.func,
};

export default function LeaveStaffReportFilters({
  filters,
  onFiltersChange,
  query,
  onQueryChange,
}) {
  const { t } = useTranslation();

  // function
  const onSearch = () => {
    onQueryChange({
      ...query,
      keyword: filters.keyword || null,
      name: filters.name || null,
      start_date: filters.start_date
        ? moment(filters.start_date).format("YYYY-MM-DD")
        : null,
      end_date: filters.end_date
        ? moment(filters.end_date).format("YYYY-MM-DD")
        : null,
      state: filters.state || null,
      leave_type: filters.leave_type || null,
      page: 1,
    });
  };

  const clearSearch = () => {
    onFiltersChange({
      keyword: "",
    });
    onQueryChange({
      ...query,
      page: 1,
      limit: 10,
      keyword: null,
    });
  };
  return (
    <div className="filters mb-4">
      <div className="last-row-filter">
        <div className="">
          {/* <label htmlFor="" className="form-label">
            {t("common:form.keyword")}
          </label> */}
          <input
            type="text"
            className="form-control w-100"
            placeholder={`${t("common:action.search")} ${t("common:form.name").toLowerCase()} , ${t("common:form.location").toLowerCase()} ...`}
            value={filters.keyword || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, keyword: e.target.value })
            }
          />
        </div>
        <div className="">
          <button
            type="button"
            className="btn btn-search-cancel"
            onClick={clearSearch}
          >
            <FontAwesomeIcon icon={faXmark} className="me-2" />
            {t("common:button.clear")}
          </button>
          <button type="button" className="btn btn-search" onClick={onSearch}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />
            {t("common:button.search")}
          </button>
        </div>
      </div>
    </div>
  );
}
