import { config } from "@/config/config";

export const rowId = (row) => row?.id || row?.ID;

export const extractArray = (data) => (
  Array.isArray(data)
    ? data
    : (data?.data || Object.values(data || {}).find(Array.isArray) || [])
);

export const projectName = (row) => (
  row?.projectname ||
  row?.project_name ||
  row?.projectName ||
  row?.ProjectName ||
  row?.name ||
  ""
);

export const reasonName = (row) => (
  row?.reasonname ||
  row?.reason_name ||
  row?.reasonName ||
  row?.ReasonName ||
  row?.name ||
  ""
);

export const locationName = (row) => (
  row?.location_name ||
  row?.LocationName ||
  row?.name ||
  ""
);

export const systemName = (row, fallback = "") => (
  row?.system?.name ||
  row?.system?.Name ||
  row?.System?.name ||
  row?.System?.Name ||
  fallback
);

export const systemId = (row) => (
  row?.system_id ||
  row?.SystemID ||
  row?.system?.id ||
  row?.System?.ID ||
  ""
);

export const personName = (person) => (
  person?.name ||
  [person?.first_name || person?.FirstName, person?.last_name || person?.LastName]
    .filter(Boolean)
    .join(" ") ||
  person?.username ||
  person?.Username ||
  ""
);

export const assetUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = String(path).startsWith("/") ? path : `/${path}`;
  return `${config.apiBaseURL}${normalizedPath}`;
};
