import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllStaffReportLeaveRequests,
  exportStaffReportLeaveRequests,
  selectAllStaffReportData,
  selectTotalAllStaffReport,
  selectLoadingAllStaffReport,
  selectTotalPageAllStaffReport,
  selectLoadingSelectedData
} from "@/stores/slices/leaveRequestSlice";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/AutoBreadcrumb";
import { selectPermissions } from "@/stores/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { hasPermission } from "@/utils/helpers";
// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LeaveReportDetails from "./LeaveStaffReportDetails";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "react-i18next";
import moment from "moment"
import Can from "@/components/Can"




export default function LeaveStaffReportIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userPermissions = useSelector(selectPermissions)
  const { t } = useTranslation();

  const tableData = useSelector(selectAllStaffReportData);
  const total = useSelector(selectTotalAllStaffReport);
  const totalPages = useSelector(selectTotalPageAllStaffReport);
  const loading = useSelector(selectLoadingAllStaffReport);
  const selectedLoading = useSelector(selectLoadingSelectedData);

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sort: "updated_at desc",
  });
  const [filters, setFilters] = useState({});
  const [activeLeave, setActiveLeave] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!hasPermission(userPermissions, PERMISSION.VIEW_REPORT)) {
      navigate("/status-403");
    }
  }, [userPermissions, navigate]);

  useEffect(() => {
    dispatch(getAllStaffReportLeaveRequests(query));
  }, [query, dispatch]);

  const openLeave = (leave) => {
    setActiveLeave(leave);
    setModalOpen(true);
  };

  const closeModal = () => {
    setActiveLeave(null);
    setModalOpen(false);
  };

  const onExport = async () => {
    try {
      const resp = await dispatch(exportStaffReportLeaveRequests(query)).unwrap();
      const url = globalThis.window.URL.createObjectURL(resp);
      const a = document.createElement("a");
      a.href = url;
      a.download = `REPORT-LEAVE-REQUEST-AT-[${moment().format("YYYY-MM-DD_HH-mm-ss")}].xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      globalThis.window.URL.revokeObjectURL(url);
      toast.success("Export to Excel successfully");
    } catch (error) {
      toast.error(error || "Export Failed");
    }
  };


  return (
    <>
      <div className="breadcrumb">
        <Breadcrumb />
      </div>
      <div className="card">
        <div className="card-body">
          <PageHeader
            title={t("common:titles.staff-report.name")}
            subtitle={t("common:titles.staff-report.subtitle")}
            action={
              <Can
                required={[PERMISSION.EXPORT_REPORT]}
                permissions={userPermissions}
              >
              <button className="btn btn-primary" onClick={onExport} disabled={selectedLoading}>
                { selectedLoading
                  ?(<span className="spinner-border spinner-border-sm me-2"></span>)
                  :(<FontAwesomeIcon icon={faDownload} className="me-2" />)
                }
                {t("common:button.export")}
              </button>
              </Can>
            }
          />
          <LeaveReportDetails
            tableData={tableData}
            loading={loading}
            // selectedLoading={selectedLoading}
            query={query}
            total={total}
            totalPages={totalPages}
            filters={filters}
            onQueryChange={setQuery}
            onFiltersChange={setFilters}
            onOpenLeave={openLeave}
            onSubmit={() => {}}
            showModal={modalOpen}
            setShowModal={setModalOpen}
            selectedLeave={activeLeave}
            setSelectedLeave={setActiveLeave}
            onFileChanged={() => {}}
            PERMISSION={PERMISSION}
            authPermissions={userPermissions}
          />
        </div>
      </div>
    </>
  );
}
