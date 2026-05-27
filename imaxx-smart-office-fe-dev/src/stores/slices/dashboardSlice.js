// src/stores/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getAllMyLeaveSummary as getAllMyLeaveSummaryService,
    getAllMyLeaveCarlendar as getAllMyLeaveCarlendarService,
    getAllTeamLeaveCarlendar as getAllTeamLeaveCarlendarService,
} from '@/services/dashboardService'
import { createDataState, setPending, setRejected, setFulfilled } from '@/utils/sliceHelpers'

export const getAllMyLeaveSummary = createAsyncThunk(
    'dashboard/getAllMyLeaveSummary',
    async (queryParams, { rejectWithValue }) => {
        try {
            const response = await getAllMyLeaveSummaryService(queryParams)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data.message || 'Error')
        }
    }
)

export const getAllMyLeaveCarlendar = createAsyncThunk(
    'dashboard/getAllMyLeaveCarlendar',
    async (queryParams, { rejectWithValue }) => {
        try {
            const response = await getAllMyLeaveCarlendarService(queryParams)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data.message || 'Error')
        }
    }
)


export const getAllTeamLeaveCarlendar = createAsyncThunk(
    'dashboard/getAllTeamLeaveCarlendar',
    async (queryParams, { rejectWithValue }) => {
        try {
            const response = await getAllTeamLeaveCarlendarService(queryParams)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

const initialState = {
  selected: createDataState('object'),
  active: createDataState('array'),

  summary: createDataState('object'),
  myCalendar: createDataState('array'),
  teamCalendar: createDataState('array'),
}

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getAllMyLeaveSummary
.addCase(getAllMyLeaveSummary.pending, (state) => {
  setPending(state, "summary");
})
.addCase(getAllMyLeaveSummary.fulfilled, (state, action) => {
  state.summary.data = action.payload.data;
  state.summary.loading = false;
  state.summary.errorMessage = "";
})
.addCase(getAllMyLeaveSummary.rejected, (state, action) => {
  setRejected(state, action, "summary");
})
            // getAllMyLeaveCarlendar
.addCase(getAllMyLeaveCarlendar.pending, (state) => {
  setPending(state, "myCalendar");
})
.addCase(getAllMyLeaveCarlendar.fulfilled, (state, action) => {
  state.myCalendar.data = action.payload.data;
  state.myCalendar.loading = false;
  state.myCalendar.errorMessage = "";
})
.addCase(getAllMyLeaveCarlendar.rejected, (state, action) => {
  setRejected(state, action, "myCalendar");
})
            // getAllTeamLeaveCarlendar
.addCase(getAllTeamLeaveCarlendar.pending, (state) => {
  state.teamCalendar.loading = true;
  state.teamCalendar.errorMessage = "";
})
.addCase(getAllTeamLeaveCarlendar.fulfilled, (state, action) => {
  state.teamCalendar.data = action.payload.data;
  state.teamCalendar.loading = false;
  state.teamCalendar.errorMessage = "";
})
.addCase(getAllTeamLeaveCarlendar.rejected, (state, action) => {
  state.teamCalendar.loading = false;
  state.teamCalendar.errorMessage = action.payload;
})
    },
})

/* Selectors */
// Selectors - selected
export const selectSelectedData = (state) => state.dashboard.selected.data
export const selectLoadingSelectedData = (state) => state.dashboard.selected.loading

// Selectors - active
export const selectActiveData = (state) => state.dashboard.active.data
export const selectTotalAllActive = (state) => state.dashboard.active.total
export const selectTotalPageAllActive = (state) => state.dashboard.active.totalPage
export const selectPageAllActive = (state) => state.dashboard.active.page
export const selectLimitAllActive = (state) => state.dashboard.active.limit
export const selectLoadingAllActive = (state) => state.dashboard.active.loading
// Selectors - all
// export const selectAllData = (state) => state.dashboard.all.data
// export const selectTotalAllData = (state) => state.dashboard.all.total
// export const selectTotalPageAllData = (state) => state.dashboard.all.totalPage
// export const selectPageAllData = (state) => state.dashboard.all.page
// export const selectLimitAllData = (state) => state.dashboard.all.limit
// export const selectLoadingAllData = (state) => state.dashboard.all.loading

// Summary
export const selectLeaveSummary = (state) =>
  state.dashboard.summary.data;

// My calendar
export const selectMyLeaveCalendar = (state) =>
  state.dashboard.myCalendar.data;

// Team calendar
export const selectTeamLeaveCalendar = (state) =>
  state.dashboard.teamCalendar.data;
export default dashboardSlice.reducer
