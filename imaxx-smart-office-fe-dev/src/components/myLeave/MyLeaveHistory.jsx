import LeaveTable from "@/components/leave/LeaveTable";
import LeaveCardList from "@/components/leave/LeaveCardList";
import LeaveModal from "@/components/leave/LeaveModal";
import Pagination from "@/components/table/Pagination";
import MyLeaveFilters from "./MyLeaveFilters";
import PropTypes from "prop-types";

MyLeaveHistory.propTypes = {
  tableData: PropTypes.array,
  loading: PropTypes.bool,
  selectedLoading: PropTypes.bool,
  query: PropTypes.object,
  total: PropTypes.number,
  totalPages: PropTypes.number,
  onQueryChange: PropTypes.func,
  filters: PropTypes.object,
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
  setSearchParams: PropTypes.func,
  onDelete: PropTypes.func,
  onSearch: PropTypes.func,
  setAppliedFilters: PropTypes.func,
};

export default function MyLeaveHistory({
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
  PERMISSION,
  authPermissions,
  searchParams,
  setSearchParams,
  onDelete,
  onSearch,
  setAppliedFilters,
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
      <MyLeaveFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        query={query}
        onQueryChange={onQueryChange}
        searchParams={searchParams}
        onSearch={onSearch}
        setSearchParams={setSearchParams}
        setAppliedFilters={setAppliedFilters}
      />
      <LeaveTable
        data={tableData}
        loading={loading}
        onView={openModal}
        mode="edit"
        PERMISSION={PERMISSION}
        authPermissions={authPermissions}
        onDelete={onDelete}
      />

      <LeaveCardList
        data={tableData}
        onView={openModal}
        mode="edit"
        onSubmit={onSubmit}
        onFileChanged={onFileChanged}
        PERMISSION={PERMISSION}
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
        }}
        setLimit={onLimitChange}
        setPage={onPageChange}
      />

      <LeaveModal
        open={showModal}
        data={selectedLeave}
        onClose={() => setShowModal(false)}
        onSubmit={onSubmit}
        mode="edit"
        onFileChanged={onFileChanged}
        PERMISSION={PERMISSION}
        authPermissions={authPermissions}
        loading={selectedLoading}
      />
    </>
  );
}
