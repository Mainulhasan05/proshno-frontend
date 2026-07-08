import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// ══════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════

export const fetchTeacherDashboardStats = createAsyncThunk('teacher/fetchDashboardStats', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teacher/dashboard/stats');
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch dashboard stats');
  }
});

// ══════════════════════════════════════
//  PACKAGES
// ══════════════════════════════════════

export const fetchAvailablePackages = createAsyncThunk('teacher/fetchAvailablePackages', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teacher/packages');
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch packages');
  }
});

export const fetchPackageDetail = createAsyncThunk('teacher/fetchPackageDetail', async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/teacher/packages/${id}`);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch package detail');
  }
});

// ══════════════════════════════════════
//  PURCHASES
// ══════════════════════════════════════

export const createPurchase = createAsyncThunk('teacher/createPurchase', async (body, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/teacher/purchases', body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to create purchase');
  }
});

export const fetchMyPurchases = createAsyncThunk('teacher/fetchMyPurchases', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teacher/purchases', { params });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch purchases');
  }
});

// ══════════════════════════════════════
//  CONTENT (Entitlement-filtered)
// ══════════════════════════════════════

export const fetchTeacherClasses = createAsyncThunk('teacher/fetchClasses', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teacher/content/classes');
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch classes');
  }
});

export const fetchTeacherVersions = createAsyncThunk('teacher/fetchVersions', async (classId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teacher/content/versions', { params: { classId } });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch versions');
  }
});

export const fetchTeacherSubjects = createAsyncThunk('teacher/fetchSubjects', async ({ classId, versionId } = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teacher/content/subjects', { params: { classId, versionId } });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch subjects');
  }
});

export const fetchTeacherChapters = createAsyncThunk('teacher/fetchChapters', async (subjectId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teacher/content/chapters', { params: { subjectId } });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch chapters');
  }
});

export const fetchTeacherQuestions = createAsyncThunk('teacher/fetchQuestions', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teacher/content/questions', { params });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch questions');
  }
});

// ══════════════════════════════════════
//  QUESTION SETS
// ══════════════════════════════════════

export const fetchQuestionSets = createAsyncThunk('teacher/fetchQuestionSets', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teacher/question-sets', { params });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch question sets');
  }
});

export const fetchQuestionSetDetail = createAsyncThunk('teacher/fetchQuestionSetDetail', async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/teacher/question-sets/${id}`);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch question set');
  }
});

export const createQuestionSet = createAsyncThunk('teacher/createQuestionSet', async (body, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/teacher/question-sets', body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to create question set');
  }
});

export const updateQuestionSet = createAsyncThunk('teacher/updateQuestionSet', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/teacher/question-sets/${id}`, body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to update question set');
  }
});

export const deleteQuestionSet = createAsyncThunk('teacher/deleteQuestionSet', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/teacher/question-sets/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to delete question set');
  }
});

// ══════════════════════════════════════
//  STUDENTS
// ══════════════════════════════════════

export const fetchStudents = createAsyncThunk('teacher/fetchStudents', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/teacher/students', { params });
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to fetch students');
  }
});

export const createStudent = createAsyncThunk('teacher/createStudent', async (body, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/teacher/students', body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to create student');
  }
});

export const updateStudent = createAsyncThunk('teacher/updateStudent', async ({ id, body }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/teacher/students/${id}`, body);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to update student');
  }
});

export const toggleStudentActive = createAsyncThunk('teacher/toggleStudentActive', async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/teacher/students/${id}/toggle`);
    return response;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to toggle student');
  }
});

export const deleteStudent = createAsyncThunk('teacher/deleteStudent', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/teacher/students/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err?.error?.message || 'Failed to delete student');
  }
});

// ══════════════════════════════════════
//  SLICE
// ══════════════════════════════════════

const teacherSlice = createSlice({
  name: 'teacher',
  initialState: {
    dashboardStats: null,
    packages: [],
    purchases: [],
    content: {
      classes: [],
      versions: [],
      subjects: [],
      chapters: [],
      questions: [],
      questionsPagination: null,
    },
    questionSets: [],
    questionSetDetail: null,
    students: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearTeacherError: (state) => { state.error = null; },
    clearContent: (state) => {
      state.content.versions = [];
      state.content.subjects = [];
      state.content.chapters = [];
      state.content.questions = [];
      state.content.questionsPagination = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.isLoading = true; state.error = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      // Dashboard
      .addCase(fetchTeacherDashboardStats.pending, pending)
      .addCase(fetchTeacherDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload.data;
      })
      .addCase(fetchTeacherDashboardStats.rejected, rejected)

      // Packages
      .addCase(fetchAvailablePackages.pending, pending)
      .addCase(fetchAvailablePackages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.packages = action.payload.data;
      })
      .addCase(fetchAvailablePackages.rejected, rejected)

      // Purchases
      .addCase(fetchMyPurchases.pending, pending)
      .addCase(fetchMyPurchases.fulfilled, (state, action) => {
        state.isLoading = false;
        state.purchases = action.payload.data;
      })
      .addCase(fetchMyPurchases.rejected, rejected)
      .addCase(createPurchase.fulfilled, (state) => {
        // Refresh packages to show updated purchase status
        state.isLoading = false;
      })

      // Content
      .addCase(fetchTeacherClasses.pending, pending)
      .addCase(fetchTeacherClasses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.content.classes = action.payload.data;
      })
      .addCase(fetchTeacherClasses.rejected, rejected)
      .addCase(fetchTeacherVersions.fulfilled, (state, action) => {
        state.content.versions = action.payload.data;
      })
      .addCase(fetchTeacherSubjects.fulfilled, (state, action) => {
        state.content.subjects = action.payload.data;
      })
      .addCase(fetchTeacherChapters.fulfilled, (state, action) => {
        state.content.chapters = action.payload.data;
      })
      .addCase(fetchTeacherQuestions.pending, pending)
      .addCase(fetchTeacherQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.content.questions = action.payload.data;
        state.content.questionsPagination = action.payload.meta;
      })
      .addCase(fetchTeacherQuestions.rejected, rejected)

      // Question Sets
      .addCase(fetchQuestionSets.pending, pending)
      .addCase(fetchQuestionSets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questionSets = action.payload.data;
      })
      .addCase(fetchQuestionSets.rejected, rejected)
      .addCase(fetchQuestionSetDetail.fulfilled, (state, action) => {
        state.questionSetDetail = action.payload.data;
      })
      .addCase(createQuestionSet.fulfilled, (state, action) => {
        state.questionSets.unshift(action.payload.data);
      })
      .addCase(updateQuestionSet.fulfilled, (state, action) => {
        const idx = state.questionSets.findIndex((qs) => qs._id === action.payload.data._id);
        if (idx !== -1) state.questionSets[idx] = action.payload.data;
      })
      .addCase(deleteQuestionSet.fulfilled, (state, action) => {
        state.questionSets = state.questionSets.filter((qs) => qs._id !== action.payload);
      })

      // Students
      .addCase(fetchStudents.pending, pending)
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload.data;
      })
      .addCase(fetchStudents.rejected, rejected)
      .addCase(createStudent.fulfilled, (state, action) => {
        state.students.unshift(action.payload.data);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const idx = state.students.findIndex((s) => s._id === action.payload.data._id);
        if (idx !== -1) state.students[idx] = action.payload.data;
      })
      .addCase(toggleStudentActive.fulfilled, (state, action) => {
        const idx = state.students.findIndex((s) => s._id === action.payload.data._id);
        if (idx !== -1) state.students[idx] = action.payload.data;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter((s) => s._id !== action.payload);
      });
  },
});

export const { clearTeacherError, clearContent } = teacherSlice.actions;
export default teacherSlice.reducer;
