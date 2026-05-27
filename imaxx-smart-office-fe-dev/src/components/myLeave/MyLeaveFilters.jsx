import {
  getAllLeaveTypeOptions,
  getAllLeaveStateOptions,
} from "@/constants/leaveRequest/leaveRequestOptions";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import ResponsiveDatePicker from "@/components/ResponsiveDatePicker";
import PropTypes from "prop-types";

MyLeaveFilters.propTypes = {
  filters: PropTypes.object,
  onFiltersChange: PropTypes.func,
  query: PropTypes.object,
  onQueryChange: PropTypes.func,
  searchParams: PropTypes.object,
  setSearchParams: PropTypes.func,
  onSearch: PropTypes.func,
};

export default function MyLeaveFilters({
  filters,
  onFiltersChange,
  query,
  onQueryChange,
  searchParams,
  setSearchParams,
  onSearch,
}) {
  const { t } = useTranslation();

  // function

 const clearSearch = () => {
  const clearedFilters = {
    start_date: null,
    end_date: null,
    keyword: "",
    year: null,
    leave_type: null,
    state: null,
    ids: null,
  };

  onFiltersChange(clearedFilters);
  setSearchParams({});

  onQueryChange(prev => ({
    ...prev,
    page: 1,
    limit: 10,
    sort: "updated_at desc",
  }));

  onSearch();
};
  return (
    <div className="filters mb-4">
      <div className="row">
        <div className="col-12 col-md-4 mb-2">
          <label htmlFor="" className="form-label">
            {t("common:form.start-date")}
          </label>
          <ResponsiveDatePicker
            granularity={"date"}
            value={filters.start_date}
            onChange={(value) => {
              onFiltersChange({ ...filters, start_date: value });
            }}
            disabled={filters.year}
          />
        </div>
        <div className="col-12 col-md-4 mb-2">
          <label htmlFor="" className="form-label">
            {t("common:form.end-date")}
          </label>
          <ResponsiveDatePicker
            granularity={"date"}
            value={filters.end_date}
            onChange={(value) => {
              onFiltersChange({ ...filters, end_date: value });
            }}
            disabled={!filters.start_date || filters.year}
          />
        </div>
        <div className="col-12 col-md-4 mb-2">
          <label htmlFor="" className="form-label">
            {t("common:form.year")}
          </label>
          <ResponsiveDatePicker
            granularity={"year"}
            value={filters.year}
            onChange={(value) => {
              onFiltersChange({ ...filters, year: value });
            }}
            disabled={filters.start_date || filters.end_date}
          />
        </div>
        <div className="col-12 col-md-6">
          <label htmlFor="" className="form-label">
            {t("common:form.status")}
          </label>
          <select
            className="form-select"
            value={filters.state || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, state: e.target.value })
            }
          >
            <option value="">{t("common:leave-state.all")}</option>
            {getAllLeaveStateOptions(t).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 mb-2">
          <label htmlFor="" className="form-label">
            {t("common:form.type")}
          </label>
          <select
            className="form-select me-2"
            value={filters.leave_type || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, leave_type: e.target.value })
            }
          >
            <option value="">{t("common:leave-type.all")}</option>
            {getAllLeaveTypeOptions(t).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="last-row-filter">
        <div className="">
          <label htmlFor="" className="form-label">
            {t("common:form.keyword")}
          </label>
          <input
            type="text"
            className="form-control w-100"
            value={filters.keyword || ""}
            placeholder={`${t("common:action.search")} ${t("common:form.reason").toLowerCase()}...`}
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
          <button type="button" className="btn btn-search " onClick={onSearch}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />
            {t("common:button.search")}
          </button>
        </div>
      </div>
    </div>
  );
}
