import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPen,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "@/components/table/DataTable";
import Pagination from "@/components/table/Pagination";
import Can from "@/components/Can";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";


  // column definitions
  const getColumns = ({ query, authPermissions, PERMISSION, onOpen, onDelete, t })=> {
    return [
    {
      header: "#",
      accessorKey: "no",
      cell: ({ row }) => (query.page - 1) * query.limit + row.index + 1,
    },
    {
      header: t("common:form.year"),
      accessorKey: "year",
      cell: ({ row }) => {
        return <div className="year">{row.original.year}</div>;
      },
    },
    {
      header: t("common:form.status"),
      accessorKey: "status",
      cell: ({ row }) => {
        const classStyle = row.original.status
          ? "badge active"
          : "badge inactive";
        const statusName = row.original.status ? "Active" : "Inactive";
        return <span className={classStyle}>{statusName}</span>;
      },
    },
    {
      header: t("common:form.action"),
      accessorKey: "action",
      cell: ({ row }) => (
        <>
          <Can
            required={[PERMISSION.EDIT_LEAVE_QUOTA]}
            permissions={authPermissions}
          >
            <button
              className="btn btn-sm btn-outline-primary me-2 "
              onClick={() => onOpen(row.original)}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
          </Can>
          <Can
            required={[PERMISSION.DELETE_LEAVE_QUOTA]}
            permissions={authPermissions}
          >
            <button
              className="btn btn-sm btn-outline-danger my-2"
              onClick={() => onDelete(row.original)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </Can>
        </>
      ),
    },
  ]};

LeaveQuotaTable.propTypes = {
  onOpen: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  tableData: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  query: PropTypes.object.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  authPermissions: PropTypes.array.isRequired,
  PERMISSION: PropTypes.object.isRequired,
};


export default function LeaveQuotaTable({
  onOpen,
  onDelete,
  tableData,
  total,
  totalPages,
  loading,
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  authPermissions,
  PERMISSION
}) {
  const { t } = useTranslation();
  const pageLimitList = [10, 20, 30, 40, 50];

  // function
  const onSearch = () => {
    onQueryChange({
      ...query,
      keyword: filters.keyword,
      page: 1,
    });
  };

  const onPageChange = (p) => {
    onQueryChange(prev => ({
      ...prev,
      page: p,
    }));
  };

  const onLimitChange = (l) => {
    onQueryChange(prev => ({
      ...prev,
      limit: l,
      page: 1,
    }));
  };

  const clearSearch = () => {
    onFiltersChange({
      ...filters,
      keyword: "",
    });

    onQueryChange({
      ...query,
      page: 1,
      keyword: "",
      limit: 10,
    });
  };

  return (
    <div>
      <div className="search-box mb-4">
        <div className="last-row-filter">
          <div className="">
            <label htmlFor="keyword" className="form-label">
              {t("common:form.keyword")}
            </label>
            <input
              id="keyword"
              className="form-control keyword"
              placeholder={`${t("common:action.search")} ${t("common:form.year").toLowerCase()}...`}
              type="text"
              value={filters.keyword}
              onChange={(e) =>
                onFiltersChange((prev) => ({ ...prev, keyword: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>
          <div className="">
            <button
              type="button"
              className="btn-search-cancel btn"
              onClick={() => clearSearch()}
            >
              <FontAwesomeIcon icon={faXmark} className="me-2" />
              {t("common:button.clear")}
            </button>
            <button
              type="button"
              className="btn btn-search"
              onClick={() => onSearch()}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />
              {t("common:button.search")}
            </button>
          </div>
        </div>
      </div>
      <DataTable data={tableData} columns={getColumns({ query, authPermissions, PERMISSION, onOpen, onDelete, t  })} loading={loading} />
      <Pagination
        page={query.page}
        limit={query.limit}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onLimitChange={(l) => {
          onLimitChange(l);
          onPageChange(1);
        }}
        setLimit={onLimitChange}
        setPage={onPageChange}
        pageLimitList={pageLimitList}
      />
    </div>
  );
}
