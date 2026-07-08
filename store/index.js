import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import hierarchyReducer from './slices/hierarchySlice';
import questionReducer from './slices/questionSlice';
import adminReducer from './slices/adminSlice';
import teacherReducer from './slices/teacherSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    hierarchy: hierarchyReducer,
    questions: questionReducer,
    admin: adminReducer,
    teacher: teacherReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

