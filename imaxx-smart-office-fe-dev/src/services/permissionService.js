
/* ========= API ========= */
export function getAllPermissions(queryParams) {
  return globalThis.$axios.get("/api/permissions/", {
    params: queryParams,
  });
}