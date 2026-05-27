import { LEAVE_STATE } from "@/constants/leaveRequest/leaveRequestEnum";
import { LEAVE_TYPE } from "./leaveRequestEnum";

// leave.badgeColor.js
export const LEAVE_TYPE_BADGE_COLOR = {
  [LEAVE_TYPE.ABSENCE]: "bg-primary",
  [LEAVE_TYPE.ANNUAL]: "bg-success",
  [LEAVE_TYPE.SICK]: "bg-danger",
};

export const LEAVE_STATE_BADGE_COLOR = {
  [LEAVE_STATE.DRAFT]: "bg-secondary",
  [LEAVE_STATE.WAITING_MANAGER]: "bg-warning text-dark",
  [LEAVE_STATE.WAITING_HR]: "bg-warning text-dark",
  [LEAVE_STATE.COMPLETE]: "bg-success",
  [LEAVE_STATE.CANCELLED]: "bg-danger",
};
