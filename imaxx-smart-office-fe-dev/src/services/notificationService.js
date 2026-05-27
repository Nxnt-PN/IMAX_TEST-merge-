
/* ========= API ========= */
export function getAllNotifications(queryParams) {
  return globalThis.$axios.get("/api/notifications/", {
    params: queryParams,
  });
}

export function getUnreadNotifications(queryParams) {
  return globalThis.$axios.get("/api/notifications/unread", {
    params: queryParams,
  });
}

export function setReadNotification(id) {
  return globalThis.$axios.get(`/api/notifications/set-read/${id}`);
}

export function setReadAllNotifications() {
  return globalThis.$axios.patch(`/api/notifications/set-read/all`);
}