
/* ========= API ========= */
export function getMenuStatus(queryParams) {
  return globalThis.$axios.get("/api/menu-status/my", {
    params: queryParams,
  });
}