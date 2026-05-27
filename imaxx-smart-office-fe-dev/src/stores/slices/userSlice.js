// src/stores/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getAllUsers as getAllUsersService,
    getAllUsersActive as getAllUsersActiveService,
    createUser as createUserService,
    updateUser as updateUserService,
    deleteUser as deleteUserService,
    getUserById as getUserByIdService
} from '@/services/userService'
import { createDataState, setPending, setRejected, setFulfilled } from '@/utils/sliceHelpers'

export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllUsersService(queryParams)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const getAllUsersActive = createAsyncThunk(
  'user/getAllUsersActive',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllUsersActiveService(queryParams)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const getById = createAsyncThunk(
  'user/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getUserByIdService(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error')
    }
  }
)

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue, getState, dispatch  }) => {
    try {
      const response = await createUserService(userData)

      const { page, limit, sort } = getState().user
      await dispatch(getAllUsers({ page, limit, sort }))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error')
    }
  }
)

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({id,data}, { rejectWithValue, getState, dispatch  }) => {
    try {
      const response = await updateUserService(id,data)

      const { page, limit, sort } = getState().user
      await dispatch(getAllUsers({ page, limit, sort }))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue, getState, dispatch  }) => {
    try {
      const response = await deleteUserService(id)

      const { page, limit, sort } = getState().user
      await dispatch(getAllUsers({ page, limit, sort }))

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

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllUsers
      .addCase(getAllUsers.pending, (state) => {
        setPending(state,"all");
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        setFulfilled(state, action,"all");
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        setRejected(state, action,"all");
      })
      // getAllUsersActive
      .addCase(getAllUsersActive.pending, (state) => {
        setPending(state, "active");
      })
      .addCase(getAllUsersActive.fulfilled, (state, action) => {
        setFulfilled(state, action, "active");
      })
      .addCase(getAllUsersActive.rejected, (state, action) => {
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
      // createUser
      .addCase(createUser.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.selected.loading = false
      })
      .addCase(createUser.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // update user
      .addCase(updateUser.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.selected.loading = false
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // delete user
      .addCase(deleteUser.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.selected.loading = false
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
  },
})

/* Selectors */
// Selectors - selected
export const selectSelectedData = (state) => state.user.selected.data
export const selectLoadingSelectedData = (state) => state.user.selected.loading

// Selectors - active
export const selectActiveData = (state) => state.user.active.data
export const selectTotalAllActive = (state) => state.user.active.total
export const selectTotalPageAllActive = (state) => state.user.active.totalPage
export const selectPageAllActive = (state) => state.user.active.page
export const selectLimitAllActive = (state) => state.user.active.limit
export const selectLoadingAllActive = (state) => state.user.active.loading
// Selectors - all
export const selectAllData = (state) => state.user.all.data
export const selectTotalAllData = (state) => state.user.all.total
export const selectTotalPageAllData = (state) => state.user.all.totalPage
export const selectPageAllData = (state) => state.user.all.page
export const selectLimitAllData = (state) => state.user.all.limit
export const selectLoadingAllData = (state) => state.user.all.loading

export default userSlice.reducer
