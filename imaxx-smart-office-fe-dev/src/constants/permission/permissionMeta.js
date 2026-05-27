// constants/permission/permissionMeta.js
import { PERMISSION } from "./permissionEnum";

export const PERMISSION_META = {
  // ===== USER =====
  [PERMISSION.VIEW_USER]: {
    module: "user",
    label: "view-user",
  },
  [PERMISSION.CREATE_USER]: {
    module: "user",
    label: "create-user",
  },
  [PERMISSION.EDIT_USER]: {
    module: "user",
    label: "edit-user",
  },
  [PERMISSION.DELETE_USER]: {
    module: "user",
    label: "delete-user",
  },

  // ===== ROLE =====
  [PERMISSION.VIEW_ROLE]: {
    module: "role",
    label: "view-role",
  },
  [PERMISSION.CREATE_ROLE]: {
    module: "role",
    label: "create-role",
  },
  [PERMISSION.EDIT_ROLE]: {
    module: "role",
    label: "edit-role",
  },
  [PERMISSION.DELETE_ROLE]: {
    module: "role",
    label: "delete-role",
  },

  // ===== WORKFLOW =====
  [PERMISSION.VIEW_WORKFLOW]: {
    module: "workflow",
    label: "view-workflow",
  },
  [PERMISSION.CREATE_WORKFLOW]: {
    module: "workflow",
    label: "create-workflow",
  },
  [PERMISSION.EDIT_WORKFLOW]: {
    module: "workflow",
    label: "edit-workflow",
  },
  [PERMISSION.DELETE_WORKFLOW]: {
    module: "workflow",
    label: "delete-workflow",
  },

  // ===== LEAVE QUOTA =====
  [PERMISSION.VIEW_LEAVE_QUOTA]: {
    module: "leave_quota",
    label: "view-leave-quota",
  },
  [PERMISSION.CREATE_LEAVE_QUOTA]: {
    module: "leave_quota",
    label: "create-leave-quota",
  },
  [PERMISSION.EDIT_LEAVE_QUOTA]: {
    module: "leave_quota",
    label: "edit-leave-quota",
  },
  [PERMISSION.DELETE_LEAVE_QUOTA]: {
    module: "leave_quota",
    label: "delete-leave-quota",
  },

  // ===== SYSTEM =====
  [PERMISSION.VIEW_SYSTEM]: {
    module: "system",
    label: "view-system",
  },
  [PERMISSION.CREATE_SYSTEM]: {
    module: "system",
    label: "create-system",
    feOnly: true,
  },
  [PERMISSION.EDIT_SYSTEM]: {
    module: "system",
    label: "edit-system",
  },
  [PERMISSION.DELETE_SYSTEM]: {
    module: "system",
    label: "delete-system",
    feOnly: true,
  },

  // ===== LEAVE FORM =====
  [PERMISSION.VIEW_LEAVE_FORM]: {
    module: "leave_form",
    label: "view-leave-form",
  },
  [PERMISSION.CREATE_LEAVE_FORM]: {
    module: "leave_form",
    label: "create-leave-form",
    feOnly: true,
  },
  [PERMISSION.EDIT_LEAVE_FORM]: {
    module: "leave_form",
    label: "edit-leave-form",
  },
  [PERMISSION.DELETE_LEAVE_FORM]: {
    module: "leave_form",
    label: "delete-leave-form",
    feOnly: true,
  },
  // ===== MY TASK =====
  [PERMISSION.VIEW_MY_TASK]: {
    module: "my_task",
    label: "view-my-task",
  },
  [PERMISSION.EDIT_MY_TASK]: {
    module: "my_task",
    label: "edit-my-task",
  },

  // ===== Leave Action =====
  [PERMISSION.SAVE_LEAVE]: {
    module: "leave_action",
    label: "save",
  },
  [PERMISSION.SUBMIT_LEAVE]: {
    module: "leave_action",
    label: "submit",
  },
  [PERMISSION.APPROVE_LEAVE]: {
    module: "leave_action",
    label: "approve",
  },
  [PERMISSION.REJECT_LEAVE]: {
    module: "leave_action",
    label: "reject",
  },
  [PERMISSION.CANCEL_LEAVE]: {
    module: "leave_action",
    label: "cancel",
  },
};
