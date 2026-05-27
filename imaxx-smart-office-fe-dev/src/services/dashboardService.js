
/* ========= API ========= */
export function getAllMyLeaveSummary(queryParams) {
  return globalThis.$axios.get("/api/dashboards/grouping-count", {
    params: queryParams,
  });
}

export function getAllMyLeaveCarlendar(queryParams) {
  return globalThis.$axios.get("/api/dashboards/calendar/me", {
    params: queryParams,
  });
}

export function getAllTeamLeaveCarlendar(queryParams) {
  return globalThis.$axios.get("/api/dashboards/calendar/children", {
    params: queryParams,
  });
}

