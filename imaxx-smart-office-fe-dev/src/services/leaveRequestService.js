import moment from "moment";

/* ========= API ========= */
export function getAllLeaveRequests(queryParams) {
  return globalThis.$axios.get("/api/leave-forms/", {
    params: queryParams,
  });
}

export function getAllSummaryReportLeaveRequests(queryParams) {
  return globalThis.$axios.get("/api/leave-forms/report", {
    params: queryParams,
  });
}

export function getAllStaffReportLeaveRequests(queryParams) {
  return globalThis.$axios.get("/api/leave-reports/staff", {
    params: queryParams,
  });
}

export async function getAllMyLeaveRequests(queryParams) {
  const resp = await globalThis.$axios.get("/api/leave-forms/me", {
    params: queryParams,
  });
  // normalize
  resp.data.data.rows = resp.data.data.rows.map((d) => {
    return {
      ...d,
      start_date: d.start_date
      ? moment.parseZone(d.start_date).format("YYYY-MM-DDTHH:mm:ss")
      : d.start_date,
      end_date: d.end_date
      ? moment.parseZone(d.end_date).format("YYYY-MM-DDTHH:mm:ss")
      : d.end_date,
    };
  });
  console.log('resp :', resp);
  return resp;
}

export async function getAllLeaveTask(queryParams) {
  const resp = await globalThis.$axios.get("/api/leave-forms/task", {
    params: queryParams,
  });

  resp.data.data.rows = resp.data.data.rows.map((d) => {
    return {
      ...d,
      start_date: d.start_date
        ? moment.parseZone(d.start_date).format("YYYY-MM-DDTHH:mm:ss")
        : d.start_date,
      end_date: d.end_date
        ? moment.parseZone(d.end_date).format("YYYY-MM-DDTHH:mm:ss")
        : d.end_date,
    };
  });

  return resp;
}

export function getLeaveRequestById(leaveRqId) {
  return globalThis.$axios.get(`/api/leave-forms/${leaveRqId}`);
}

export function createLeaveRequest(leaveRqData) {
  return globalThis.$axios.post("/api/leave-forms/", leaveRqData);
}

export function updateLeaveRequest(leaveRqId, leaveRqData) {
  return globalThis.$axios.put(`/api/leave-forms/${leaveRqId}`, leaveRqData);
}

export function updateLeaveReviewRequest(leaveRqId, leaveRqData) {
  return globalThis.$axios.put(
    `/api/leave-forms/review/${leaveRqId}`,
    leaveRqData,
  );
}

export function cancelLeaveRequest(leaveRqId, leaveRqData) {
  return globalThis.$axios.put(
    `/api/leave-forms/cancel/${leaveRqId}`,
    leaveRqData,
  );
}

export function deleteLeaveRequest(leaveRqId) {
  return globalThis.$axios.delete(`/api/leave-forms/${leaveRqId}`);
}

export function uploadFileLeaveRequest(leaveRqId, formData) {
  return globalThis.$axios.patch(
    `/api/leave-forms/upload/${leaveRqId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
}

export function exportSummaryReportLeaveRequests(queryParams) {
  return globalThis.$axios.get("/api/leave-forms/export", {
    params: queryParams,
    responseType: "blob",
  });
}

export function exportStaffReportLeaveRequests(queryParams) {
  return globalThis.$axios.get("/api/leave-reports/staff/export", {
    params: queryParams,
    responseType: "blob",
  });
}
