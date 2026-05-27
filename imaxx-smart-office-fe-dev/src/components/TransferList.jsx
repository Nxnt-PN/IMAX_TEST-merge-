import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

TransferList.propTypes = {
  label: PropTypes.string,
  options: PropTypes.array,
  value: PropTypes.array,
  onChange: PropTypes.func,
};

export default function TransferList({ label, options, value = [], onChange }) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState([]);

  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");

  const left = useMemo(
  () => options.filter((opt) => !value.includes(opt.id)),
  [options, value]
);

const right = useMemo(
  () => options.filter((opt) => value.includes(opt.id)),
  [options, value]
);

const filteredLeft = useMemo(
  () =>
    left.filter((item) =>
      String(item[label])
        .toLowerCase()
        .includes(searchLeft.toLowerCase())
    ),
  [left, searchLeft, label]
);

const filteredRight = useMemo(
  () =>
    right.filter((item) =>
      String(item[label])
        .toLowerCase()
        .includes(searchRight.toLowerCase())
    ),
  [right, searchRight, label]
);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = (items) => {
    const ids = items.map((i) => i.id);
    const allSelected = ids.every((id) => selectedIds.includes(id));

    setSelectedIds(
      (prev) =>
        allSelected
          ? prev.filter((id) => !ids.includes(id)) // unselect all
          : [...new Set([...prev, ...ids])], // select all
    );
  };

  const moveRight = () => {
    const itemsToMove = left.filter((i) => selectedIds.includes(i.id));
    if (!itemsToMove.length) return;

    onChange([...value, ...itemsToMove.map((i) => i.id)]); // ส่ง id
    setSelectedIds([]);
  };

  const moveLeft = () => {
    const itemsToMove = right.filter((i) => selectedIds.includes(i.id));
    if (!itemsToMove.length) return;

    onChange(value.filter((id) => !itemsToMove.map((i) => i.id).includes(id))); // ส่ง id
    setSelectedIds([]);
  };

  const isAllSelected = (items) =>
    items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const isIndeterminate = (items) =>
    items.some((item) => selectedIds.includes(item.id)) &&
    !isAllSelected(items);

  return (
    <div className="transfer-list d-flex align-items-start">
      {/* LEFT */}
      <div className="transfer-list-left card me-2 p-0">
        <div className="card-header d-flex align-items-center p-1">
          <input
            type="checkbox"
            className="mx-2"
            checked={isAllSelected(filteredLeft)}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate(filteredLeft);
            }}
            onChange={() => toggleSelectAll(filteredLeft)}
          />
          <span className="mb-0 fs-6 fw-bold">
            {t("common:form.available")}
          </span>
        </div>
        <div className="card-body transfer-list-body p-2">
          <div className="transfer-list-search mb-2">
            <input
              className="form-control form-control-sm mb-2"
              type="search" aria-label="Search"
              placeholder={t("common:action.search")}
              value={searchLeft}
              onChange={(e) => setSearchLeft(e.target.value)}
            />
          </div>
          <div className="transfer-list-items ps-1">
            {filteredLeft.map((item) => (
              <label key={item.id} className="d-flex align-items-center gap-2 text-break">
                <input
                  type="checkbox"
                  className="me-2"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
                {item[label]}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="transfer-list-actions d-flex flex-column gap-2 my-auto">
        <button
          type="button"
          className="btn-transfer-list btn"
          onClick={moveRight}
        >
          <FontAwesomeIcon icon={faAngleRight} />
        </button>
        <button
          type="button"
          className="btn-transfer-list btn"
          onClick={moveLeft}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
        </button>
      </div>

      {/* RIGHT */}
      <div className="transfer-list-right card ms-2 p-0">
        <div className="card-header d-flex align-items-center p-1">
          <input
            type="checkbox"
            className="mx-2"
            checked={isAllSelected(filteredRight)}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate(filteredRight);
            }}
            onChange={() => toggleSelectAll(filteredRight)}
          />
          <span className="mb-0 fw-bold">{t("common:form.selected")}</span>
        </div>
        <div className="card-body transfer-list-body p-2">
          <div className="transfer-list-search mb-2">
            <input
              type="search" aria-label="Search"
              className="form-control form-control-sm mb-2"
              placeholder={t("common:action.search")}
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
            />
          </div>
          <div className="transfer-list-items ps-1">
            {filteredRight.map((item) => (
              <label key={item.id} className="d-flex align-items-center gap-2 text-break">
                <input
                  type="checkbox"
                  className="me-2"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
                {item[label]}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
