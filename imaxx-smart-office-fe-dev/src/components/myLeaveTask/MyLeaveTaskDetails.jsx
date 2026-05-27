import LeaveTable from "@/components/leave/LeaveTable";
import LeaveCardList from "@/components/leave/LeaveCardList";
import LeaveModal from "@/components/leave/LeaveModal";
import Pagination from "@/components/table/Pagination";
import MyLeaveTaskFilters from "./MyLeaveTaskFilters";
import PropTypes from "prop-types"


MyLeaveTaskDetails.propTypes = {
    tableData: PropTypes.array,
    loading: PropTypes.bool,
    selectedLoading: PropTypes.bool,
    query: PropTypes.array,
    total: PropTypes.number,
    totalPages: PropTypes.number,
    onQueryChange: PropTypes.func,
    filters: PropTypes.array,
    onFiltersChange: PropTypes.func,
    onSubmit: PropTypes.func,
    showModal: PropTypes.bool,
    setShowModal: PropTypes.func,
    selectedLeave: PropTypes.object,
    setSelectedLeave: PropTypes.func,
    onFileChanged: PropTypes.func,
    authPermissions: PropTypes.array,
    PERMISSION: PropTypes.object,
    searchParams: PropTypes.object,
    setSearchParams: PropTypes.func
}

export default function MyLeaveTaskDetails({
  tableData,
  loading,
  selectedLoading,
  query,
  total,
  totalPages,
  onQueryChange,
  filters,
  onFiltersChange,
  onSubmit,
  showModal,
  setShowModal,
  selectedLeave,
  setSelectedLeave,
  onFileChanged,
  authPermissions,
  PERMISSION,
  searchParams,
  setSearchParams
}) {
  const openModal = (data) => {
    setSelectedLeave(data);
    setShowModal(true);
  };

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

  //   mode : [view, approve, edit]
  return (
    <>
      <MyLeaveTaskFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        query={query}
        onQueryChange={onQueryChange}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        />
      <LeaveTable
        data={tableData}
        loading={loading}
        onView={openModal}
        mode="approve"
        PERMISSION={PERMISSION}
        authPermissions={authPermissions}
      />

      <LeaveCardList
        data={tableData}
        onView={openModal}
        onSubmit={onSubmit}
        mode="approve"
        PERMISSION={PERMISSION}
        onFileChanged={onFileChanged}
        authPermissions={authPermissions}
        loading={selectedLoading}
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

      <LeaveModal
        open={showModal}
        data={selectedLeave}
        onClose={() => setShowModal(false)}
        onSubmit={onSubmit}
        mode="approve"
        onFileChanged={onFileChanged}
        PERMISSION={PERMISSION}
        authPermissions={authPermissions}
        loading={selectedLoading}
      />
    </>
  );
}
