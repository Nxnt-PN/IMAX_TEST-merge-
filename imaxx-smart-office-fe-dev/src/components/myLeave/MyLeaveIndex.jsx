import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createLeaveRequest,
  getAllMyLeaveRequests,
  selectMyLeaveData,
  selectTotalAllMyLeave,
  selectTotalPageAllMyLeave,
  selectLoadingAllMyLeave,
  uploadFileLeaveRequest,
  updateLeaveRequest,
  cancelLeaveRequest,
  selectLoadingSelectedData,
  deleteLeaveRequest,
} from "@/stores/slices/leaveRequestSlice";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/AutoBreadcrumb";
import { selectPermissions } from "@/stores/slices/authSlice";
import { useNavigate, useSearchParams ,useLocation } from "react-router-dom";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MyLeaveHistory from "./MyLeaveHistory";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { hasPermission } from "@/utils/helpers";
import Can from "@/components/Can";
import Swal from "sweetalert2";

export default function MyLeaveIndex() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const urlId = searchParams.get("id");

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const userPermissions = useSelector(selectPermissions);
  const selectedLoading = useSelector(selectLoadingSelectedData);

  const tableData = useSelector(selectMyLeaveData);
  const total = useSelector(selectTotalAllMyLeave);
  const totalPages = useSelector(selectTotalPageAllMyLeave);
  const loading = useSelector(selectLoadingAllMyLeave);
  const defaultFilters = {
  ids: null,
  leave_type: null,
  start_date: null,
  end_date: null,
  year: null,
  state: null,
  keyword: "",
};

const [filters, setFilters] = useState({
  ...defaultFilters,
  ids: urlId || null,
  leave_type: location.state?.selectedType || null,
});

const [appliedFilters, setAppliedFilters] = useState({
  ...defaultFilters,
  ids: urlId || null,
  leave_type: location.state?.selectedType || null,
});
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sort: "updated_at desc",
  });
  const [activeLeave, setActiveLeave] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const handleSearch = () => {
  setAppliedFilters({ ...filters });
  setQuery(prev => ({
    ...prev,
    page: 1
  }));
};


  // ======================= useEffect =============================

  useEffect(() => {
    if (!hasPermission(userPermissions, PERMISSION.VIEW_LEAVE_FORM)) {
      navigate("/status-403");
    }
  }, [userPermissions, navigate]);

 useEffect(() => {
  const params = {
    ...query,
    ...appliedFilters,
    start_date: appliedFilters.start_date ? moment(appliedFilters.start_date).format("YYYY-MM-DD") : null,
    end_date: appliedFilters.end_date ? moment(appliedFilters.end_date).format("YYYY-MM-DD") : null,
    year: appliedFilters.year ? moment(appliedFilters.year).format("YYYY") : null,
    state: appliedFilters.state || null,
  leave_type: appliedFilters.leave_type || null,
  };

  dispatch(getAllMyLeaveRequests(params));
}, [query, appliedFilters, dispatch]);
  useEffect(() => {
  if (location.state?.selectedType || urlId) {
    const newFilters = {
      ids: urlId || null,
      leave_type: location.state?.selectedType || null
    };

    setFilters(prev => ({ ...prev, ...newFilters }));
    setAppliedFilters(prev => ({ ...prev, ...newFilters }));
    setQuery(prev => ({ ...prev, page: 1 }));
  }
}, [location.state, urlId]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!urlId || !tableData) return;

    const leave = tableData.find((d) => d.id === urlId);
    if (!leave) return;

    if (isDesktop) {
      setActiveLeave(leave);
      setModalOpen(true);
    } else {
      setActiveLeave(null);
      setModalOpen(false);
    }
  }, [urlId, tableData, isDesktop]);

  // ======================= function =============================

  const openLeave = async (leave) => {
    setActiveLeave(leave);
    setModalOpen(true);
  };

  const closeModal = () => {
    setActiveLeave(null);
    setModalOpen(false);
  };

  const onDelete = async (leave) => {
    try {
      if (!leave) return;
      const result = await Swal.fire({
        title: t("common:label.confirm", {
          action: t(`common:action.delete`),
        }),
        text: t("common:label.confirm-subtitle"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("common:button.confirm"),
        cancelButtonText: t("common:button.cancel"),
        reverseButtons: true,
      });
      if (result.isConfirmed) {
        await dispatch(deleteLeaveRequest(leave.id)).unwrap();
        toast.success("Delete Leave Request Successfully");
        setFilters({ ...defaultFilters });
        setAppliedFilters({ ...defaultFilters });
      }
    } catch (error) {
      toast.error(error || "Delete Leave Request Failed !!");
    }
  };

  const onSubmit = async (data) => {
  console.log('data :', data);
    const isEdit = !!data.id;
    const action = data.action;
    try {
      let resp = null;
      // normalize data
      data.start_date = data.start_date
        ? moment(data.start_date).local().format("YYYY-MM-DDTHH:mm:ssZ")
        : null;
      data.end_date = data.end_date
        ? moment(data.end_date).local().format("YYYY-MM-DDTHH:mm:ssZ")
        : null;
      if (isEdit && action === "cancel") {
        await dispatch(cancelLeaveRequest({ id: data.id, data, pageName: "myLeave" })).unwrap();
      } else if (isEdit) {
        resp = await dispatch(
          updateLeaveRequest({ id: data.id, data }),
        ).unwrap();
        if (formData) {
          await dispatch(
            uploadFileLeaveRequest({ id: data.id, formData, page: "myLeave" }),
          ).unwrap();
        }

        toast.success("Update Leave Request Successfully");
      } else {
        // create mode
        delete data.file_path;
        resp = await dispatch(
          createLeaveRequest({ data }),
        ).unwrap();
        if (formData) {
          await dispatch(
            uploadFileLeaveRequest({
              id: resp.data.id,
              formData,
              page: "myLeave",
            }),
          ).unwrap();
        }
        toast.success("Create Leave Request Successfully");
      }
      // clear filters
      closeModal();
      setFilters({ ...defaultFilters });
      setAppliedFilters({ ...defaultFilters });
    } catch (error) {
      console.log("error :", error);
      if (isEdit) {
        toast.error(error || "Update Leave Request Failed !!");
      } else {
        toast.error(error || "Create Leave Request Failed !!");
      }
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
            title={t("common:titles.my-leave.name")}
            subtitle={t("common:titles.my-leave.subtitle")}
            action={
              <Can
                required={[PERMISSION.CREATE_LEAVE_FORM]}
                permissions={userPermissions}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => openLeave(null)}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  {t("common:form.create", {
                    field: t("common:label.leave-request"),
                  })}
                </button>
              </Can>
            }
          />
          <MyLeaveHistory
            tableData={tableData}
            loading={loading}
            selectedLoading={selectedLoading}
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
            onFileChanged={setFormData}
            PERMISSION={PERMISSION}
            authPermissions={userPermissions}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            onDelete={onDelete}
            onSearch={handleSearch}
            setAppliedFilters={setAppliedFilters}
          />
        </div>
      </div>
    </>
  );
}
