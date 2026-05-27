// src/stores/workflowSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getAllWorkflows as getAllWorkflowsService,
    getAllWorkflowsActive as getAllWorkflowsActiveService,
    createWorkflow as createWorkflowService,
    updateWorkflow as updateWorkflowService,
    deleteWorkflow as deleteWorkflowService,
    getWorkflowById as getWorkflowByIdService
} from '@/services/workflowService'
import { createDataState, setPending, setRejected, setFulfilled } from '@/utils/sliceHelpers'

export const getAllWorkflows = createAsyncThunk(
  'workflow/getAllWorkflows',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllWorkflowsService(queryParams);
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const getAllWorkflowsActive = createAsyncThunk(
  'workflow/getAllWorkflowsActive',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllWorkflowsActiveService(queryParams)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const getById = createAsyncThunk(
  'workflow/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getWorkflowByIdService(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const createWorkflow = createAsyncThunk(
  'workflow/createWorkflow',
  async (workflowData, { rejectWithValue, getState, dispatch  }) => {
    try {
      const response = await createWorkflowService(workflowData)

      const { page, limit, sort } = getState().workflow
      await dispatch(getAllWorkflows({ page, limit, sort }))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const updateWorkflow = createAsyncThunk(
  'workflow/updateWorkflow',
  async ({id,data}, { rejectWithValue, getState, dispatch  }) => {
    try {
      const response = await updateWorkflowService(id,data)

      const { page, limit, sort } = getState().workflow
      await dispatch(getAllWorkflows({ page, limit, sort }))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const deleteWorkflow = createAsyncThunk(
  'workflow/deleteWorkflow',
  async (id, { rejectWithValue, getState, dispatch  }) => {
    try {
      const response = await deleteWorkflowService(id)

      const { page, limit, sort } = getState().workflow
      await dispatch(getAllWorkflows({ page, limit, sort }))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

const initialState = {
  selected: createDataState('object'),
  all: createDataState('array'),
  active: createDataState('array'),
}

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllWorkflows
      .addCase(getAllWorkflows.pending, (state,action) => {
        setPending(state, "all");
      })
      .addCase(getAllWorkflows.fulfilled, (state,action) => {
        setFulfilled(state, action, "all");
      })
      .addCase(getAllWorkflows.rejected, (state,action) => {
        setRejected(state, action, "all");
      })
      // getAllWorkflowsActive
      .addCase(getAllWorkflowsActive.pending, (state) => {
        setPending(state,"active");
      })
      .addCase(getAllWorkflowsActive.fulfilled, (state, action) => {
        setFulfilled(state, action, "active");
      })
      .addCase(getAllWorkflowsActive.rejected, (state, action) => {
        setRejected(state, action, "active");
      })
      // getById
      .addCase(getById.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(getById.fulfilled, (state, action) => {
        state.selected.data = action.payload.data
        state.selected.loading = false
      })
      .addCase(getById.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // createWorkflow
      .addCase(createWorkflow.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(createWorkflow.fulfilled, (state, action) => {
        state.selected.loading = false
      })
      .addCase(createWorkflow.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // update workflow
      .addCase(updateWorkflow.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(updateWorkflow.fulfilled, (state, action) => {
        state.selected.loading = false
      })
      .addCase(updateWorkflow.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // delete workflow
      .addCase(deleteWorkflow.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        state.selected.loading = false
      })
      .addCase(deleteWorkflow.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
  },
})

/* Selectors */
// Selectors - selected
export const selectSelectedData = (state) => state.workflow.selected.data
export const selectLoadingSelectedData = (state) => state.workflow.selected.loading

// Selectors - active
export const selectActiveData = (state) => state.workflow.active.data
export const selectTotalAllActive = (state) => state.workflow.active.total
export const selectTotalPageAllActive = (state) => state.workflow.active.totalPage
export const selectPageAllActive = (state) => state.workflow.active.page
export const selectLimitAllActive = (state) => state.workflow.active.limit
export const selectLoadingAllActive = (state) => state.workflow.active.loading
// Selectors - all
export const selectAllData = (state) => state.workflow.all.data
export const selectTotalAllData = (state) => state.workflow.all.total
export const selectTotalPageAllData = (state) => state.workflow.all.totalPage
export const selectPageAllData = (state) => state.workflow.all.page
export const selectLimitAllData = (state) => state.workflow.all.limit
export const selectLoadingAllData = (state) => state.workflow.all.loading

export default workflowSlice.reducer
