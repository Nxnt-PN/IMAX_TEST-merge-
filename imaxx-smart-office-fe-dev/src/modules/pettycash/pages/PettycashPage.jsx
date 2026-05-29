import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import "../pettycash.css";
import CashListPage from "../components/pettyCash/CashListPage";
import MasterDataPage from "../components/settings/MasterDataPage";
import PettyCashModal from "../components/pettyCash/PettyCashModal";
import {
  getPettyCashFormById,
  getPettyCashHistory,
} from "../services/api";
import { getMyInfo as getMyProfile } from "@/services/authService";
import { personName } from "../utils/formatters";
import { groupPettyCashItems, statusFromState } from "../utils/normalizers";
import { selectPermissions, selectUserData } from "@/stores/slices/authSlice";
import { useTranslation } from "react-i18next";

const pageConfig = {
  myCash: { id: "myCash", titleKey: "common:titles.my-pettycash.name", subtitleKey: "common:titles.my-pettycash.subtitle" },
  myTasks: { id: "myTasks", titleKey: "common:titles.pettycash-task.name", subtitleKey: "common:titles.pettycash-task.subtitle" },
  summary: { id: "summary", titleKey: "common:titles.pettycash-summary.name", subtitleKey: "common:titles.pettycash-summary.subtitle" },
  project: { id: "project", titleKey: "common:titles.pettycash-projects.name", subtitleKey: "common:titles.pettycash-projects.subtitle" },
  reason: { id: "reason", titleKey: "common:titles.pettycash-reasons.name", subtitleKey: "common:titles.pettycash-reasons.subtitle" },
  location: { id: "location", titleKey: "common:titles.locations.name", subtitleKey: "common:titles.locations.subtitle" },
};

export default function PettycashPage({ page = "myCash" }) {
  const { t } = useTranslation();
  const userData = useSelector(selectUserData);
  const permissions = useSelector(selectPermissions) || [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [modal, setModal] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isOpeningCreate, setIsOpeningCreate] = useState(false);
  const current = pageConfig[page] || pageConfig.myCash;

  const buildCurrentUser = useCallback((profile = {}) => ({
    id: profile?.id || profile?.ID || userData?.id,
    username: userData?.username,
    name: personName(profile) || userData?.fullname,
    first_name: profile?.first_name || profile?.FirstName,
    last_name: profile?.last_name || profile?.LastName,
    email: profile?.email || profile?.Email || userData?.email,
    location: profile?.location || profile?.Location,
    location_name: profile?.location_name || profile?.locationName || profile?.LocationName,
    roles: (profile?.roles || profile?.Roles || userData?.roles || []).map((role) => role?.name || role?.Name || role).filter(Boolean),
  }), [userData]);

  const currentUser = useMemo(() => buildCurrentUser(), [buildCurrentUser]);

  const openCreate = async () => {
    if (isOpeningCreate) return;
    setIsOpeningCreate(true);
    try {
      const response = await getMyProfile();
      const profile = response?.data?.data || {};
      setModal({ mode: "create", request: { status: "Draft", requester: buildCurrentUser(profile), created_at: new Date().toISOString() }, sourcePage: page });
    } catch {
      setModal({ mode: "create", request: { status: "Draft", requester: currentUser, created_at: new Date().toISOString() }, sourcePage: page });
    } finally {
      setIsOpeningCreate(false);
    }
  };

  const openRequest = useCallback(async (request, sourcePage = page) => {
    const requestId = request.id || request.ID;
    const [fullData, historyData] = await Promise.all([
      getPettyCashFormById(requestId),
      getPettyCashHistory(requestId),
    ]);
    const { user: requestUser, items, rejected_user: rejectedUser, RejectedUser, ...safeFullData } = fullData;
    const rejectedHistory = (historyData || []).find((item) => String(item.action || item.Action).toLowerCase() === "rejected");
    const mappedItems = groupPettyCashItems(items || []);
    const mappedStatus = request.status || statusFromState(safeFullData.state || safeFullData.State);
    setModal({
      mode: sourcePage === "myCash" && mappedStatus === "Draft" ? "edit" : "view",
      request: {
        ...request,
        ...safeFullData,
        documentNo: safeFullData.documentNo || safeFullData.document_no || request.documentNo,
        requester: requestUser,
        history: historyData || [],
        blocks: mappedItems,
        items: mappedItems,
        id: requestId,
        status: mappedStatus,
        rejectedByName: personName(rejectedUser || RejectedUser) || personName(rejectedHistory?.user || rejectedHistory?.User) || request.rejectedByName,
      },
      sourcePage,
    });
  }, [page]);

  const handleModalClose = (result) => {
    setModal(null);
    if (searchParams.get("id")) {
      setSearchParams({}, { replace: true });
    }
    if (result?.refresh) {
      setReloadKey((value) => value + 1);
    }
  };

  useEffect(() => {
    const requestId = searchParams.get("id");
    if (!requestId || modal) return;
    openRequest({ id: requestId }, page);
  }, [searchParams, modal, openRequest, page]);

  const resolvedConfig = useMemo(() => ({
    ...current,
    title: t(current.titleKey),
    subtitle: t(current.subtitleKey),
  }), [current, t]);

  return (
    <div className="pettycash-module">
      {page === "project" || page === "reason" || page === "location" ? (
        <MasterDataPage type={page} config={resolvedConfig} permissions={permissions} />
      ) : (
        <CashListPage
          page={page}
          config={resolvedConfig}
          onCreate={openCreate}
          createLoading={isOpeningCreate}
          onOpen={openRequest}
          currentUser={currentUser}
          reloadKey={reloadKey}
          permissions={permissions}
        />
      )}
      {modal ? <PettyCashModal modal={modal} onClose={handleModalClose} currentUser={currentUser} permissions={permissions} /> : null}
    </div>
  );
}
