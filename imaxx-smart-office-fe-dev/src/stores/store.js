// store.js
import { configureStore } from '@reduxjs/toolkit';
// slices
import AuthReducer from '@/stores/slices/authSlice';
import UserReducer from '@/stores/slices/userSlice';
import RoleReducer from '@/stores/slices/roleSlice';
import PermissionReducer from '@/stores/slices/permissionSlice';
import leaveQuotaReducer from '@/stores/slices/leaveQuotaSlice';
import WorkflowReducer from '@/stores/slices/workflowSlice';
import systemReducer from '@/stores/slices/systemSlice';
import holidayReducer from '@/stores/slices/holidaySlice';
import leaveRequestReducer from '@/stores/slices/leaveRequestSlice';
import dashboardReducer from '@/stores/slices/dashboardSlice';
import notificationReducer from '@/stores/slices/notificationSlice';
import menuStatusReducer from '@/stores/slices/menuStatusSlice';

export const store = configureStore({
  reducer: {
    auth: AuthReducer,
    user: UserReducer,
    role: RoleReducer,
    permission: PermissionReducer,
    leaveQuota: leaveQuotaReducer,
    workflow: WorkflowReducer,
    system: systemReducer,
    holiday: holidayReducer,
    leaveRequest: leaveRequestReducer,
    dashboard: dashboardReducer,
    notification: notificationReducer,
    menuStatus: menuStatusReducer,
  },
});