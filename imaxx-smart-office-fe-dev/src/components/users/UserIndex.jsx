import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import UserTable from "@/components/users/UserTable";
import UserModal from "@/components/users/UserModal";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  selectAllData as userData,
  selectTotalAllData as userDataTotal,
  selectLoadingAllData as userDataLoading,
  selectTotalPageAllData as userDataTotalPage,
  selectLoadingSelectedData as userSelectedLoading,
} from "@/stores/slices/userSlice";
import {
  getAllRolesActive,
  selectActiveData as activeRoleData,
} from "@/stores/slices/roleSlice";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/AutoBreadcrumb";
import Swal from "sweetalert2";
import { selectPermissions } from "@/stores/slices/authSlice";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import Can from "@/components/Can";
import { hasPermission } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function UsersIndex() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ============== SELECTORS ==============
  // Auth
  const userPermissions = useSelector(selectPermissions);
  // Table (User List)
  const userTableData = useSelector(userData);
  const userTableTotal = useSelector(userDataTotal);
  const userTableTotalPages = useSelector(userDataTotalPage);
  const userTableLoading = useSelector(userDataLoading);
  // Modal / Form
  const roleOptions = useSelector(activeRoleData);
  const userFormLoading = useSelector(userSelectedLoading);

  // ============= useState =================
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sort:"",
    keyword: "",
  });
  const initFilters = {keyword: ""}
  const [filters, setFilters] = useState(initFilters);

  // =========================== useEffect ==========================

  useEffect(() => {
    if (!hasPermission(userPermissions, PERMISSION.VIEW_USER)) {
      navigate("/status-403");
    }
  }, [userPermissions, navigate]);

  useEffect(() => {
    dispatch(getAllUsers(query));
  }, [query, dispatch]);



  useEffect(() => {
    dispatch(getAllRolesActive({ page: 1, limit: 20 }));
  }, []);

  // ================== Function ========================

  const onUserModalSubmit = async (data) => {
    try {
      if (editingUser) {
        await dispatch(
          updateUser({
            id: editingUser.id,
            data,
          }),
        ).unwrap();
        toast.success("Update User Successfully");
      } else {
        await dispatch(createUser(data)).unwrap();
        toast.success("Create User Successfully");
      }
      setShowModal(false);
      setFilters(initFilters);
    } catch (err) {
      toast.error(err || "User Operation Failed");
    }
  };

  const onDelete = async (userData) => {
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
        await dispatch(deleteUser(userData.id)).unwrap();
        toast.success("Delete User Successfully");
        setFilters(initFilters)
      } else {
        console.log("cancelled");
      }
    } catch (err) {
      toast.error(err || "Delete User Failed");
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
              <h3>{ t('common:titles.user-management.name') }</h3>
              <div className="sub-title text-muted">
                { t('common:titles.user-management.subtitle') }
              </div>
            </div>
            <div className="action-part">
              <Can
                required={[PERMISSION.CREATE_USER]}
                permissions={userPermissions}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingUser(null);
                    setShowModal(true);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} /> { t('common:form.create',{ field: t(`common:form.user`)}) }
                </button>
              </Can>
            </div>
          </div>

          <UserTable
            onOpen={(selectedUser) => {
              setEditingUser(selectedUser);
              setShowModal(true);
            }}
            onDelete={onDelete}
            authPermissions={userPermissions}
            tableData={userTableData}
            total={userTableTotal}
            totalPages={userTableTotalPages}
            loading={userTableLoading}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            PERMISSION={PERMISSION}
          />
        </div>
      </div>
      <UserModal
        open={showModal}
        initialData={editingUser}
        onClose={() => setShowModal(false)}
        onSubmit={(data) => onUserModalSubmit(data)}
        roles={roleOptions}
        loading={userFormLoading}
      />
    </>
  );
}
