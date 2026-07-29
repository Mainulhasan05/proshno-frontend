'use client';

import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function TeacherLayout({ children }) {
  return (
    <ProtectedRoute role="teacher">
      <div className="flex min-h-screen bg-neutral-50 print:bg-white print:min-h-0">
        <div className="no-print print:hidden shrink-0">
          <Sidebar role="teacher" />
        </div>
        <div className="flex-1 flex flex-col min-w-0 print:block">
          <div className="no-print print:hidden">
            <Header />
          </div>
          <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 print:p-0 print:m-0 print:pb-0">
            {children}
          </main>
        </div>
        <div className="no-print print:hidden">
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}
