
/* ========= API ========= */
export function getAllWorkflows(queryParams) {
  return globalThis.$axios.get("/api/workflows/", {
    params: queryParams,
  });
}

export function getAllWorkflowsActive(queryParams) {
  return globalThis.$axios.get("/api/workflows/active", {
    params: queryParams,
  });
}

export function getWorkflowById(workflowId) {
  return globalThis.$axios.get(`/api/workflows/${workflowId}`);
}

export function createWorkflow(workflowsData) {
  return globalThis.$axios.post("/api/workflows/", workflowsData);
}

export function updateWorkflow(workflowId, workflowsData) {
  return globalThis.$axios.put(`/api/workflows/${workflowId}`, workflowsData);
}

export function deleteWorkflow(workflowId) {
  return globalThis.$axios.delete(`/api/workflows/${workflowId}`);
}

