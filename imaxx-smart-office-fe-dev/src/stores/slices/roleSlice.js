// src/stores/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getAllRoles as getAllRolesService,
    getAllRolesActive as getAllRolesActiveService,
    getRoleById as getRoleByIdService,
    createRole as createRoleService,
    updateRole as updateRoleService,
    deleteRole as deleteRoleService,
} from '@/services/roleService'
import { createDataState, setPending, setRejected, setFulfilled } from '@/utils/sliceHelpers'



export const getAllRoles = createAsyncThunk(
  'role/getAllRoles',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllRolesService(queryParams)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const getAllRolesActive = createAsyncThunk(
  'role/getAllRolesActive',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllRolesActiveService(queryParams)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const getRoleById = createAsyncThunk(
  'role/getRoleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getRoleByIdService(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const createRole = createAsyncThunk(
  'role/createRole',
  async (data, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await createRoleService(data)
      const { page, limit, sort } = getState().role
      await dispatch(getAllRoles({ page, limit, sort }))
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const updateRole = createAsyncThunk(
  'role/updateRole',
  async ({id, data}, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await updateRoleService(id, data)
      const { page, limit, sort } = getState().role
      await dispatch(getAllRoles({ page, limit, sort }))
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data.message || 'Error')
    }
  }
)

export const deleteRole = createAsyncThunk(
  'role/deleteRole',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await deleteRoleService(id)
      const { page, limit, sort } = getState().role
      await dispatch(getAllRoles({ page, limit, sort }))
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

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllRoles
      .addCase(getAllRoles.pending, (state) => {
        setPending(state, 'all')
      })
      .addCase(getAllRoles.fulfilled, (state, action) => {
        setFulfilled(state, action, 'all')
      })
      .addCase(getAllRoles.rejected, (state, action) => {
        setRejected(state, action, 'all')
      })
      // getAllRolesActive
      .addCase(getAllRolesActive.pending, (state) => {
        setPending(state, 'active')
      })
      .addCase(getAllRolesActive.fulfilled, (state, action) => {
        setFulfilled(state, action, 'active')
      })
      .addCase(getAllRolesActive.rejected, (state, action) => {
        setRejected(state, action, 'active')
      })
      // getRoleById
      .addCase(getRoleById.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.selected.data = action.payload.data
        state.selected.loading = false
      })
      .addCase(getRoleById.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // CreateRole
      .addCase(createRole.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(createRole.fulfilled, (state) => {
        state.selected.loading = false
      })
      .addCase(createRole.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // updateRole
      .addCase(updateRole.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(updateRole.fulfilled, (state) => {
        state.selected.loading = false
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
      // deleteRole
      .addCase(deleteRole.pending, (state) => {
        state.selected.loading = true
        state.selected.errorMessage = ''
      })
      .addCase(deleteRole.fulfilled, (state) => {
        state.selected.loading = false
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.selected.loading = false
        state.selected.errorMessage = action.payload
      })
  },
})

/* Selectors */
// Selectors - selected
export const selectSelectedData = (state) => state.role.selected.data
export const selectLoadingSelectedData = (state) => state.role.selected.loading

// Selectors - active
export const selectActiveData = (state) => state.role.active.data
export const selectTotalAllActive = (state) => state.role.active.total
export const selectTotalPageAllActive = (state) => state.role.active.totalPage
export const selectPageAllActive = (state) => state.role.active.page
export const selectLimitAllActive = (state) => state.role.active.limit
export const selectLoadingAllActive = (state) => state.role.active.loading
// Selectors - all
export const selectAllData = (state) => state.role.all.data
export const selectTotalAllData = (state) => state.role.all.total
export const selectTotalPageAllData = (state) => state.role.all.totalPage
export const selectPageAllData = (state) => state.role.all.page
export const selectLimitAllData = (state) => state.role.all.limit
export const selectLoadingAllData = (state) => state.role.all.loading

export default roleSlice.reducer
