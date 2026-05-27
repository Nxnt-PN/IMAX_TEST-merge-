import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import WorkflowTable from "@/components/workflows/WorkflowTable";
import WorkflowModal from "@/components/workflows/WorkflowModal";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getAllWorkflows,
  selectAllData,
  selectTotalAllData,
  selectLoadingAllData,
  selectTotalPageAllData,
  selectLoadingSelectedData,
} from "@/stores/slices/workflowSlice";
import { getAllRolesActive, selectActiveData } from "@/stores/slices/roleSlice";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/AutoBreadcrumb";
import Swal from "sweetalert2";
import { selectPermissions } from "@/stores/slices/authSlice";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import Can from "@/components/Can";
import { hasPermission } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function WorkflowIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);

  // ===================== selectors ================================
  //Auth
  const userPermissions = useSelector(selectPermissions);
  //Table
  const workflowsTableData = useSelector(selectAllData);
  const workflowTableTotal = useSelector(selectTotalAllData);
  const workflowTableLoading = useSelector(selectLoadingAllData);
  const workflowTableTotalPages = useSelector(selectTotalPageAllData);
  //Modal
  const rolesOption = useSelector(selectActiveData);
  const workflowFormLoading = useSelector(selectLoadingSelectedData)

  //=================== useState ====================================
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sort:"",
    keyword: "",
  });
  const initFilters = { keyword: ""}
  const [filters, setFilters] = useState(initFilters);

  // ================ useEffect ======================================

  useEffect(() => {
    if (!hasPermission(userPermissions, PERMISSION.VIEW_WORKFLOW)) {
      navigate("/status-403");
    }
  }, [userPermissions, navigate]);

  useEffect(() => {
    dispatch(getAllWorkflows(query));
  }, [query, dispatch]);

  useEffect(() => {
    dispatch(getAllRolesActive({ page: 1, limit: 20 }));
  }, []);

  // =============== Functions =======================================
  const onSubmit = async (data) => {
    try {
      if (editingWorkflow) {
        await dispatch(
          updateWorkflow({
            id: editingWorkflow.id,
            data,
          }),
        ).unwrap();
        toast.success("Update Workflow Successfully");
      } else {
        await dispatch(createWorkflow(data)).unwrap();
        toast.success("Create Workflow Successfully");
      }
      setShowModal(false);
      setFilters(initFilters)
    } catch (err) {
      toast.error(err || "Workflow Operation Failed");
    }
  };

  const onDelete = async (workflowData) => {
    try {
      // confirm box before delete
      const result = await Swal.fire({
        title: t("common:label.confirm", {action:t("common:action.delete")}),
        text: t("common:label.confirm-subtitle"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("common:button.confirm"),
        cancelButtonText: t("common:button.cancel"),
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        dispatch(deleteWorkflow(workflowData.id))
          .unwrap()
        toast.success("Delete Workflow Successfully");
        setFilters(initFilters);
      } else {
        console.log("cancelled");
      }
    } catch (err) {
      toast.error(err || "Delete Workflow Successfully")
    }
  };

  return (
    <>
      <div className="breadcrumb">
        <Breadcrumb />
      </div>
      <div className="card">
        <div className="card-body">
          <div className="page-title d-flex justify-content-between align-items-center mb-4">
            <div className="title-part">
              <h3>{t("common:titles.workflow.name")}</h3>
              <div className="sub-title text-muted">{t("common:titles.workflow.subtitle")}</div>
            </div>
            <div className="action-part">
              <Can
                required={[PERMISSION.CREATE_WORKFLOW]}
                permissions={userPermissions}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingWorkflow(null);
                    setShowModal(true);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} /> {t("common:form.create", { field: t("common:form.workflow") })}
                </button>
              </Can>
            </div>
          </div>

          <WorkflowTable
            onOpen={(selectedWorkflow) => {
              setEditingWorkflow(selectedWorkflow);
              setShowModal(true);
            }}
            onDelete={onDelete}
            authPermissions={userPermissions}
            workflows={workflowsTableData}
            total={workflowTableTotal}
            loading={workflowTableLoading}
            totalPages={workflowTableTotalPages}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            PERMISSION={PERMISSION}
          />
        </div>
      </div>
      {showModal && (
        <WorkflowModal
          initialData={editingWorkflow}
          onClose={() => setShowModal(false)}
          onSubmit={onSubmit}
          roles={rolesOption}
          loading={workflowFormLoading}
        />
      )}
    </>
  );
}
