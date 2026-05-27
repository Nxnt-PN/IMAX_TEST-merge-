// leave.label.js
import { LEAVE_TYPE, LEAVE_STATE } from "./leaveRequestEnum";

export const LEAVE_TYPE_LABEL = {
  [LEAVE_TYPE.ABSENCE]: "absence",
  [LEAVE_TYPE.ANNUAL]:"annual",
  [LEAVE_TYPE.SICK]: "sick",
  [LEAVE_TYPE.OTHER]: "other",
};

export const LEAVE_STATE_LABEL = {
  [LEAVE_STATE.DRAFT]:  "draft",
  [LEAVE_STATE.WAITING_MANAGER]: "waiting-manager-approval",
  [LEAVE_STATE.WAITING_HR]: "waiting-hr-approval",
  [LEAVE_STATE.COMPLETE]: "complete",
  [LEAVE_STATE.CANCELLED]:"cancelled",
};
