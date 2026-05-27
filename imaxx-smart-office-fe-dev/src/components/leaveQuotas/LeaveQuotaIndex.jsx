import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import LeaveQuotaTable from "@/components/leaveQuotas/LeaveQuotaTable";
import LeaveQuotaModal from "@/components/leaveQuotas/LeaveQuotaModal";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createLeaveQuota,
  updateLeaveQuota,
  deleteLeaveQuota,
  selectLoadingSelectedData,
  getAllLeaveQuotas,
  selectAllData,
  selectTotalAllData,
  selectLoadingAllData,
  selectTotalPageAllData,
} from "@/stores/slices/leaveQuotaSlice";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/AutoBreadcrumb";
import Swal from "sweetalert2";
import { selectPermissions } from "@/stores/slices/authSlice";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import Can from "@/components/Can";
import { hasPermission } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "react-i18next";

export default function LeaveQuotaIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ================== useState ===========================
  const [showModal, setShowModal] = useState(false);
  const [editingLeaveQuota, setEditingLeaveQuota] = useState(null);
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sort: "",
    keyword: "",
  });
  const initFilters = { keyword: "" };
  const [filters, setFilters] = useState(initFilters);
  // =================== Selectors =========================
  // Auth
  const userPermissions = useSelector(selectPermissions);
  // Table (Leave Quota List)
  const lqTableData = useSelector(selectAllData);
  const lqTableTotal = useSelector(selectTotalAllData);
  const lqTableTotalPages = useSelector(selectTotalPageAllData);
  const lqTableLoading = useSelector(selectLoadingAllData);
  // Form/ Modal
  const lqFormLoading = useSelector(selectLoadingSelectedData);

  // ================== useEffect ==========================
  useEffect(() => {
    if (!hasPermission(userPermissions, PERMISSION.VIEW_LEAVE_QUOTA)) {
      navigate("/status-403");
    }
  }, [userPermissions, navigate]);

  useEffect(() => {
    dispatch(getAllLeaveQuotas(query));
  }, [dispatch, query]);

  // ================= Function ============================
  const onModalSubmit = async (data) => {
    try {
      // normalize data before send to backend
      data = {
        ...data,
        year: Number(data.year),
        status: data.status ? 1 : 0,
        leave_quota_details: data.leave_quota_details.map((d) => ({
          ...d,
          work_year_min: Number(d.work_year_min),
          work_year_max: Number(d.work_year_max),
          absence_quota: Number(d.absence_quota),
          annual_quota: Number(d.annual_quota),
          sick_quota: Number(d.sick_quota),
          other_quota: Number(d.other_quota),
          status: d.status ? 1 : 0,
        })),
      };
      if (editingLeaveQuota) {
        await dispatch(
          updateLeaveQuota({ id: editingLeaveQuota.id, data }),
        ).unwrap();
        toast.success("Update LeaveQuota Successfully");
      } else {
        await dispatch(createLeaveQuota(data)).unwrap();
        toast.success("Create LeaveQuota Successfully");
      }
      setShowModal(false);
      setFilters(initFilters)
    } catch (err) {
      toast.error(err || "Leave Quota Operation Failed");
    }
  };

  const onDelete = async (data) => {
    try {
      // confirm box before delete
      const result = await Swal.fire({
        title: "Confirm",
        text: "Confirm to delete",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await dispatch(deleteLeaveQuota(data.id)).unwrap();
        toast.success("Delete Leave Quota Successfully");
        setFilters(initFilters)
      } else {
        console.log("cancelled");
      }
    } catch (err) {
      toast.error(err || "Delete Leave Quota Failed");
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
            title={t("common:titles.leave-quota.name")}
            subtitle={t("common:titles.leave-quota.subtitle")}
            action={
              <Can
                required={[PERMISSION.CREATE_LEAVE_QUOTA]}
                permissions={userPermissions}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingLeaveQuota(null);
                    setShowModal(true);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  {t("common:form.create", {
                    field: t("common:form.leave-quota"),
                  })}
                </button>
              </Can>
            }
          />

          <LeaveQuotaTable
            onOpen={(selectedLeaveQuota) => {
              setEditingLeaveQuota(selectedLeaveQuota);
              setShowModal(true);
            }}
            onDelete={onDelete}
            authPermissions={userPermissions}
            tableData={lqTableData}
            total={lqTableTotal}
            totalPages={lqTableTotalPages}
            loading={lqTableLoading}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            PERMISSION={PERMISSION}
          />
        </div>
      </div>
      <LeaveQuotaModal
        open={showModal}
        initialData={editingLeaveQuota}
        onClose={() => setShowModal(false)}
        onSubmit={(data) => onModalSubmit(data)}
        loading={lqFormLoading}
      />
    </>
  );
}
