import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// ── Thunks ──

export const fetchClasses = createAsyncThunk('hierarchy/fetchClasses', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/hierarchy/classes', { params: { includeInactive: 'true', ...params } });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch classes');
  }
});

export const createClass = createAsyncThunk('hierarchy/createClass', async (body, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/hierarchy/classes', body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create class');
  }
});

export const updateClass = createAsyncThunk('hierarchy/updateClass', async ({ id, body }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.put(`/hierarchy/classes/${id}`, body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update class');
  }
});

export const toggleClassActive = createAsyncThunk('hierarchy/toggleClassActive', async (id, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.patch(`/hierarchy/classes/${id}/toggle`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle class');
  }
});

export const deleteClass = createAsyncThunk('hierarchy/deleteClass', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/hierarchy/classes/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete class');
  }
});

// ── Versions ──

export const fetchVersions = createAsyncThunk('hierarchy/fetchVersions', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/hierarchy/versions', { params: { includeInactive: 'true', ...params } });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch versions');
  }
});

export const createVersion = createAsyncThunk('hierarchy/createVersion', async (body, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/hierarchy/versions', body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create version');
  }
});

export const updateVersion = createAsyncThunk('hierarchy/updateVersion', async ({ id, body }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.put(`/hierarchy/versions/${id}`, body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update version');
  }
});

export const toggleVersionActive = createAsyncThunk('hierarchy/toggleVersionActive', async (id, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.patch(`/hierarchy/versions/${id}/toggle`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle version');
  }
});

export const deleteVersion = createAsyncThunk('hierarchy/deleteVersion', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/hierarchy/versions/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete version');
  }
});

// ── Subjects ──

export const fetchSubjects = createAsyncThunk('hierarchy/fetchSubjects', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/hierarchy/subjects', { params: { includeInactive: 'true', ...params } });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch subjects');
  }
});

export const createSubject = createAsyncThunk('hierarchy/createSubject', async (body, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/hierarchy/subjects', body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create subject');
  }
});

export const updateSubject = createAsyncThunk('hierarchy/updateSubject', async ({ id, body }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.put(`/hierarchy/subjects/${id}`, body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update subject');
  }
});

export const toggleSubjectActive = createAsyncThunk('hierarchy/toggleSubjectActive', async (id, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.patch(`/hierarchy/subjects/${id}/toggle`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle subject');
  }
});

export const deleteSubject = createAsyncThunk('hierarchy/deleteSubject', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/hierarchy/subjects/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete subject');
  }
});

// ── Chapters ──

export const fetchChapters = createAsyncThunk('hierarchy/fetchChapters', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/hierarchy/chapters', { params: { includeInactive: 'true', ...params } });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch chapters');
  }
});

export const createChapter = createAsyncThunk('hierarchy/createChapter', async (body, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/hierarchy/chapters', body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create chapter');
  }
});

export const updateChapter = createAsyncThunk('hierarchy/updateChapter', async ({ id, body }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.put(`/hierarchy/chapters/${id}`, body);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update chapter');
  }
});

export const toggleChapterActive = createAsyncThunk('hierarchy/toggleChapterActive', async (id, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.patch(`/hierarchy/chapters/${id}/toggle`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle chapter');
  }
});

export const deleteChapter = createAsyncThunk('hierarchy/deleteChapter', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/hierarchy/chapters/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete chapter');
  }
});

// ── Full Tree ──

export const fetchTree = createAsyncThunk('hierarchy/fetchTree', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/hierarchy/tree', { params: { includeInactive: 'true', ...params } });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch hierarchy');
  }
});

// ── Slice ──

const hierarchySlice = createSlice({
  name: 'hierarchy',
  initialState: {
    classes: [],
    versions: [],
    subjects: [],
    chapters: [],
    tree: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // Helper to set loading/error states
    const pending = (state) => { state.isLoading = true; state.error = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      // Classes
      .addCase(fetchClasses.pending, pending)
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.classes = action.payload.data;
      })
      .addCase(fetchClasses.rejected, rejected)
      .addCase(createClass.fulfilled, (state, action) => {
        state.classes.push(action.payload.data);
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        const idx = state.classes.findIndex((c) => c._id === action.payload.data._id);
        if (idx !== -1) state.classes[idx] = action.payload.data;
      })
      .addCase(toggleClassActive.fulfilled, (state, action) => {
        const idx = state.classes.findIndex((c) => c._id === action.payload.data._id);
        if (idx !== -1) state.classes[idx] = action.payload.data;
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.classes = state.classes.filter((c) => c._id !== action.payload);
      })

      // Versions
      .addCase(fetchVersions.pending, pending)
      .addCase(fetchVersions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.versions = action.payload.data;
      })
      .addCase(fetchVersions.rejected, rejected)
      .addCase(createVersion.fulfilled, (state, action) => {
        state.versions.push(action.payload.data);
      })
      .addCase(updateVersion.fulfilled, (state, action) => {
        const idx = state.versions.findIndex((v) => v._id === action.payload.data._id);
        if (idx !== -1) state.versions[idx] = action.payload.data;
      })
      .addCase(toggleVersionActive.fulfilled, (state, action) => {
        const idx = state.versions.findIndex((v) => v._id === action.payload.data._id);
        if (idx !== -1) state.versions[idx] = action.payload.data;
      })
      .addCase(deleteVersion.fulfilled, (state, action) => {
        state.versions = state.versions.filter((v) => v._id !== action.payload);
      })

      // Subjects
      .addCase(fetchSubjects.pending, pending)
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subjects = action.payload.data;
      })
      .addCase(fetchSubjects.rejected, rejected)
      .addCase(createSubject.fulfilled, (state, action) => {
        state.subjects.push(action.payload.data);
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        const idx = state.subjects.findIndex((s) => s._id === action.payload.data._id);
        if (idx !== -1) state.subjects[idx] = action.payload.data;
      })
      .addCase(toggleSubjectActive.fulfilled, (state, action) => {
        const idx = state.subjects.findIndex((s) => s._id === action.payload.data._id);
        if (idx !== -1) state.subjects[idx] = action.payload.data;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.subjects = state.subjects.filter((s) => s._id !== action.payload);
      })

      // Chapters
      .addCase(fetchChapters.pending, pending)
      .addCase(fetchChapters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chapters = action.payload.data;
      })
      .addCase(fetchChapters.rejected, rejected)
      .addCase(createChapter.fulfilled, (state, action) => {
        state.chapters.push(action.payload.data);
      })
      .addCase(updateChapter.fulfilled, (state, action) => {
        const idx = state.chapters.findIndex((ch) => ch._id === action.payload.data._id);
        if (idx !== -1) state.chapters[idx] = action.payload.data;
      })
      .addCase(toggleChapterActive.fulfilled, (state, action) => {
        const idx = state.chapters.findIndex((ch) => ch._id === action.payload.data._id);
        if (idx !== -1) state.chapters[idx] = action.payload.data;
      })
      .addCase(deleteChapter.fulfilled, (state, action) => {
        state.chapters = state.chapters.filter((ch) => ch._id !== action.payload);
      })

      // Tree
      .addCase(fetchTree.pending, pending)
      .addCase(fetchTree.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tree = action.payload.data;
      })
      .addCase(fetchTree.rejected, rejected);
  },
});

export const { clearError } = hierarchySlice.actions;
export default hierarchySlice.reducer;
