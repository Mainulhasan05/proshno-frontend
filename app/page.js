'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiOutlineAcademicCap, HiOutlineArrowRight } from 'react-icons/hi';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      const panelMap = { admin: '/admin', teacher: '/teacher', student: '/student' };
      router.replace(panelMap[user.role] || '/login');
    }
  }, [isInitialized, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <HiOutlineAcademicCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">প্রশ্ন</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            লগইন
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium text-primary-800 bg-white rounded-lg hover:bg-white/90 transition-colors"
          >
            রেজিস্ট্রেশন
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            শিক্ষার নতুন দিগন্ত{' '}
            <span className="text-primary-200">প্রশ্ন</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-200/80 mb-10 leading-relaxed">
            প্রশ্ন ব্যাংক তৈরি করুন, প্যাকেজ কিনুন, OMR শিট জেনারেট করুন — সব এক প্ল্যাটফর্মে।
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-primary-800 bg-white rounded-xl hover:bg-white/90 transition-all shadow-lg shadow-black/10"
            >
              শুরু করুন
              <HiOutlineArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all"
            >
              লগইন করুন
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-sm text-primary-300/60">
        © ২০২৬ প্রশ্ন EdTech Platform
      </footer>
    </div>
  );
}
