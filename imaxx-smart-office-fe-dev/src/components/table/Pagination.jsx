import { useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";


const getPaginationRange = (page, totalPages) => {
  const delta = 2;
  const range = [];
  const result = [];
  let last;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (last) {
      if (i - last === 2) {
        result.push(last + 1);
      } else if (i - last > 2) {
        result.push("...");
      }
    }
    result.push(i);
    last = i;
  }

  return result;
};


Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
  pageLimitList: PropTypes.array,
}


export default function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  setLimit,
  setPage,
  pageLimitList= [10, 20,30, 40, 50]
}) {
  const id = useId();
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const { t } = useTranslation();

  return (
    <div className="d-flex justify-content-between align-items-center mt-3" id={id}>
      <div className="d-flex flex-row align-items-center">
        {/* row per page */}
        <div className="row-per-page me-2 d-flex  justify-content-center align-items-center text-muted">
          <span className="user-select-none me-2">{ t('common:label.row-per-page') }</span>
          <select
              className="form-select w-auto"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {pageLimitList.map((s) => (
                <option key={s} value={s} className="">
                  {s}
                </option>
              ))}
          </select>
        </div>
        {/* Info */}
        <div className="text-muted user-select-none">
          { t('common:label.showing') } {start}–{end} { t('common:label.of') } {total}
        </div>
      </div>

      {/* Controls */}
      <nav>
        <ul className="pagination mb-0">

          <li className={`page-item ${page === 1 || totalPages === 0 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(page - 1)}
            >
              <FontAwesomeIcon icon={faAngleLeft} />
            </button>
          </li>

          {getPaginationRange(page, totalPages).map((p, idx) => (
            <li
              key={idx}
              className={`page-item ${p === page ? "active" : ""} ${p === "..." ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                disabled={p === "..."}
                onClick={() => p !== "..." && onPageChange(p)}
              >
                {p}
              </button>
            </li>
          ))}

          <li className={`page-item user-select-none ${page === totalPages || totalPages === 0  ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(page + 1)}
            >
              <FontAwesomeIcon icon={faAngleRight} />
            </button>
          </li>

        </ul>
      </nav>
    </div>
  );
}
