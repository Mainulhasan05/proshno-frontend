'use client';

import { useDispatch } from 'react-redux';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import useAuth from '@/hooks/useAuth';
import { HiOutlineMenuAlt2, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Header() {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roleLabels = {
    admin: 'অ্যাডমিন',
    teacher: 'শিক্ষক',
    student: 'শিক্ষার্থী',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left — hamburger */}
        <button
          onClick={() => dispatch(setSidebarOpen(true))}
          className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
          aria-label="Open menu"
        >
          <HiOutlineMenuAlt2 className="h-5 w-5" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right — user menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-neutral-800 leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-neutral-500">
                {roleLabels[user?.role] || user?.role}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-800">{user?.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href={`/${user?.role}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <HiOutlineUser className="h-4 w-4 text-neutral-400" />
                    প্রোফাইল
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                  >
                    <HiOutlineLogout className="h-4 w-4" />
                    লগ আউট
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
