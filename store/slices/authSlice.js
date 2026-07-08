import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// --- Async Thunks ---

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('sessionType', 'user');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || { message: 'Login failed' });
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('sessionType', 'user');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || { message: 'Registration failed' });
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || { message: 'Failed to fetch profile' });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const endpoint = user?.role === 'admin' ? '/admin-auth/logout' : '/auth/logout';
      await apiClient.post(endpoint);
      localStorage.removeItem('accessToken');
      return null;
    } catch (error) {
      localStorage.removeItem('accessToken');
      return rejectWithValue(error.error || { message: 'Logout failed' });
    }
  }
);

// Admin-specific thunks
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/admin-auth/login', credentials);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('sessionType', 'admin');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || { message: 'Login failed' });
    }
  }
);

export const adminFetchProfile = createAsyncThunk(
  'auth/adminFetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin-auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || { message: 'Failed to fetch profile' });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      return rejectWithValue(error.error || { message: 'Failed to send reset email' });
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, newPassword });
      return response;
    } catch (error) {
      return rejectWithValue(error.error || { message: 'Failed to reset password' });
    }
  }
);

// --- Slice ---

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      });

    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });

    // Admin Login
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload.admin, role: 'admin' };
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      });

    // Admin Fetch Profile
    builder
      .addCase(adminFetchProfile.fulfilled, (state, action) => {
        state.user = { ...action.payload.data, role: 'admin' };
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(adminFetchProfile.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
