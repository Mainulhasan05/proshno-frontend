'use client';

import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen bg-[#F6F8F6]">
        <Sidebar role="admin" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-x-hidden p-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-5 lg:p-7">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
