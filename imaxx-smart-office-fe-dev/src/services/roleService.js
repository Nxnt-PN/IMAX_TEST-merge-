
/* ========= API ========= */
export function getAllRoles(queryParams) {
  return globalThis.$axios.get("/api/roles/", {
    params: queryParams,
  });
}

export function getAllRolesActive(queryParams) {
  return globalThis.$axios.get("/api/roles/active", {
    params: queryParams,
  });
}

export function getRoleById(roleId) {
  return globalThis.$axios.get(`/api/roles/${roleId}`);
}

export function createRole(roleData) {
  return globalThis.$axios.post("/api/roles/", roleData);
}

export function updateRole(roleId, roleData) {
  return globalThis.$axios.put(`/api/roles/${roleId}`, roleData);
}

export function deleteRole(roleId) {
  return globalThis.$axios.delete(`/api/roles/${roleId}`);
}

