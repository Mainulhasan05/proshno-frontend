'use client';

import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, adminFetchProfile, logoutUser, clearError } from '@/store/slices/authSlice';

export default function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, isInitialized, error } = useSelector(
    (state) => state.auth
  );

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const sessionType = localStorage.getItem('sessionType');
      if (token) {
        if (sessionType === 'admin') {
          dispatch(adminFetchProfile());
        } else {
          dispatch(fetchProfile());
        }
      } else {
        // No token — mark as initialized (not authenticated)
        dispatch({ type: 'auth/fetchProfile/rejected' });
      }
    }
  }, [dispatch, isInitialized]);

  const logout = useCallback(() => {
    dispatch(logoutUser()).then(() => {
      localStorage.removeItem('sessionType');
    });
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    logout,
    clearAuthError,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  };
}
