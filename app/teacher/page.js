'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import { fetchTeacherDashboardStats } from '@/store/slices/teacherSlice';
import Skeleton from '@/components/ui/Skeleton';
import {
  HiOutlineCube,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from 'react-icons/hi';

const quickActions = [
  { label: 'প্যাকেজ ব্রাউজ', href: '/teacher/packages', icon: HiOutlineCube, color: 'from-indigo-500 to-purple-600' },
  { label: 'আমার কন্টেন্ট', href: '/teacher/my-content', icon: HiOutlineBookOpen, color: 'from-emerald-500 to-teal-600' },
  { label: 'প্রশ্ন সেট তৈরি', href: '/teacher/question-sets', icon: HiOutlineClipboardList, color: 'from-amber-500 to-orange-600' },
  { label: 'OMR শিট', href: '/teacher/omr', icon: HiOutlineDocumentText, color: 'from-violet-500 to-fuchsia-600' },
];

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
  refunded: 'bg-neutral-100 text-neutral-600',
};

const statusLabels = {
  pending: 'অপেক্ষমান',
  completed: 'সম্পন্ন',
  failed: 'ব্যর্থ',
  refunded: 'ফেরত',
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { dashboardStats, isLoading } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(fetchTeacherDashboardStats());
  }, [dispatch]);

  const stats = dashboardStats;

  const statCards = [
    { label: 'সক্রিয় প্যাকেজ', value: stats?.activePurchases ?? '—', icon: HiOutlineCheckCircle, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'অপেক্ষমান ক্রয়', value: stats?.pendingPurchases ?? '—', icon: HiOutlineClock, gradient: 'from-amber-500 to-orange-500' },
    { label: 'প্রশ্ন সেট', value: stats?.totalQuestionSets ?? '—', icon: HiOutlineClipboardList, gradient: 'from-indigo-500 to-purple-500' },
    { label: 'শিক্ষার্থী', value: stats?.totalStudents ?? '—', icon: HiOutlineUsers, gradient: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">
          স্বাগতম, {user?.name || 'শিক্ষক'}! 👋
        </h1>
        <p className="text-sm text-neutral-500 mt-1">আপনার ড্যাশবোর্ড</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative overflow-hidden bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-lg transition-shadow"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-[40px]`} />
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mb-1" />
              ) : (
                <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
              )}
              <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Link
                href={action.href}
                className="block bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className={`h-11 w-11 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-neutral-800">{action.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-neutral-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-800">সাম্প্রতিক ক্রয়</h2>
            <Link href="/teacher/purchases" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              সব দেখুন →
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : stats?.recentPurchases?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPurchases.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">
                      {p.packageId?.name || 'প্যাকেজ'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      ৳{p.finalAmount} • {new Date(p.createdAt).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[p.status] || 'bg-neutral-100 text-neutral-600'}`}>
                    {statusLabels[p.status] || p.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-neutral-400">
              <HiOutlineShoppingCart className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">কোনো ক্রয় নেই</p>
              <Link href="/teacher/packages" className="text-xs text-primary-600 mt-1">
                প্যাকেজ ব্রাউজ করুন →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Question Sets */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-neutral-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-800">সাম্প্রতিক প্রশ্ন সেট</h2>
            <Link href="/teacher/question-sets" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              সব দেখুন →
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : stats?.recentQuestionSets?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentQuestionSets.map((qs) => (
                <div key={qs._id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{qs.name}</p>
                    <p className="text-xs text-neutral-500">
                      {qs.totalQuestions} প্রশ্ন • {qs.totalMarks} নম্বর
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(qs.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-neutral-400">
              <HiOutlineClipboardList className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">কোনো প্রশ্ন সেট নেই</p>
              <Link href="/teacher/question-sets" className="text-xs text-primary-600 mt-1">
                প্রশ্ন সেট তৈরি করুন →
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
