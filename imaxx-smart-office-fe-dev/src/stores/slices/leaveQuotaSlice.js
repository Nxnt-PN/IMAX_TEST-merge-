// src/stores/leaveQuotaSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getAllLeaveQuotas as getAllLeaveQuotaService,
    createLeaveQuota as createLeaveQuotaService,
    updateLeaveQuota as updateLeaveQuotaService,
    deleteLeaveQuota as deleteLeaveQuotaService,
    getLeaveQuotaById as getLeaveQuotaByIdService

} from '@/services/leaveQuotaService'
import { createDataState, setPending, setRejected, setFulfilled } from '@/utils/sliceHelpers'



export const getAllLeaveQuotas = createAsyncThunk(
  'leaveQuota/getAllLeaveQuotas',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllLeaveQuotaService(queryParams)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const getLeaveQuotaById = createAsyncThunk(
  'leaveQuota/getLeaveQuotaById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getLeaveQuotaByIdService(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const createLeaveQuota = createAsyncThunk(
  'leaveQuota/createLeaveQuota',
  async (data, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await createLeaveQuotaService(data)

      const { page, limit, sort } = getState().leaveQuota
      await dispatch(getAllLeaveQuotas({ page, limit, sort }))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const updateLeaveQuota = createAsyncThunk(
  'leaveQuota/updateLeaveQuota',
  async ({id, data}, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await updateLeaveQuotaService(id, data)

      const { page, limit, sort } = getState().leaveQuota
      await dispatch(getAllLeaveQuotas({ page, limit, sort }))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const deleteLeaveQuota = createAsyncThunk(
  'leaveQuota/deleteLeaveQuota',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await deleteLeaveQuotaService(id)

      const { page, limit, sort } = getState().leaveQuota
      await dispatch(getAllLeaveQuotas({ page, limit, sort }))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)


const initialState = {
  selected: createDataState('object'),
  all: createDataState('array'),
}

const leaveQuotaSlice = createSlice({
  name: 'leaveQuota',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllLeaveQuotas
      .addCase(getAllLeaveQuotas.pending, (state) => {
        setPending(state, "all");
      })
      .addCase(getAllLeaveQuotas.fulfilled, (state, action) => {
        setFulfilled(state, action, "all");
      })
      .addCase(getAllLeaveQuotas.rejected, (state, action) => {
        setRejected(state, action,"all");
      })
      // getLeaveQuotaById
      .addCase(getLeaveQuotaById.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(getLeaveQuotaById.fulfilled, (state, action) => {
        state.selected.data = action.payload.data
        state.selected.loading = false
      })
      .addCase(getLeaveQuotaById.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // createLeaveQuota
      .addCase(createLeaveQuota.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(createLeaveQuota.fulfilled, (state) => {
        state.selected.loading = false
      })
      .addCase(createLeaveQuota.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // updateLeaveQuota
      .addCase(updateLeaveQuota.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(updateLeaveQuota.fulfilled, (state) => {
        state.selected.loading = false
      })
      .addCase(updateLeaveQuota.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // deleteLeaveQuota
      .addCase(deleteLeaveQuota.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(deleteLeaveQuota.fulfilled, (state) => {
        state.selected.loading = false
      })
      .addCase(deleteLeaveQuota.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
  },
})

/* Selectors */
// Selectors - selected
export const selectSelectedData = (state) => state.leaveQuota.selected.data
export const selectLoadingSelectedData = (state) => state.leaveQuota.selected.loading

// Selectors - all
export const selectAllData = (state) => state.leaveQuota.all.data
export const selectTotalAllData = (state) => state.leaveQuota.all.total
export const selectTotalPageAllData = (state) => state.leaveQuota.all.totalPage
export const selectPageAllData = (state) => state.leaveQuota.all.page
export const selectLimitAllData = (state) => state.leaveQuota.all.limit
export const selectLoadingAllData = (state) => state.leaveQuota.all.loading

export default leaveQuotaSlice.reducer
