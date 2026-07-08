'use client';

import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function TeacherLayout({ children }) {
  return (
    <ProtectedRoute role="teacher">
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar role="teacher" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          {/* pb-20 on mobile to account for bottom nav height */}
          <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
            {children}
          </main>
        </div>
        {/* Mobile bottom navigation — only visible on small screens */}
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
