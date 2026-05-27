import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMyTaskData,
  selectTotalAllMyTask,
  selectTotalPageAllMyTask,
  selectLoadingAllMyTask,
  updateLeaveReviewRequest,
  getAllLeaveTask,
  selectLoadingSelectedData,
  cancelLeaveRequest
} from "@/stores/slices/leaveRequestSlice";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/AutoBreadcrumb";
import { selectPermissions } from "@/stores/slices/authSlice";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import { hasPermission } from "@/utils/helpers";
// Components
import MyLeaveTaskDetails from "./MyLeaveTaskDetails";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "react-i18next";

export default function MyLeaveTaskIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const urlId = searchParams.get("id");

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const selectedLoading = useSelector(selectLoadingSelectedData);

  const tableData = useSelector(selectMyTaskData);
  const total = useSelector(selectTotalAllMyTask);
  const totalPages = useSelector(selectTotalPageAllMyTask);
  const loading = useSelector(selectLoadingAllMyTask);

  const userPermissions = useSelector(selectPermissions);

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sort: "updated_at desc",
  });
  const [filters, setFilters] = useState({ ids: urlId || null });
  const [activeLeave, setActiveLeave] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // =========================== useEffect =================================

  useEffect(() => {
    if (!hasPermission(userPermissions, PERMISSION.VIEW_MY_TASK)) {
      navigate("/status-403");
    }
  }, [userPermissions, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(
      getAllLeaveTask({
        ...query,
        ...(urlId ? filters : {}),
      }),
    );
  }, [query, dispatch, urlId]);

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

  // ============================ Function ======================

  const openLeave = (leave) => {
    setActiveLeave(leave);
    setModalOpen(true);
  };
  const closeModal = () => {
    setActiveLeave(null);
    setModalOpen(false);
  };

  const onSubmit = async (taskData) => {
    try {
      if (taskData.action === "cancel") {
        await dispatch(cancelLeaveRequest({ id: taskData.id, data: taskData, pageName: "myLeaveTask" })).unwrap();
      } else {
        await dispatch(
          updateLeaveReviewRequest({
            id: taskData.id,
            data: taskData,
          }),
        ).unwrap();
      }
      setFilters({});
      closeModal();
      toast.success("Update Leave Review Successfully");
    } catch (error) {
      console.log("error :", error);
      toast.error(error || "Update Leave Review Failed !!");
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
            title={t("common:titles.my-task.name")}
            subtitle={t("common:titles.my-task.subtitle")}
            action={<></>}
          />
          <MyLeaveTaskDetails
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
            onFileChanged={() => {}}
            PERMISSION={PERMISSION}
            authPermissions={userPermissions}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </div>
      </div>
    </>
  );
}
