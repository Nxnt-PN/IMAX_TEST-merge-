
/* ========= API ========= */
export function getAllSystems(queryParams) {
  return globalThis.$axios.get("/api/systems/", {
    params: queryParams,
  });
}

// not have in api
export function getAllSystemsActive(queryParams) {
  return globalThis.$axios.get("/api/systems/active", {
    params: queryParams,
  });
}

export function getSystemById(systemId) {
  return globalThis.$axios.get(`/api/systems/${systemId}`);
}

export function createSystem(systemData) {
  return globalThis.$axios.post("/api/systems/", systemData);
}

export function updateSystem(systemId, systemData) {
  return globalThis.$axios.put(`/api/systems/${systemId}`, systemData);
}

export function deleteSystem(systemId) {
  return globalThis.$axios.delete(`/api/systems/${systemId}`);
}