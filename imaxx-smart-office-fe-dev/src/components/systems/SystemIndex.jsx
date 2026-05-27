import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import SystemTable from "@/components/systems/SystemTable";
import SystemModal from "@/components/systems/SystemModal";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSystem,
  getAllSystems,
  selectAllData,
  selectTotalAllData,
  selectLoadingAllData,
  selectTotalPageAllData,
  selectLoadingSelectedData
} from "@/stores/slices/systemSlice";
import {
  getAllWorkflowsActive,
  selectActiveData as workflowData,
} from "@/stores/slices/workflowSlice";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/AutoBreadcrumb";
import { selectPermissions } from "@/stores/slices/authSlice";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import Can from "@/components/Can";
import { hasPermission } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SystemIndex() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // =================== Selectors =========================
  const [showModal, setShowModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  // Auth
  const userPermissions = useSelector(selectPermissions);

  // Table (System List)
  const systemTableData = useSelector(selectAllData);
  const systemTableTotal = useSelector(selectTotalAllData);
  const systemTableTotalPages = useSelector(selectTotalPageAllData);
  const systemTableLoading = useSelector(selectLoadingAllData);

  // Form/Modal
  const workflowOptions = useSelector(workflowData);
  const systemFormLoading = useSelector(selectLoadingSelectedData);

  // ==================== useState =========================
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sort:"",
    keyword: "",
  });

  const initFilters = { keyword: "" }

  const [filters, setFilters] = useState(initFilters);

  // =================== useEffect ==========================
  useEffect(() => {
    if (!hasPermission(userPermissions, PERMISSION.VIEW_SYSTEM)) {
      navigate("/status-403");
    }
  }, [userPermissions, navigate]);

  useEffect(()=>{
    dispatch(getAllWorkflowsActive());
  },[])

  useEffect(() => {
    dispatch(getAllSystems(query));
  }, [dispatch, query]);

  // =================== Function ===========================
  const onModalSubmit = async (data) => {
    try {
      if (editingSystem) {
        await dispatch(updateSystem({ id: editingSystem.id, data })).unwrap();
        toast.success("Update System Successfully");
      }
      setShowModal(false);
      setFilters(initFilters)
    } catch (err) {
      toast.error(err || "System Operation Failed");
    }
  };

  const onDelete = async (data) => {
    // click delete
    console.log("data >> ", data);
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
              <h3>{ t("common:titles.system.name") }</h3>
              <div className="sub-title text-muted">
                { t("common:titles.system.subtitle") }
              </div>
            </div>
            <div className="action-part">
              <Can
                required={[PERMISSION.CREATE_SYSTEM]}
                permissions={userPermissions}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingSystem(null);
                    setShowModal(true);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} /> {t(`common:form.create`, { field: t("common:form.system") })}
                </button>
              </Can>
            </div>
          </div>

          <SystemTable
            onOpen={(selectedSystem) => {
              setEditingSystem(selectedSystem);
              setShowModal(true);
            }}
            onDelete={onDelete}
            authPermissions={userPermissions}
            tableData={systemTableData}
            total={systemTableTotal}
            totalPages={systemTableTotalPages}
            loading={systemTableLoading}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            PERMISSION={PERMISSION}
          />
        </div>
      </div>
      <SystemModal
        open={showModal}
        initialData={editingSystem}
        onClose={() => setShowModal(false)}
        onSubmit={(data) => onModalSubmit(data)}
        workflowList={workflowOptions}
        loading={systemFormLoading}

      />
    </>
  );
}
