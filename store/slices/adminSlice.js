import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// ══════════════════════════════════════
//  PACKAGES
// ══════════════════════════════════════

export const fetchPackages = createAsyncThunk('admin/fetchPackages', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/packages', { params: { includeInactive: 'true', ...params } });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch packages');
  }
});

export const createPackage = createAsyncThunk('admin/createPackage', async (body, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/packages', body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to create package');
  }
});

export const updatePackage = createAsyncThunk('admin/updatePackage', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/packages/${id}`, body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to update package');
  }
});

export const togglePackageActive = createAsyncThunk('admin/togglePackageActive', async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/packages/${id}/toggle`);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to toggle package');
  }
});

export const deletePackage = createAsyncThunk('admin/deletePackage', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/packages/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to delete package');
  }
});

// ══════════════════════════════════════
//  TEACHERS
// ══════════════════════════════════════

export const fetchTeachers = createAsyncThunk('admin/fetchTeachers', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teachers', { params });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch teachers');
  }
});

export const toggleTeacherActive = createAsyncThunk('admin/toggleTeacherActive', async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/teachers/${id}/toggle`);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to toggle teacher');
  }
});

// ══════════════════════════════════════
//  PURCHASES
// ══════════════════════════════════════

export const fetchPurchases = createAsyncThunk('admin/fetchPurchases', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/purchases', { params });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch purchases');
  }
});

export const updatePurchaseStatus = createAsyncThunk('admin/updatePurchaseStatus', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/purchases/${id}/status`, body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to update purchase status');
  }
});

// ══════════════════════════════════════
//  OMR TEMPLATES
// ══════════════════════════════════════

export const fetchOMRTemplates = createAsyncThunk('admin/fetchOMRTemplates', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/omr-templates', { params: { includeInactive: 'true', ...params } });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch OMR templates');
  }
});

export const createOMRTemplate = createAsyncThunk('admin/createOMRTemplate', async (body, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/omr-templates', body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to create OMR template');
  }
});

export const updateOMRTemplate = createAsyncThunk('admin/updateOMRTemplate', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/omr-templates/${id}`, body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to update OMR template');
  }
});

export const toggleOMRTemplateActive = createAsyncThunk('admin/toggleOMRTemplateActive', async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/omr-templates/${id}/toggle`);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to toggle OMR template');
  }
});

export const deleteOMRTemplate = createAsyncThunk('admin/deleteOMRTemplate', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/omr-templates/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to delete OMR template');
  }
});

// ══════════════════════════════════════
//  PAGES (CMS)
// ══════════════════════════════════════

export const fetchPages = createAsyncThunk('admin/fetchPages', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/pages', { params });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch pages');
  }
});

export const createPage = createAsyncThunk('admin/createPage', async (body, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/pages', body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to create page');
  }
});

export const updatePage = createAsyncThunk('admin/updatePage', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/pages/${id}`, body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to update page');
  }
});

export const togglePagePublish = createAsyncThunk('admin/togglePagePublish', async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/pages/${id}/publish`);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to toggle page publish');
  }
});

export const deletePage = createAsyncThunk('admin/deletePage', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/pages/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to delete page');
  }
});

// ══════════════════════════════════════
//  SLICE
// ══════════════════════════════════════

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    packages: [],
    teachers: [],
    purchases: [],
    omrTemplates: [],
    pages: [],
    pagination: {},
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.isLoading = true; state.error = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      // Packages
      .addCase(fetchPackages.pending, pending)
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.packages = action.payload.data;
        (state.pagination ||= {});
        state.pagination.packages = action.payload.meta;
      })
      .addCase(fetchPackages.rejected, rejected)
      .addCase(createPackage.fulfilled, (state, action) => {
        state.packages.unshift(action.payload.data);
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        const idx = state.packages.findIndex((p) => p._id === action.payload.data._id);
        if (idx !== -1) state.packages[idx] = action.payload.data;
      })
      .addCase(togglePackageActive.fulfilled, (state, action) => {
        const idx = state.packages.findIndex((p) => p._id === action.payload.data._id);
        if (idx !== -1) state.packages[idx] = action.payload.data;
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.packages = state.packages.filter((p) => p._id !== action.payload);
      })

      // Teachers
      .addCase(fetchTeachers.pending, pending)
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = action.payload.data;
        (state.pagination ||= {});
        state.pagination.teachers = action.payload.meta;
      })
      .addCase(fetchTeachers.rejected, rejected)
      .addCase(toggleTeacherActive.fulfilled, (state, action) => {
        const idx = state.teachers.findIndex((t) => t._id === action.payload.data._id);
        if (idx !== -1) state.teachers[idx] = action.payload.data;
      })

      // Purchases
      .addCase(fetchPurchases.pending, pending)
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.isLoading = false;
        state.purchases = action.payload.data;
        (state.pagination ||= {});
        state.pagination.purchases = action.payload.meta;
      })
      .addCase(fetchPurchases.rejected, rejected)
      .addCase(updatePurchaseStatus.fulfilled, (state, action) => {
        const idx = state.purchases.findIndex((p) => p._id === action.payload.data._id);
        if (idx !== -1) state.purchases[idx] = action.payload.data;
      })

      // OMR Templates
      .addCase(fetchOMRTemplates.pending, pending)
      .addCase(fetchOMRTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.omrTemplates = action.payload.data;
        (state.pagination ||= {});
        state.pagination.omrTemplates = action.payload.meta;
      })
      .addCase(fetchOMRTemplates.rejected, rejected)
      .addCase(createOMRTemplate.fulfilled, (state, action) => {
        state.omrTemplates.unshift(action.payload.data);
      })
      .addCase(updateOMRTemplate.fulfilled, (state, action) => {
        const idx = state.omrTemplates.findIndex((t) => t._id === action.payload.data._id);
        if (idx !== -1) state.omrTemplates[idx] = action.payload.data;
      })
      .addCase(toggleOMRTemplateActive.fulfilled, (state, action) => {
        const idx = state.omrTemplates.findIndex((t) => t._id === action.payload.data._id);
        if (idx !== -1) state.omrTemplates[idx] = action.payload.data;
      })
      .addCase(deleteOMRTemplate.fulfilled, (state, action) => {
        state.omrTemplates = state.omrTemplates.filter((t) => t._id !== action.payload);
      })

      // Pages
      .addCase(fetchPages.pending, pending)
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pages = action.payload.data;
        (state.pagination ||= {});
        state.pagination.pages = action.payload.meta;
      })
      .addCase(fetchPages.rejected, rejected)
      .addCase(createPage.fulfilled, (state, action) => {
        state.pages.unshift(action.payload.data);
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        const idx = state.pages.findIndex((p) => p._id === action.payload.data._id);
        if (idx !== -1) state.pages[idx] = action.payload.data;
      })
      .addCase(togglePagePublish.fulfilled, (state, action) => {
        const idx = state.pages.findIndex((p) => p._id === action.payload.data._id);
        if (idx !== -1) state.pages[idx] = action.payload.data;
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.pages = state.pages.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
