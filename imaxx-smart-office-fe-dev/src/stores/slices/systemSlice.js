// src/stores/settingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllSystems as getAllSystemsService,
  getAllSystemsActive as getAllSystemsActiveService,
  getSystemById as getSystemByIdService,
  createSystem as createSystemService,
  updateSystem as updateSystemService,
  deleteSystem as deleteSystemService,
} from "@/services/systemService";
import { createDataState, setPending, setRejected, setFulfilled } from '@/utils/sliceHelpers'


export const getAllSystems = createAsyncThunk(
  "system/getAllSystems",
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllSystemsService(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

// // not have in api
export const getAllSystemsActive = createAsyncThunk(
  "system/getAllSystemsActive",
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await getAllSystemsActiveService(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const getSystemById = createAsyncThunk(
  "system/getSystemById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getSystemByIdService(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const createSystem = createAsyncThunk(
  "system/createSystem",
  async (data, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await createSystemService(data);

      const { page, limit, sort } = getState().system;
      await dispatch(getAllSystems({ page, limit, sort }));

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const updateSystem = createAsyncThunk(
  "system/updateSystem",
  async ({ id, data }, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await updateSystemService(id, data);

      const { page, limit, sort } = getState().system;
      await dispatch(getAllSystems({ page, limit, sort }));

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

export const deleteSystem = createAsyncThunk(
  "system/deleteSystem",
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await deleteSystemService(id);

      const { page, limit, sort } = getState().system;
      await dispatch(getAllSystems({ page, limit, sort }));

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.message || "Error");
    }
  },
);

const initialState = {
  selected: createDataState('object'),
  all: createDataState('array'),
  active: createDataState('array'),
}


const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllSystems
      .addCase(getAllSystems.pending, (state) => {
        setPending(state, "all");
      })
      .addCase(getAllSystems.fulfilled, (state, action) => {
        setFulfilled(state, action, "all");
      })
      .addCase(getAllSystems.rejected, (state, action) => {
        setRejected(state, action, "all");
      })
      // getAllSystemsActive
      .addCase(getAllSystemsActive.pending, (state) => {
        setPending(state, "active");
      })
      .addCase(getAllSystemsActive.fulfilled, (state, action) => {
        setFulfilled(state, action, "active");
      })
      .addCase(getAllSystemsActive.rejected, (state, action) => {
        setRejected(state, action, "active");
      })
      // getSystemById
      .addCase(getSystemById.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(getSystemById.fulfilled, (state, action) => {
        state.selected.data = action.payload.data;
        state.selected.loading = false;
      })
      .addCase(getSystemById.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
      // updateSystem
      .addCase(updateSystem.pending, (state) => {
        state.selected.loading = true;
        state.selected.errorMessage = "";
      })
      .addCase(updateSystem.fulfilled, (state, action) => {
        state.selected.data = action.payload.data;
        state.selected.loading = false;
      })
      .addCase(updateSystem.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.errorMessage = action.payload;
      })
  },
});

/* Selectors */
// Selectors - selected
export const selectSelectedData = (state) => state.system.selected.data
export const selectLoadingSelectedData = (state) => state.system.selected.loading

// Selectors - active
export const selectActiveData = (state) => state.system.active.data
export const selectTotalAllActive = (state) => state.system.active.total
export const selectTotalPageAllActive = (state) => state.system.active.totalPage
export const selectPageAllActive = (state) => state.system.active.page
export const selectLimitAllActive = (state) => state.system.active.limit
export const selectLoadingAllActive = (state) => state.system.active.loading
// Selectors - all
export const selectAllData = (state) => state.system.all.data
export const selectTotalAllData = (state) => state.system.all.total
export const selectTotalPageAllData = (state) => state.system.all.totalPage
export const selectPageAllData = (state) => state.system.all.page
export const selectLimitAllData = (state) => state.system.all.limit
export const selectLoadingAllData = (state) => state.system.all.loading

export default systemSlice.reducer;
