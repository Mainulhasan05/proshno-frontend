'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

/**
 * Protects a route by role. Redirects unauthenticated users to /login.
 * Usage: wrap page content — <ProtectedRoute role="admin">...</ProtectedRoute>
 */
export default function ProtectedRoute({ children, role }) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      // Admin routes redirect to hidden admin login, others to public login
      const loginPath = role === 'admin' ? '/portal/k7x9m2p4' : '/login';
      router.replace(loginPath);
      return;
    }

    if (role && user?.role !== role) {
      // Redirect to the user's own panel
      const panelMap = { admin: '/admin', teacher: '/teacher', student: '/student' };
      router.replace(panelMap[user?.role] || '/login');
    }
  }, [isAuthenticated, isInitialized, user, role, router]);

  // Show nothing while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or wrong role
  if (!isAuthenticated) return null;
  if (role && user?.role !== role) return null;

  return children;
}
