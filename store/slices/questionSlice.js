import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// ── Thunks ──

export const fetchQuestions = createAsyncThunk('questions/fetchQuestions', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/questions', { params: { includeInactive: 'true', ...params } });
    return response;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch questions');
  }
});

export const createQuestion = createAsyncThunk('questions/createQuestion', async (body, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/questions', body);
    return response;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create question');
  }
});

export const bulkImportQuestions = createAsyncThunk('questions/bulkImportQuestions', async (body, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/questions/bulk-import', body);
    return response;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to bulk import questions');
  }
});

export const updateQuestion = createAsyncThunk('questions/updateQuestion', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/questions/${id}`, body);
    return response;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update question');
  }
});

export const toggleQuestionActive = createAsyncThunk('questions/toggleQuestionActive', async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/questions/${id}/toggle`);
    return response;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle question');
  }
});

export const deleteQuestion = createAsyncThunk('questions/deleteQuestion', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/questions/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete question');
  }
});

export const fetchQuestionStats = createAsyncThunk('questions/fetchStats', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/questions/stats', { params });
    return response;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
  }
});

// ── Slice ──

const questionSlice = createSlice({
  name: 'questions',
  initialState: {
    questions: [],
    pagination: null,
    stats: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.isLoading = true; state.error = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(fetchQuestions.pending, pending)
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchQuestions.rejected, rejected)
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.questions.unshift(action.payload.data);
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const idx = state.questions.findIndex((q) => q._id === action.payload.data._id);
        if (idx !== -1) state.questions[idx] = action.payload.data;
      })
      .addCase(toggleQuestionActive.fulfilled, (state, action) => {
        const idx = state.questions.findIndex((q) => q._id === action.payload.data._id);
        if (idx !== -1) state.questions[idx] = action.payload.data;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter((q) => q._id !== action.payload);
      })
      .addCase(fetchQuestionStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      });
  },
});

export const { clearError } = questionSlice.actions;
export default questionSlice.reducer;
