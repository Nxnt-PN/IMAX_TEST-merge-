// router.jsx
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";

// ============================= Layout And Pages =====================================
const AppGuard = lazy(() => import("../App"));
// Layouts
const BlankLayout = lazy(() => import("@/layouts/BlankLayout"));
const MainLayout = lazy(() => import("@/layouts/MainLayout"));

// Pages
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const SettingsPortalPage = lazy(() => import("@/pages/SettingsPortalPage"));

const UserIndex = lazy(() => import("@/components/users/UserIndex"));
const RoleIndex = lazy(() => import("@/components/roles/RoleIndex"));
const WorkflowIndex = lazy(() => import("@/components/workflows/WorkflowIndex"));
const LeaveQuotaIndex = lazy(() => import("@/components/leaveQuotas/LeaveQuotaIndex"));
const SystemIndex = lazy(() => import("@/components/systems/SystemIndex"));

const MyLeaveTaskIndex = lazy(() => import("@/components/myLeaveTask/MyLeaveTaskIndex"));
const MyLeaveIndex = lazy(() => import("@/components/myLeave/MyLeaveIndex"));
const Notifications = lazy(() => import("@/components/NotificationAll"));
const LeaveSummaryReportIndex = lazy(() => import("@/components/leaveSummaryReport/LeaveSummaryReportIndex"));
const LeaveStaffReportIndex = lazy(() => import("@/components/leaveStaffReport/LeaveStaffReportIndex"));

const BadRequestPage = lazy(() => import("@/pages/Error400"));
const ForbiddenPage = lazy(() => import("@/pages/Error403"));
const NotFoundPage = lazy(() => import("@/pages/Error404"));
const ServerErrorPage = lazy(() => import("@/pages/Error500"));
const ServiceUnavailablePage = lazy(() => import("@/pages/Error503"));

const router = createBrowserRouter([
  {
    element: <BlankLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "*", element: <NotFoundPage /> },
      { path: "/status-400", element: <BadRequestPage /> },
      { path: "/status-403", element: <ForbiddenPage /> },
      { path: "/status-500", element: <ServerErrorPage /> },
      { path: "/status-503", element: <ServiceUnavailablePage /> },
    ],
  },
  {
    element: <AppGuard />,
    children: [
      {
        element: <MainLayout />,
        path: "/",
        children: [
          { index: true, element: <Dashboard /> },
          { path: "notifications", element: <Notifications /> },
          {
            path: "leave-requests",
            children: [
              { index: true, element: <Navigate to="my-leaves" replace /> },
              { path: "my-tasks", element: <MyLeaveTaskIndex /> },
              { path: "my-leaves", element: <MyLeaveIndex /> },
              { path: "staff-report", element: <LeaveStaffReportIndex /> },
              {
                path: "summary-report",
                element: <LeaveSummaryReportIndex />,
              },
            ],
          },
          {
            path: "user-management",
            children: [
              { index: true, element: <Navigate to="users" replace /> },
              { path: "users", element: <UserIndex /> },
              { path: "roles", element: <RoleIndex /> },
            ],
          },
          {
            path: "settings",
            children: [
              { index: true, element: <SettingsPortalPage /> },
              { path: "workflow", element: <WorkflowIndex /> },
              { path: "leave-quotas", element: <LeaveQuotaIndex /> },
              { path: "systems", element: <SystemIndex /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
