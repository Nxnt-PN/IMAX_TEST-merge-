
/* ========= API ========= */
export function getAllUsers(queryParams) {
  return globalThis.$axios.get("/api/users/", {
    params: queryParams,
  });
}

export function getAllUsersActive(queryParams) {
  return globalThis.$axios.get("/api/users/active", {
    params: queryParams,
  });
}

export function getUserById(userId) {
  return globalThis.$axios.get(`/api/users/${userId}`);
}

export function createUser(userData) {
  return globalThis.$axios.post("/api/users/", userData);
}

export function updateUser(userId, userData) {
  return globalThis.$axios.put(`/api/users/${userId}`, userData);
}

export function deleteUser(userId) {
  return globalThis.$axios.delete(`/api/users/${userId}`);
}

