'use client';

import { motion } from 'framer-motion';
import useAuth from '@/hooks/useAuth';
import {
  HiOutlineCube,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
} from 'react-icons/hi';

const quickActions = [
  { label: 'প্যাকেজ ব্রাউজ', href: '/teacher/packages', icon: HiOutlineCube, color: 'bg-primary-50 text-primary-600' },
  { label: 'আমার কন্টেন্ট', href: '/teacher/my-content', icon: HiOutlineBookOpen, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'প্রশ্ন সেট তৈরি', href: '/teacher/question-sets/create', icon: HiOutlineClipboardList, color: 'bg-amber-50 text-amber-600' },
  { label: 'OMR শিট তৈরি', href: '/teacher/omr/create', icon: HiOutlineDocumentText, color: 'bg-violet-50 text-violet-600' },
];

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">
          স্বাগতম, {user?.name || 'শিক্ষক'}! 👋
        </h1>
        <p className="text-sm text-neutral-500 mt-1">আপনার ড্যাশবোর্ড</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.a
              key={action.label}
              href={action.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className={`h-11 w-11 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-neutral-800">{action.label}</p>
            </motion.a>
          );
        })}
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">আমার প্যাকেজ</h2>
          <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">
            প্যাকেজ কিনলে এখানে দেখাবে
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">সাম্প্রতিক প্রশ্ন সেট</h2>
          <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">
            প্রশ্ন সেট তৈরি করলে এখানে দেখাবে
          </div>
        </div>
      </div>
    </div>
  );
}
