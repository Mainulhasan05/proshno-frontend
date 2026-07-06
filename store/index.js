import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    // Phase 1+: hierarchySlice, questionSlice, packageSlice, etc.
  },
  devTools: process.env.NODE_ENV !== 'production',
});
