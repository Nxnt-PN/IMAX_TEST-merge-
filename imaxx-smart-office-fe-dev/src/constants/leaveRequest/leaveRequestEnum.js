// leave.enum.js
export const LEAVE_TYPE = Object.freeze({
  SICK: "sick", //ลาป่วย
  ANNUAL: "annual", //ลาพักร้อน
  ABSENCE: "absence", //ลากิจ
  OTHER: "other", //ลาอื่นๆ
});

export const LEAVE_STATE = Object.freeze({
  DRAFT: 1, // secondary color
  WAITING_MANAGER: 2, // warning color
  WAITING_HR: 3, // warning color
  COMPLETE: 100, // success color
  CANCELLED: 101, // orange color
});