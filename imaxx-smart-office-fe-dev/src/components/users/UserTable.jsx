import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DataTable from "@/components/table/DataTable";
import Pagination from "@/components/table/Pagination";
import Can from "@/components/Can";
import {
  faMagnifyingGlass,
  faPen,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import ProfileViewer from "../ProfileViewer";

UserTable.propTypes = {
  onOpen: PropTypes.func,
  onDelete: PropTypes.func,
  authPermissions: PropTypes.array,
  tableData: PropTypes.array,
  total: PropTypes.number,
  totalPages: PropTypes.number,
  loading: PropTypes.bool,
  query: PropTypes.object,
  onQueryChange: PropTypes.func,
  filters: PropTypes.object,
  onFiltersChange: PropTypes.func,
  PERMISSION: PropTypes.object,
}


export default function UserTable({
  onOpen,
  onDelete,
  authPermissions,
  tableData,
  total,
  totalPages,
  loading,
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  PERMISSION
}) {
  const { t } = useTranslation();
  const pageLimitList = [10, 20, 30, 40, 50];
  // column definitions
  const columns = ({t})=> ([
    {
      header: "#",
      accessorKey: "no",
      cell: ({ row }) => (query.page - 1) * query.limit + row.index + 1,
    },
    {
      header: t("common:form.username"),
      accessorKey: "username",
      cell: ({ row }) => {
        const fullname = `${row.original.first_name} ${row.original.last_name}`;
        return (
          <div className="user-details d-flex">
            <div className="me-2 mt-1 user-details-avatar">
              <ProfileViewer name={fullname} size={40} filePath={row.original.avatar_path} className="" profileFor="others" />
            </div>
            <div className="user-details-name">
              <div className="name text-capitalize text-muted ">{fullname}</div>
              <div className="username">
                @{row.original.username}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: t("common:form.email"),
      accessorKey: "email",
      cell: ({ row }) => row.original.email,
    },
    {
      header: t("common:form.role"),
      accessorKey: "roles",
      cell: ({ row }) => {
        const roleList = row.original.roles.filter((r) => r.name);
        let badgeClass = "badge error";
        if (roleList.length) {
          badgeClass = "badge success me-2";
        } else {
          badgeClass = "badge danger";
        }
        return (
          <>
            {roleList.map((role) => (
              <span key={role.id} className={badgeClass}>
                {role.name || "No Role"}
              </span>
            ))}
          </>
        );
      },
    },
    {
      header: t("common:form.status"),
      accessorKey: "status",
      cell: ({ row }) => {
        const classStyle = row.original.status
          ? "badge active"
          : "badge inactive";
        return <span className={classStyle}>{t(`common:form.${ row.original.status ? "active" : "inactive"}`)}</span>;
      },
    },
    {
      header: t("common:form.action"),
      accessorKey: "action",
      cell: ({ row }) => (
        <>
          <Can required={[PERMISSION.EDIT_USER]} permissions={authPermissions}>
            <button
              className="btn btn-sm btn-outline-primary me-2 "
              onClick={() => onOpen(row.original)}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
          </Can>
          <Can
            required={[PERMISSION.DELETE_USER]}
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
  ])

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
      <div className="filters search-box mb-4">
        <div className="last-row-filter">
          <div className="">
            <label htmlFor="keyword" className="form-label">
              { t('common:form.keyword') }
            </label>
            <input
              id="keyword"
              className="form-control keyword"
              placeholder={`${t("common:action.search")} ${t("common:form.name").toLowerCase()}, ${t("common:form.username").toLowerCase()}...`}
              type="text"
              value={filters.keyword}
              onChange={(e) =>
                onFiltersChange((prev) => ({
                  ...prev,
                  keyword: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearch();
                }
              }}
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
      <DataTable data={tableData} columns={columns({t})} loading={loading} />
      <Pagination
        page={query.page}
        limit={query.limit}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        setLimit={onLimitChange}
        setPage={onPageChange}
        pageLimitList={pageLimitList}
      />
    </div>
  );
}
