import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSummaryReportLeaveRequests,
  exportSummaryReportLeaveRequests,
  selectAllSummaryReportData,
  selectTotalAllSummaryReport,
  selectLoadingAllSummaryReport,
  selectTotalPageAllSummaryReport,
  selectLoadingSelectedData,
  cancelLeaveRequest
} from "@/stores/slices/leaveRequestSlice";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/AutoBreadcrumb";
import { selectPermissions } from "@/stores/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { hasPermission } from "@/utils/helpers";
// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LeaveSummaryReportDetails from "./LeaveSummaryReportDetails";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "react-i18next";
import moment from "moment"
import Can from "@/components/Can"



export default function LeaveSummaryReportIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userPermissions = useSelector(selectPermissions)
  const { t } = useTranslation();

  const tableData = useSelector(selectAllSummaryReportData);
  const total = useSelector(selectTotalAllSummaryReport);
  const totalPages = useSelector(selectTotalPageAllSummaryReport);
  const loading = useSelector(selectLoadingAllSummaryReport);
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
    dispatch(getAllSummaryReportLeaveRequests(query));
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
      const resp = await dispatch(exportSummaryReportLeaveRequests(query)).unwrap();
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

  const onSubmit = async (data) => {
    try {
      if (data.action === "cancel") {
        await dispatch(cancelLeaveRequest({ id: data.id, data, pageName: "summaryReport" })).unwrap();
      }
      closeModal();
      setFilters({});
      toast.success("Cancel Leave Request successfully");
    } catch (error) {
      toast.error(error || "Cancel Leave Request Failed");
    }
  }

  return (
    <>
      <div className="breadcrumb">
        <Breadcrumb />
      </div>
      <div className="card">
        <div className="card-body">
          <PageHeader
            title={t("common:titles.summary-report.name")}
            subtitle={t("common:titles.summary-report.subtitle")}
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
          <LeaveSummaryReportDetails
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
            onSubmit={onSubmit}
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
