// src/stores/permissionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getAllHolidays as getAllHolidaysService
} from '@/services/holidayService'
import { createDataState, setPending, setRejected, setFulfilled } from '@/utils/sliceHelpers'


export const getAllHolidays = createAsyncThunk(
  'permission/getAllHolidays',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllHolidaysService(queryParams)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

const initialState = {
  all: createDataState('array'),
}

const holidaySlice = createSlice({
  name: 'holiday',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllHolidays.pending, (state) => {
        setPending(state, "all");
      })
      .addCase(getAllHolidays.fulfilled, (state, action) => {
        setFulfilled(state,action, "all");
      })
      .addCase(getAllHolidays.rejected, (state) => {
        setRejected(state, 'all')
      })
  },
})

/* Selectors */


// Selectors - all
export const selectAllData = (state) => state.holiday.all.data
export const selectTotalAllData = (state) => state.holiday.all.total
export const selectTotalPageAllData = (state) => state.holiday.all.totalPage
export const selectPageAllData = (state) => state.holiday.all.page
export const selectLimitAllData = (state) => state.holiday.all.limit
export const selectLoadingAllData = (state) => state.holiday.all.loading

export default holidaySlice.reducer
