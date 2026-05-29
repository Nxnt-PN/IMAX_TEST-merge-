export function getAllLocations(queryParams) {
  return globalThis.$axios.get("/api/locations/", {
    params: queryParams,
  });
}
