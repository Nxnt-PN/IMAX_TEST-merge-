// src/stores/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  login,
  clearToken,
  saveTokenInLocalStorage,
  changeMyPassword as changeMyPasswordService,
  changeMyProfilePicture as changeMyProfileService,
  getMyInfo as getMyInfoService,
} from "@/services/authService";
import { setUnread } from "@/stores/slices/notificationSlice";
import { setMenuCounter } from "@/stores/slices/menuStatusSlice";

// helpers
const getPermissionNames = (data) => {
  const tmpPermissions = [
    ...new Set(data?.user?.roles?.flatMap((r) => r.permissions) || []),
  ];
  return tmpPermissions?.map((p) => p.name) || null;
};

const getLocalstorageUserData = () => {
  return JSON.parse(localStorage.getItem("userDetails")) || {};
};

// Async Thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await login(username, password);
      saveTokenInLocalStorage(response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(setUnread({ rows: [], total_rows: 0 }));
      await dispatch(setMenuCounter(0));
      clearToken();
      dispatch(resetAuth());
      navigate("/login", { replace: true });

    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const changeMyPassword = createAsyncThunk(
  "auth/changeMyPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await changeMyPasswordService(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const changeMyProfilePicture = createAsyncThunk(
  "auth/changeMyProfilePicture",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await changeMyProfileService(formData);

      await dispatch(getMyInfo())

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const getMyInfo = createAsyncThunk(
  "auth/getMyInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyInfoService();
      return response.data.data;
    }
    catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Slice
const savedUser = getLocalstorageUserData();

const initialState = {
  savedUser: savedUser || null,
  userData: {
    avatar_path: savedUser?.user?.avatar_path || null,
    username: savedUser?.user?.username || null,
    fullname: `${savedUser?.user?.first_name} ${savedUser?.user?.last_name}`,
    email: savedUser?.user?.email || null,
    token: savedUser?.token || null,
    refreshToken: savedUser?.refresh_token || null,
    expireAt: savedUser?.expired_at || null,
    refreshTokenExpireAt: savedUser?.refresh_expired_at || null,
    roles: savedUser?.user?.roles || null,
    roleIds: savedUser?.user?.roles?.filter((r) => r.id) || null,
    permissions: getPermissionNames(savedUser),
    isUsedRefreshToken: false,
  },
  myInfo: null,
  errorMessage: "",
  successMessage: "",
  loading: false,
};

const resetStateUserData = {
  username: null,
  fullname: null,
  email: null,
  token: null,
  refreshToken: null,
  expireAt: null,
  refreshTokenExpireAt: null,
  roles: null,
  roleIds: null,
  permissions: [],
  isUsedRefreshToken: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuth(state) {
      state.savedUser = null;
      state.userData = resetStateUserData;
      state.errorMessage = "";
      state.successMessage = "";
      state.loading = false;
    },
    toggleLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.savedUser = action.payload;
        state.userData.avatar_path = action.payload.user.avatar_path;
        state.userData.username = action.payload.user.username;
        state.userData.fullname = `${action.payload.user.first_name} ${action.payload.user.last_name}`;
        state.userData.email = action.payload.user.email;
        state.userData.token = action.payload.token;
        state.userData.refreshToken = action.payload.refresh_token;
        state.userData.expireAt = action.payload.expired_at;
        state.userData.refreshTokenExpireAt = action.payload.refresh_expired_at;
        state.userData.roles = action.payload.user.roles;
        state.userData.roleIds = action.payload.user.roles?.filter((r) => r.id);
        state.userData.permissions = getPermissionNames(action.payload);
        state.errorMessage = "";
        state.successMessage = "Login Successfully Completed";
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.errorMessage = action.payload || "Login Failed";
        state.successMessage = "";
        state.loading = false;
      })
      // logoutUser
      .addCase(logoutUser.pending, (state, action) => {
        state.errorMessage = "";
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.errorMessage = "";
        state.successMessage = "Logout Successfully Completed";
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.errorMessage = action.payload || "Logout Failed";
        state.successMessage = "";
        state.loading = false;
      })
      // changeMyPassword
      .addCase(changeMyPassword.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
      })
      .addCase(changeMyPassword.fulfilled, (state, action) => {
        state.errorMessage = "";
        state.successMessage = "Change password Successfully Completed";
        state.loading = false;
      })
      .addCase(changeMyPassword.rejected, (state, action) => {
        state.errorMessage = action.payload || "Change Password Failed";
        state.successMessage = "";
        state.loading = false;
      })
      // changeMyProfilePicture
      .addCase(changeMyProfilePicture.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
      })
      .addCase(changeMyProfilePicture.fulfilled, (state, action) => {
        state.errorMessage = "";
        state.successMessage = "Change profile picture Successfully Completed";
        state.loading = false;
      })
      .addCase(changeMyProfilePicture.rejected, (state, action) => {
        state.errorMessage = action.payload || "Change Profile Picture Failed";
        state.successMessage = "";
        state.loading = false;
      })
      // getMyInfo
      .addCase(getMyInfo.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
      })
      .addCase(getMyInfo.fulfilled, (state, action) => {
        const savedUser = getLocalstorageUserData();
        savedUser.user.avatar_path = action.payload.avatar_path;
        console.log('action.payload.avatar_path :', action.payload.avatar_path);
        saveTokenInLocalStorage(savedUser);
        state.myInfo = action.payload;
        state.userData.avatar_path = action.payload.avatar_path;
        state.errorMessage = "";
        state.successMessage = "Get My Info Successfully Completed";
        state.loading = false;
      })
      .addCase(getMyInfo.rejected, (state, action) => {
        state.errorMessage = action.payload || "Get My Info Failed";
        state.successMessage = "";
        state.loading = false;
      })
  },
});

// Selector
export const selectUserData = (state) => state.auth?.userData;
export const selectMyInfo = (state) => state.auth?.myInfo;
export const selectProfilePath = (state) => state.auth?.userData?.avatar_path;
export const selectSavedUser = (state) => state.auth?.savedUser;
export const selectUsername = (state) => state.auth?.userData?.username;
export const selectFullname = (state) => state.auth?.userData?.fullname;
export const selectEmail = (state) => state.auth?.userData?.email;
export const selectToken = (state) => state.auth?.userData?.token;
export const selectRoles = (state) => state.auth?.userData?.roles;
export const selectRoleIds = (state) => state.auth?.userData?.roleIds;
export const selectPermissions = (state) => state.auth?.userData?.permissions;
export const selectIsAuthenticated = (state) => !!state?.auth?.userData?.token;
export const selectErrorMessage = (state) => state.auth?.errorMessage;
export const selectSuccessMessage = (state) => state.auth?.successMessage;
export const selectLoading = (state) => state.auth?.loading;

// Export actions + reducer
export const { resetAuth, toggleLoading } = authSlice.actions;
export default authSlice.reducer;
