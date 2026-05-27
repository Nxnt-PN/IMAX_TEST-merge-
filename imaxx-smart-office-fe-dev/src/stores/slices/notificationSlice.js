// src/stores/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getAllNotifications as getAllNotificationsService,
    getUnreadNotifications as getUnreadNotificationsService,
    setReadNotification as setReadNotificationService,
    setReadAllNotifications as setReadAllNotificationsService,
} from '@/services/notificationService'
import { createDataState, setPending, setRejected, setFulfilled } from '@/utils/sliceHelpers'


export const getAllNotifications = createAsyncThunk(
  'notification/getAllNotifications',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllNotificationsService(queryParams)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const getUnreadNotifications = createAsyncThunk(
  'notification/getUnreadNotifications',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getUnreadNotificationsService(queryParams)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const setReadNotification = createAsyncThunk(
  'notification/setReadNotification',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await setReadNotificationService(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const setReadAllNotifications = createAsyncThunk(
  'notification/setReadAllNotifications',
  async ( payload, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await setReadAllNotificationsService()
      const { page,limit,sort  } = getState().notification.all
      await dispatch(getAllNotifications({page, limit, sort}))
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

const initialState = {
  selected: createDataState('object'),
  all: createDataState('array'),
  unread: createDataState('array'),
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setUnread: (state, action) => {
      state.unread.data = action.payload.rows;
      state.unread.total = action.payload.total_rows;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(getAllNotifications.pending, (state) => {
      setPending(state, "all");
    })
    .addCase(getAllNotifications.fulfilled, (state, action) => {
      setFulfilled(state,action, "all");
    })
    .addCase(getAllNotifications.rejected, (state) => {
      setRejected(state, 'all')
    })
    // getUnreadNotification
    .addCase(getUnreadNotifications.pending, (state) => {
      setPending(state, "unread");
    })
    .addCase(getUnreadNotifications.fulfilled, (state, action) => {
      setFulfilled(state,action, "unread");
    })
    .addCase(getUnreadNotifications.rejected, (state) => {
      setRejected(state, 'unread')
    })
    // setReadNotification
    .addCase(setReadNotification.pending, (state) => {
      state.selected.loading = true
      state.selected.errorMessage = ''
    })
    .addCase(setReadNotification.fulfilled, (state, action) => {
      state.selected.data = action.payload.data
      state.selected.loading = false
    })
    .addCase(setReadNotification.rejected, (state, action) => {
      state.selected.loading = false
      state.selected.errorMessage = action.payload
    })
  },
})

/* Selectors */
// Selectors - selected
export const selectSelectedData = (state) => state.notification.selected.data
export const selectLoadingSelectedData = (state) => state.notification.selected.loading

// Selectors - unread
export const selectAllUnreadData = (state) => state.notification.unread.data
export const selectTotalUnreadData = (state) => state.notification.unread.total
export const selectTotalPageUnreadData = (state) => state.notification.unread.totalPage
export const selectPageUnreadData = (state) => state.notification.unread.page
export const selectLimitUnreadData = (state) => state.notification.unread.limit
export const selectLoadingUnreadData = (state) => state.notification.unread.loading

// Selectors - all
export const selectAllData = (state) => state.notification.all.data
export const selectTotalAllData = (state) => state.notification.all.total
export const selectTotalPageAllData = (state) => state.notification.all.totalPage
export const selectPageAllData = (state) => state.notification.all.page
export const selectLimitAllData = (state) => state.notification.all.limit
export const selectLoadingAllData = (state) => state.notification.all.loading

export const { setUnread } = notificationSlice.actions;

export default notificationSlice.reducer
