// leave.options.js
import { LEAVE_TYPE, LEAVE_STATE } from "./leaveRequestEnum";
import { LEAVE_TYPE_LABEL, LEAVE_STATE_LABEL } from "./leaveRequestLabel";
import {
  LEAVE_TYPE_BADGE_COLOR,
  LEAVE_STATE_BADGE_COLOR,
} from "./leaveRequestBadgeColor";

export const getAllLeaveTypeOptions = (t) =>
  Object.values(LEAVE_TYPE).map(type => ({
    value: type,
    label: t(`common:leave-type.${LEAVE_TYPE_LABEL[type]}`) || LEAVE_TYPE_LABEL[type] || type,
    className: `leave-type-option-${type}`,
  }));

export const getAllLeaveTypeBadge = (t) =>
  Object.values(LEAVE_TYPE).map(type => ({
    value: type,
    label: t(`common:leave-type.${LEAVE_TYPE_LABEL[type]}`) || LEAVE_TYPE_LABEL[type] || type,
    className: `badge ${LEAVE_TYPE_BADGE_COLOR[type] ?? "bg-secondary"}`,
  }));

export const getAllLeaveStateOptions = (t) =>
  Object.values(LEAVE_STATE).map(state => ({
    value: state,
    label: t(`common:leave-state.${LEAVE_STATE_LABEL[state]}`) || LEAVE_STATE_LABEL[state] || state,
    className: `leave-state-option-${state}`,
  }));

export const getAllLeaveStateBadge = (t) =>
  Object.values(LEAVE_STATE).map(state => ({
    value: state,
    label: t(`common:leave-state.${LEAVE_STATE_LABEL[state]}`) || LEAVE_STATE_LABEL[state] || state,
    className: `badge ${LEAVE_STATE_BADGE_COLOR[state] ?? "bg-secondary"}`,
  }));

  export const leaveStateBadge = (state) => {
    return `badge ${LEAVE_STATE_BADGE_COLOR[state] ?? "bg-secondary"}`;
  };