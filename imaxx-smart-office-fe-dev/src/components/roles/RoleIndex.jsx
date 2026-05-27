import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import RoleTable from "@/components/roles/RoleTable";
import RoleModal from "@/components/roles/RoleModal";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createRole,
  updateRole,
  deleteRole,
  getAllRoles,
  selectAllData,
  selectTotalAllData,
  selectLoadingAllData,
  selectTotalPageAllData,
  getAllRolesActive,
  selectActiveData as roleList,
  selectLoadingSelectedData
} from "@/stores/slices/roleSlice";
import {
  getAllPermissions,
  selectAllData as permissionList,
} from "@/stores/slices/permissionSlice";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/AutoBreadcrumb";
import { selectPermissions } from "@/stores/slices/authSlice";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import { PERMISSION_META } from "@/constants/permission/permissionMeta";
import Can from "@/components/Can";
import { hasPermission } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function RoleIndex() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ================== useState =========================
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sort:"",
    keyword: "",
  });

  const initFilters = { keyword:"" }
  const [filters, setFilters] = useState(initFilters);
  // ================== Selectors ========================
  // Auth
  const userPermissions = useSelector(selectPermissions)

  // Table (Role List)
  const roleTableData = useSelector(selectAllData);
  const roleTableTotal = useSelector(selectTotalAllData);
  const roleTableTotalPages = useSelector(selectTotalPageAllData);
  const roleTableLoading = useSelector(selectLoadingAllData);

  // Modal / Form
  const permissionOptions = useSelector(permissionList);
  const roleOptions = useSelector(roleList);
  const roleFormLoading = useSelector(selectLoadingSelectedData);


  // ================= useEffect ==========================

  useEffect(() => {
    if (!hasPermission(userPermissions, PERMISSION.VIEW_ROLE)) {
      navigate("/status-403");
    }
  }, [userPermissions, navigate]);

  useEffect(() => {
    dispatch(getAllRoles(query), );
  }, [query, dispatch]);

   useEffect(() => {
    dispatch(getAllPermissions({ page: 1, limit: 1000 }));
    dispatch(getAllRolesActive({ page: 1, limit: 1000 }));
  }, []);


  // ================ Function ============================

  const onSubmit = async (data) => {
    try {
      if (editingRole) {
        await dispatch(updateRole({ id: editingRole.id, data })).unwrap();
        toast.success("Update Role Successfully");
      } else {
        await dispatch(createRole(data)).unwrap();
        toast.success("Create Role Successfully");
      }
      setShowModal(false);
      setFilters(initFilters)
    } catch (err) {
      toast.error(err || "Role Operation Failed");
    }
  };

  const onDelete = async (roleData) => {
    try {
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
        await dispatch(deleteRole(roleData.id)).unwrap();
        toast.success("Delete Role Successfully");
        setFilters(initFilters)
      } else {
        console.log("cancelled");
      }
    } catch (err) {
      toast.error(err || "Delete Role Failed");
    }
  };

  return (
    <>
      <div className="breadcrumb ">
        <Breadcrumb />
      </div>
      <div className="card">
        <div className="card-body">
          <div className="page-title d-flex justify-content-between align-items-center mb-4">
            <div className="title-part">
              <h3>{ t("common:titles.role.name") }</h3>
              <div className="sub-title text-muted">
                { t("common:titles.role.subtitle") }
              </div>
            </div>
            <div className="action-part">
              <Can
                required={[PERMISSION.CREATE_ROLE]}
                permissions={userPermissions}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingRole(null);
                    setShowModal(true);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  { t("common:form.create", { field: t("common:form.role")}) }
                </button>
              </Can>
            </div>
          </div>
          <RoleTable
            onOpen={(selectedRole) => {
              setEditingRole(selectedRole);
              setShowModal(true);
            }}
            onDelete={onDelete}
            authPermissions={userPermissions}
            roles={roleTableData}
            total={roleTableTotal}
            totalPages={roleTableTotalPages}
            loading={roleTableLoading}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            PERMISSION={PERMISSION}
          />
        </div>
      </div>
      <RoleModal
        open={showModal}
        initialData={editingRole}
        onClose={() => setShowModal(false)}
        onSubmit={(data) => onSubmit(data)}
        permissions={permissionOptions}
        roles={roleOptions}
        loading={roleFormLoading}
        PERMISSION={PERMISSION}
      />
    </>
  );
}
