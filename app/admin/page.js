'use client';

import { motion } from 'framer-motion';
import {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineQuestionMarkCircle,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShoppingCart,
} from 'react-icons/hi';

import { useState, useEffect } from 'react';
import apiClient from '@/store/api/apiClient';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    classes: '—',
    subjects: '—',
    questions: '—',
    packages: '—',
    teachers: '—',
    purchases: '—',
  });

  useEffect(() => {
    let active = true;
    apiClient.get('/admin-auth/dashboard-stats')
      .then((res) => {
        if (active && res.success) {
          setCounts(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard stats:', err);
      });
    return () => { active = false; };
  }, []);

  const statsList = [
    { label: 'ক্লাস', value: counts.classes, icon: HiOutlineAcademicCap, color: 'bg-primary-50 text-primary-600' },
    { label: 'বিষয়', value: counts.subjects, icon: HiOutlineBookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'প্রশ্ন', value: counts.questions, icon: HiOutlineQuestionMarkCircle, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'প্যাকেজ', value: counts.packages, icon: HiOutlineCube, color: 'bg-amber-50 text-amber-600' },
    { label: 'শিক্ষক', value: counts.teachers, icon: HiOutlineUsers, color: 'bg-violet-50 text-violet-600' },
    { label: 'ক্রয়', value: counts.purchases, icon: HiOutlineShoppingCart, color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">ড্যাশবোর্ড</h1>
        <p className="text-sm text-neutral-500 mt-1">প্ল্যাটফর্মের সামগ্রিক অবস্থা</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statsList.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">সাম্প্রতিক ক্রয়</h2>
          <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">
            Phase 3 এ ডাটা আসবে
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">নতুন শিক্ষক</h2>
          <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">
            Phase 3 এ ডাটা আসবে
          </div>
        </div>
      </div>
    </div>
  );
}
