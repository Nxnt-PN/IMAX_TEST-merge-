import Pagination from "@/components/table/Pagination";
import LeaveStaffReportTable from "./LeaveStaffReportTable";
import LeaveStaffReportFilters from "./LeaveStaffReportFilters";
import PropTypes from "prop-types"

LeaveStaffReportDetails.propTypes = {
  tableData: PropTypes.array,
  loading: PropTypes.bool,
  query: PropTypes.array,
  total: PropTypes.number,
  totalPages: PropTypes.number,
  onQueryChange: PropTypes.func,
  filters: PropTypes.array,
  onFiltersChange: PropTypes.func,
  authPermissions: PropTypes.array,
  PERMISSION: PropTypes.object,
}

export default function LeaveStaffReportDetails({
  tableData,
  loading,
  query,
  total,
  totalPages,
  onQueryChange,
  filters,
  onFiltersChange,
  authPermissions,
  PERMISSION
}) {

  const onPageChange = (p) => {
    onQueryChange((prev) => ({
      ...prev,
      page: p,
    }));
  };

  const onLimitChange = (l) => {
    onQueryChange((prev) => ({
      ...prev,
      limit: l,
      page: 1,
    }));
  };

  return (
    <>
      <LeaveStaffReportFilters filters={filters} onFiltersChange={onFiltersChange} query={query} onQueryChange={onQueryChange} />
      <LeaveStaffReportTable
        data={tableData}
        loading={loading}
        mode="view"
        PERMISSION={PERMISSION}
        authPermissions={authPermissions}
      />

      <Pagination
        page={query.page}
        limit={query.limit}
        total={total}
        totalPages={totalPages}
        onPageChange={(p) => onQueryChange((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => {
          onLimitChange(l);
          onPageChange(1);
        }}
        setLimit={onLimitChange}
        setPage={onPageChange}
      />
    </>
  );
}
