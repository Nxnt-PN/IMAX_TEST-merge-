// src/stores/leaveRequestSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllLeaveRequests as getAllLeaveRequestsService,
  getAllMyLeaveRequests as getAllMyLeaveRequestsService,
  createLeaveRequest as createLeaveRequestService,
  updateLeaveRequest as updateLeaveRequestService,
  updateLeaveReviewRequest as updateLeaveReviewRequestService,
  deleteLeaveRequest as deleteLeaveRequestService,
  getLeaveRequestById as getLeaveRequestByIdService,
  getAllLeaveTask as getAllLeaveTaskService,
  uploadFileLeaveRequest as uploadFileLeaveRequestService,
  cancelLeaveRequest as cancelLeaveRequestService,
  getAllSummaryReportLeaveRequests as getAllSummaryReportLeaveRequestsService,
  exportSummaryReportLeaveRequests as exportSummaryReportLeaveRequestsService,
  getAllStaffReportLeaveRequests as getAllStaffReportLeaveRequestsService,
  exportStaffReportLeaveRequests as exportStaffReportLeaveRequestsService,
} from "@/services/leaveRequestService";
import {
  getAllTeamLeaveCarlendar,
  getAllMyLeaveCarlendar,
} from "@/stores/slices/dashboardSlice";
import {
  createDataState,
  setPending,
  setRejected,
  setFulfilled,
} from "@/utils/sliceHelpers";

export const getAllLeaveRequests = createAsyncThunk(
  "leaveRequest/getAllLeaveRequests",
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllLeaveRequestsService(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const getAllMyLeaveRequests = createAsyncThunk(
  "leaveRequest/getAllMyLeaveRequests",
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllMyLeaveRequestsService(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const getAllLeaveTask = createAsyncThunk(
  "leaveRequest/getAllLeaveTask",
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllLeaveTaskService(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const getAllSummaryReportLeaveRequests = createAsyncThunk(
  "leaveRequest/getAllSummaryReportLeaveRequests",
  async (queryParams, { rejectWithValue }) => {
    try {
      const response =
        await getAllSummaryReportLeaveRequestsService(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const getAllStaffReportLeaveRequests = createAsyncThunk(
  "leaveRequest/getAllStaffReportLeaveRequests",
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllStaffReportLeaveRequestsService(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const exportSummaryReportLeaveRequests = createAsyncThunk(
  "leaveRequest/exportSummaryReportLeaveRequests",
  async (queryParams, { rejectWithValue }) => {
    try {
      const response =
        await exportSummaryReportLeaveRequestsService(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const exportStaffReportLeaveRequests = createAsyncThunk(
  "leaveRequest/exportStaffReportLeaveRequests",
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await exportStaffReportLeaveRequestsService(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const getById = createAsyncThunk(
  "leaveRequest/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getLeaveRequestByIdService(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error");
    }
  },
);

export const createLeaveRequest = createAsyncThunk(
  "leaveRequest/createLeaveRequest",
  async ({ data }, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await createLeaveRequestService(data);
      const { page, limit, sort } = getState().leaveRequest.myLeave;
      await dispatch(getAllMyLeaveRequests({ page, limit, sort }));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error");
    }
  },
);

export const updateLeaveRequest = createAsyncThunk(
  "leaveRequest/updateLeaveRequest",
  async ({ id, data }, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await updateLeaveRequestService(id, data);
      const { page, limit, sort } = getState().leaveRequest.myLeave;
      await dispatch(getAllMyLeaveRequests({ page, limit, sort }));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error");
    }
  },
);

export const updateLeaveReviewRequest = createAsyncThunk(
  "leaveRequest/updateLeaveReviewRequest",
  async ({ id, data }, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await updateLeaveReviewRequestService(id, data);

      const { page, limit, sort } = getState().leaveRequest.myTask;
      await dispatch(getAllLeaveTask({ page, limit, sort }));

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error");
    }
  },
);

export const cancelLeaveRequest = createAsyncThunk(
  "leaveRequest/cancelLeaveRequest",
  async ({ id, data, pageName }, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await cancelLeaveRequestService(id, data);

      if (pageName === "myLeave") {
        const { page, limit, sort } = getState().leaveRequest.myLeave;
        await dispatch(getAllMyLeaveRequests({ page, limit, sort }));
      } else if (pageName === "myLeaveTask") {
        const { page, limit, sort } = getState().leaveRequest.myTask;
        await dispatch(getAllLeaveTask({ page, limit, sort }));
      } else if (pageName === "summaryReport") {
        const { page, limit, sort } = getState().leaveRequest.summaryReport;
        await dispatch(getAllSummaryReportLeaveRequests({ page, limit, sort }));
      } else if (pageName === "teamDashboard") {
        await dispatch(getAllTeamLeaveCarlendar());
        await dispatch(getAllMyLeaveCarlendar());
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error");
    }
  },
);

export const deleteLeaveRequest = createAsyncThunk(
  "leaveRequest/deleteLeaveRequest",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await deleteLeaveRequestService(id);

      const { page, limit, sort } = getState().leaveRequest.myLeave;
      await dispatch(getAllMyLeaveRequests({ page, limit, sort }));

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const uploadFileLeaveRequest = createAsyncThunk(
  "leaveRequest/uploadFileLeaveRequest",
  async ({ id, formData }, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await uploadFileLeaveRequestService(id, formData);
      const { page, limit, sort } = getState().leaveRequest.myLeave;
      await dispatch(getAllMyLeaveRequests({ page, limit, sort }));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error");
    }
  },
);

const initialState = {
  selected: createDataState("object"),
  myLeave: createDataState("array"),
  myTask: createDataState("array"),
  summaryReport: createDataState("array"),
  staffReport: createDataState("array"),
  all: createDataState("array"),
  active: createDataState("array"),
};

const leaveRequestSlice = createSlice({
  name: "leaveRequest",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllLeaveRequests
      .addCase(getAllLeaveRequests.pending, (state) => {
        setPending(state, "all");
      })
      .addCase(getAllLeaveRequests.fulfilled, (state, action) => {
        setFulfilled(state, action, "all");
      })
      .addCase(getAllLeaveRequests.rejected, (state, action) => {
        setRejected(state, action, "all");
      })
      // getAllMyLeaveRequests
      .addCase(getAllMyLeaveRequests.pending, (state) => {
        setPending(state, "myLeave");
      })
      .addCase(getAllMyLeaveRequests.fulfilled, (state, action) => {
        setFulfilled(state, action, "myLeave");
      })
      .addCase(getAllMyLeaveRequests.rejected, (state, action) => {
        setRejected(state, action, "myLeave");
      })
      // getAllLeaveTask
      .addCase(getAllLeaveTask.pending, (state) => {
        setPending(state, "myTask");
      })
      .addCase(getAllLeaveTask.fulfilled, (state, action) => {
        setFulfilled(state, action, "myTask");
      })
      .addCase(getAllLeaveTask.rejected, (state, action) => {
        setRejected(state, action, "myTask");
      })
      // getAllSummaryReportLeaveRequests
      .addCase(getAllSummaryReportLeaveRequests.pending, (state) => {
        setPending(state, "summaryReport");
      })
      .addCase(getAllSummaryReportLeaveRequests.fulfilled, (state, action) => {
        setFulfilled(state, action, "summaryReport");
      })
      .addCase(getAllSummaryReportLeaveRequests.rejected, (state, action) => {
        setRejected(state, action, "summaryReport");
      })
      // getAllStaffReportLeaveRequests
      .addCase(getAllStaffReportLeaveRequests.pending, (state) => {
        setPending(state, "staffReport");
      })
      .addCase(getAllStaffReportLeaveRequests.fulfilled, (state, action) => {
        setFulfilled(state, action, "staffReport");
      })
      .addCase(getAllStaffReportLeaveRequests.rejected, (state, action) => {
        setRejected(state, action, "staffReport");
      })
      // exportReportLeave
      .addCase(exportSummaryReportLeaveRequests.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(exportSummaryReportLeaveRequests.fulfilled, (state, action) => {
        state.selected.data = action.payload.data;
        state.selected.loading = false;
      })
      .addCase(exportSummaryReportLeaveRequests.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
      // exportStaffReportLeave
      .addCase(exportStaffReportLeaveRequests.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(exportStaffReportLeaveRequests.fulfilled, (state, action) => {
        state.selected.data = action.payload.data;
        state.selected.loading = false;
      })
      .addCase(exportStaffReportLeaveRequests.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
      // getById
      .addCase(getById.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(getById.fulfilled, (state, action) => {
        state.selected.data = action.payload.data;
        state.selected.loading = false;
      })
      .addCase(getById.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
      // createLeaveRequest
      .addCase(createLeaveRequest.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.selected.loading = false;
      })
      .addCase(createLeaveRequest.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
      // update leaveRequest
      .addCase(updateLeaveRequest.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(updateLeaveRequest.fulfilled, (state, action) => {
        state.selected.loading = false;
      })
      .addCase(updateLeaveRequest.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
      // update updateLeaveReviewRequest
      .addCase(updateLeaveReviewRequest.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(updateLeaveReviewRequest.fulfilled, (state, action) => {
        state.selected.loading = false;
      })
      .addCase(updateLeaveReviewRequest.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
      // cancelLeaveRequest
      .addCase(cancelLeaveRequest.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(cancelLeaveRequest.fulfilled, (state, action) => {
        state.selected.loading = false;
      })
      .addCase(cancelLeaveRequest.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
      // delete leaveRequest
      .addCase(deleteLeaveRequest.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(deleteLeaveRequest.fulfilled, (state, action) => {
        state.selected.loading = false;
      })
      .addCase(deleteLeaveRequest.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
      // uploadFile
      .addCase(uploadFileLeaveRequest.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(uploadFileLeaveRequest.fulfilled, (state, action) => {
        state.selected.loading = false;
      })
      .addCase(uploadFileLeaveRequest.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      });
  },
});

/* Selectors */
// Selectors - selected
export const selectSelectedData = (state) => state.leaveRequest.selected.data;
export const selectLoadingSelectedData = (state) =>
  state.leaveRequest.selected.loading;

// Selectors - myLeave
export const selectMyLeaveData = (state) => state.leaveRequest.myLeave.data;
export const selectTotalAllMyLeave = (state) =>
  state.leaveRequest.myLeave.total;
export const selectTotalPageAllMyLeave = (state) =>
  state.leaveRequest.myLeave.totalPage;
export const selectPageAllMyLeave = (state) => state.leaveRequest.myLeave.page;
export const selectLimitAllMyLeave = (state) =>
  state.leaveRequest.myLeave.limit;
export const selectLoadingAllMyLeave = (state) =>
  state.leaveRequest.myLeave.loading;

// Selectors - myTask
export const selectMyTaskData = (state) => state.leaveRequest.myTask.data;
export const selectTotalAllMyTask = (state) => state.leaveRequest.myTask.total;
export const selectTotalPageAllMyTask = (state) =>
  state.leaveRequest.myTask.totalPage;
export const selectPageAllMyTask = (state) => state.leaveRequest.myTask.page;
export const selectLimitAllMyTask = (state) => state.leaveRequest.myTask.limit;
export const selectLoadingAllMyTask = (state) =>
  state.leaveRequest.myTask.loading;

// Selectors - summaryReport
export const selectAllSummaryReportData = (state) =>
  state.leaveRequest.summaryReport.data;
export const selectTotalAllSummaryReport = (state) =>
  state.leaveRequest.summaryReport.total;
export const selectTotalPageAllSummaryReport = (state) =>
  state.leaveRequest.summaryReport.totalPage;
export const selectPageAllSummaryReport = (state) =>
  state.leaveRequest.summaryReport.page;
export const selectLimitAllSummaryReport = (state) =>
  state.leaveRequest.summaryReport.limit;
export const selectLoadingAllSummaryReport = (state) =>
  state.leaveRequest.summaryReport.loading;

// Selectors - staffReport
export const selectAllStaffReportData = (state) =>
  state.leaveRequest.staffReport.data;
export const selectTotalAllStaffReport = (state) =>
  state.leaveRequest.staffReport.total;
export const selectTotalPageAllStaffReport = (state) =>
  state.leaveRequest.staffReport.totalPage;
export const selectPageAllStaffReport = (state) =>
  state.leaveRequest.staffReport.page;
export const selectLimitAllStaffReport = (state) =>
  state.leaveRequest.staffReport.limit;
export const selectLoadingAllStaffReport = (state) =>
  state.leaveRequest.staffReport.loading;

// Selectors - all
export const selectAllData = (state) => state.leaveRequest.all.data;
export const selectTotalAllData = (state) => state.leaveRequest.all.total;
export const selectTotalPageAllData = (state) =>
  state.leaveRequest.all.totalPage;
export const selectPageAllData = (state) => state.leaveRequest.all.page;
export const selectLimitAllData = (state) => state.leaveRequest.all.limit;
export const selectLoadingAllData = (state) => state.leaveRequest.all.loading;

export default leaveRequestSlice.reducer;
