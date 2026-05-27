import { useId } from "react";
import {
  getAllLeaveTypeOptions,
  getAllLeaveStateOptions,
} from "@/constants/leaveRequest/leaveRequestOptions";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import ResponsiveDatePicker from "@/components/ResponsiveDatePicker"
import moment from "moment";
import PropTypes from "prop-types";

MyLeaveTaskFilters.propTypes = {
  filters: PropTypes.array,
  onFiltersChange: PropTypes.func,
  query: PropTypes.array,
  onQueryChange: PropTypes.func,
  searchParams: PropTypes.object,
  setSearchParams: PropTypes.func
};

export default function MyLeaveTaskFilters({
  filters,
  onFiltersChange,
  onQueryChange,
  query,
  searchParams,
  setSearchParams
}) {
  const { t, i18n } = useTranslation();
  const onSearch = () => {
    onQueryChange({
      ...query,
      ...filters,
      keyword: filters.keyword || "",
      year: filters.year ? moment(filters.year).format("YYYY") : "",
      state: filters.state || null,
      leave_type: filters.leave_type || "",
      page: 1,
    });
  };

  const clearSearch = () => {
    onFiltersChange({
      ...filters,
      keyword: "",
      year: null,
      state: "",
      leave_type: "",
      ids: null
    });
    onQueryChange({
      ...query,
      page: 1,
      limit: 10,
      keyword: "",
      year: "",
      state: null,
      leave_type: "",
      ids:null,
    });
    // clear all search params
    setSearchParams({});
  };
  const id = useId();
  return (
    <div className="filters mb-4">
      <div className="row">
        {/* name */}
        <div className="col-12 col-md-4 mb-2">
          <label htmlFor="" className="form-label">
            {t("common:form.name")}
          </label>
          <input
            type="text"
            className="form-control"
            value={filters.name || ""}
            onChange={(e) => {
              onFiltersChange({ ...filters, name: e.target.value });
            }}
          />
        </div>
        {/* start date */}
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
        {/* end date */}
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
        {/* year */}
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
        {/* status */}
        <div className="col-12 col-md-4">
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
        {/* leave type */}
        <div className="col-12 col-md-4 mb-2">
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
            placeholder={`${t("common:action.search")} ${t("common:form.name").toLowerCase()} , ${t("common:form.reason").toLowerCase()}...`}
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
            <button
              type="button"
              className="btn btn-search"
              onClick={onSearch}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />
              {t("common:button.search")}
            </button>
        </div>
      </div>
    </div>
  );
}
