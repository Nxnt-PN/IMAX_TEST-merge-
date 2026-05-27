// src/stores/permissionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getAllPermissions as getAllPermissionsService
} from '@/services/permissionService'
import { createDataState, setPending, setRejected, setFulfilled } from '@/utils/sliceHelpers'


export const getAllPermissions = createAsyncThunk(
  'permission/getAllPermissions',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllPermissionsService(queryParams)
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

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllPermissions.pending, (state) => {
        setPending(state, "all");
      })
      .addCase(getAllPermissions.fulfilled, (state, action) => {
        setFulfilled(state,action, "all");
      })
      .addCase(getAllPermissions.rejected, (state) => {
        setRejected(state, 'all')
      })
  },
})

/* Selectors */
// Selectors - selected
export const selectSelectedData = (state) => state.permission.selected.data
export const selectLoadingSelectedData = (state) => state.permission.selected.loading

// Selectors - all
export const selectAllData = (state) => state.permission.all.data
export const selectTotalAllData = (state) => state.permission.all.total
export const selectTotalPageAllData = (state) => state.permission.all.totalPage
export const selectPageAllData = (state) => state.permission.all.page
export const selectLimitAllData = (state) => state.permission.all.limit
export const selectLoadingAllData = (state) => state.permission.all.loading

export default permissionSlice.reducer
