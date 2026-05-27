
export async function getAllLeaveQuotas(queryParams) {
  try {
    const res = await globalThis.$axios.get("/api/leave-quotas/", {
      params: queryParams,
    });
    return res.data;
  } catch (error) {
    console.log("Leave Quota Service Error: ", error)
    throw error;
  }
}

export async function getLeaveQuotaById(leaveQuotaId) {
  try {
    const res = await globalThis.$axios.get(`/api/leave-quotas/${leaveQuotaId}`);
    return res.data;
  } catch (error) {
    console.log("Leave Quota Service Error: ", error)
    throw error;
  }
}

export async function createLeaveQuota(leaveQuotaData) {
  try {

    const res = await globalThis.$axios.post("/api/leave-quotas/", leaveQuotaData);
    return res.data;
  } catch (error) {
    console.log("Leave Quota Service Error: ", error)
    throw error;
  }
}

export async function updateLeaveQuota(leaveQuotaId, leaveQuotaData) {
  try {
    const res = await globalThis.$axios.put(
      `/api/leave-quotas/${leaveQuotaId}`,
      leaveQuotaData
    );
    return res.data;
  } catch (error) {
    console.log("Leave Quota Service Error: ", error)
    throw error;
  }
}

export async function deleteLeaveQuota(leaveQuotaId) {
  try {
    const res = await globalThis.$axios.delete(
      `/api/leave-quotas/${leaveQuotaId}`
    );
    return res.data;
  } catch (error) {
    console.log("Leave Quota Service Error: ", error)
    throw error;
  }
}
