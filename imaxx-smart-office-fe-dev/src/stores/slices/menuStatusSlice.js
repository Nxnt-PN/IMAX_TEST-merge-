// src/stores/menuStatusSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getMenuStatus as getMenuStatusService
} from '@/services/menuStatusService'
import { createDataState } from '@/utils/sliceHelpers'


export const getMenuStatus = createAsyncThunk(
  'menuStatus/getMenuStatus',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getMenuStatusService(queryParams)
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

const menuStatusSlice = createSlice({
  name: 'menuStatus',
  initialState,
  reducers: {
    setMenuCounter: (state, action) => {
      state.selected.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMenuStatus.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(getMenuStatus.fulfilled, (state, action) => {
        state.selected.data = action.payload.data;
        state.selected.loading = false;
      })
      .addCase(getMenuStatus.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
  },
})

/* Selectors */
// Selectors - selected
export const selectSelectedData = (state) => state.menuStatus.selected.data
export const selectLoadingSelectedData = (state) => state.menuStatus.selected.loading

// Selectors - all
export const selectAllData = (state) => state.menuStatus.all.data
export const selectTotalAllData = (state) => state.menuStatus.all.total
export const selectTotalPageAllData = (state) => state.menuStatus.all.totalPage
export const selectPageAllData = (state) => state.menuStatus.all.page
export const selectLimitAllData = (state) => state.menuStatus.all.limit
export const selectLoadingAllData = (state) => state.menuStatus.all.loading

export const { setMenuCounter } = menuStatusSlice.actions;

export default menuStatusSlice.reducer
