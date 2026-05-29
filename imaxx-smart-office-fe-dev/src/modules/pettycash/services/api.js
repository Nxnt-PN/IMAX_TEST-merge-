export { assetUrl } from "../utils/formatters";

const unwrap = (payload) => {
  if (payload?.pagination) return payload;
  if (payload?.data?.pagination) return payload.data;
  return payload?.data?.data ?? payload?.data ?? payload;
};
const responseData = (response) => unwrap(response.data);
const rowsOrData = (payload) => payload?.rows ?? payload?.data ?? payload;

const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
};

const api = () => globalThis.$axios;

export const getPettyCashForms = async (filters = {}) => {
  const response = await api().get(`/api/pettycash${buildQuery(filters)}`);
  return responseData(response);
};

export const getPettyCashSummary = async (filters = {}) => {
  const response = await api().get(`/api/pettycash/summary${buildQuery(filters)}`);
  return responseData(response);
};

export const getPettyCashFormById = async (id) => {
  const response = await api().get(`/api/pettycash/${id}`);
  return responseData(response);
};

export const getPettyCashHistory = async (id) => {
  const response = await api().get(`/api/pettycash/${id}/history`);
  return responseData(response);
};

export const createPettyCashForm = async (data) => {
  const response = await api().post("/api/pettycash", data);
  return responseData(response);
};

export const updatePettyCashForm = async (id, data) => {
  const response = await api().put(`/api/pettycash/${id}`, data);
  return responseData(response);
};

export const submitPettyCash = async (id, data) => {
  const response = await api().post(`/api/pettycash/submit/${id}`, data);
  return responseData(response);
};

export const approvePettyCash = async (id, data) => {
  const response = await api().post(`/api/pettycash/approve/${id}`, data);
  return responseData(response);
};

export const rejectPettyCash = async (id, data) => {
  const response = await api().post(`/api/pettycash/reject/${id}`, data);
  return responseData(response);
};

export const cancelPettyCash = async (id, data) => {
  const response = await api().post(`/api/pettycash/cancel/${id}`, data);
  return responseData(response);
};

export const resendPettyCash = async (id, data) => {
  const response = await api().post(`/api/pettycash/resend/${id}`, data);
  return responseData(response);
};

export const getProjects = async () => {
  const response = await api().get("/api/pettycash/projects");
  return responseData(response);
};

export const createProject = async (data) => {
  const response = await api().post("/api/pettycash/projects", data);
  return responseData(response);
};

export const updateProject = async (id, data) => {
  const response = await api().put(`/api/pettycash/projects/${id}`, data);
  return responseData(response);
};

export const deleteProject = async (id) => {
  const response = await api().delete(`/api/pettycash/projects/${id}`);
  return responseData(response);
};

export const getReasons = async (filters = {}) => {
  const response = await api().get(`/api/pettycash/reasons${buildQuery(filters)}`);
  return responseData(response);
};

export const createReason = async (data) => {
  const response = await api().post("/api/pettycash/reasons", data);
  return responseData(response);
};

export const updateReason = async (id, data) => {
  const response = await api().put(`/api/pettycash/reasons/${id}`, data);
  return responseData(response);
};

export const deleteReason = async (id) => {
  const response = await api().delete(`/api/pettycash/reasons/${id}`);
  return responseData(response);
};

export const getUsers = async () => {
  const response = await api().get("/api/users/", { params: { page: 1, limit: 1000 } });
  return rowsOrData(responseData(response));
};

export const uploadFile = async (formData) => {
  const response = await api().post("/api/pettycash/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return responseData(response);
};

export const getSystems = async () => {
  const response = await api().get("/api/systems/", { params: { page: 1, limit: 1000 } });
  return rowsOrData(responseData(response));
};

export const getLocations = async () => {
  const response = await api().get("/api/locations/", { params: { page: 1, limit: 1000 } });
  return rowsOrData(responseData(response));
};

export const createLocation = async (data) => {
  const response = await api().post("/api/locations/", data);
  return responseData(response);
};

export const updateLocation = async (id, data) => {
  const response = await api().put(`/api/locations/${id}`, data);
  return responseData(response);
};

export const deleteLocation = async (id) => {
  const response = await api().delete(`/api/locations/${id}`);
  return responseData(response);
};


const escapeHTML = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const downloadBlob = (content, fileName, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportReportExcel = (rows = [], filters = {}, labels = {}) => {
  const reportTitle = labels.reportTitle || "Petty Cash Report";
  const noDataText = labels.noData || "No data";
  const filterText = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");
  const bodyRows = rows.map((row, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHTML(row.documentNo || row.id)}</td>
      <td>${escapeHTML(row.date)}</td>
      <td>${escapeHTML(row.title)}</td>
      <td>${escapeHTML(row.project)}</td>
      <td>${escapeHTML(row.reason)}</td>
      <td>${escapeHTML(row.amount)}</td>
      <td>${escapeHTML(row.status)}</td>
    </tr>
  `).join("");
  downloadBlob(`
    <html><head><meta charset="utf-8" /></head><body>
      <table border="1">
        <caption>${escapeHTML(reportTitle)}${filterText ? ` (${escapeHTML(filterText)})` : ""}</caption>
        <tbody>${bodyRows || `<tr><td colspan="8">${escapeHTML(noDataText)}</td></tr>`}</tbody>
      </table>
    </body></html>
  `, `petty-cash-report-${new Date().toISOString().slice(0, 10)}.xls`, "application/vnd.ms-excel;charset=utf-8;");
};

export const downloadPettyCashPdf = async (id, fileName = "petty-cash.pdf") => {
  const response = await api().get(`/api/pettycash/${id}/pdf`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
