'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MotionConfig, motion } from 'framer-motion';
import {
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
  HiOutlineBookOpen,
  HiOutlineCube,
  HiOutlineQuestionMarkCircle,
  HiOutlineRefresh,
  HiOutlineShoppingCart,
  HiOutlineUsers,
} from 'react-icons/hi';
import apiClient from '@/store/api/apiClient';

const statDefinitions = [
  { key: 'classes', label: 'ক্লাস', href: '/admin/classes', icon: HiOutlineAcademicCap, color: 'bg-emerald-50 text-emerald-700' },
  { key: 'subjects', label: 'বিষয়', href: '/admin/subjects', icon: HiOutlineBookOpen, color: 'bg-sky-50 text-sky-700' },
  { key: 'questions', label: 'প্রশ্ন', href: '/admin/questions', icon: HiOutlineQuestionMarkCircle, color: 'bg-teal-50 text-teal-700' },
  { key: 'packages', label: 'প্যাকেজ', href: '/admin/packages', icon: HiOutlineCube, color: 'bg-amber-50 text-amber-700' },
  { key: 'teachers', label: 'শিক্ষক', href: '/admin/teachers', icon: HiOutlineUsers, color: 'bg-violet-50 text-violet-700' },
  { key: 'purchases', label: 'ক্রয়', href: '/admin/purchases', icon: HiOutlineShoppingCart, color: 'bg-rose-50 text-rose-700' },
];

const workflows = [
  { title: 'কনটেন্ট সাজান', description: 'ক্লাস, বিষয় ও অধ্যায় পরিচালনা করুন', href: '/admin/classes', icon: HiOutlineBookOpen },
  { title: 'প্রশ্ন যোগ করুন', description: 'প্রশ্নব্যাংক তৈরি ও মান যাচাই করুন', href: '/admin/questions', icon: HiOutlineQuestionMarkCircle },
  { title: 'ক্রয় যাচাই করুন', description: 'অপেক্ষমাণ পেমেন্ট ও অনুমোদন দেখুন', href: '/admin/purchases', icon: HiOutlineShoppingCart },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [status, setStatus] = useState('loading');

  const loadStats = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await apiClient.get('/admin-auth/dashboard-stats');
      setCounts(response.data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary-600">Admin overview</p>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">ড্যাশবোর্ড</h1>
            <p className="mt-1.5 text-sm text-neutral-500">প্ল্যাটফর্মের বর্তমান অবস্থা ও গুরুত্বপূর্ণ কাজ</p>
          </div>
          <button type="button" onClick={loadStats} disabled={status === 'loading'} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 disabled:opacity-60 sm:self-auto">
            <HiOutlineRefresh className={['h-4 w-4', status === 'loading' ? 'animate-spin' : ''].join(' ')} />
            রিফ্রেশ
          </button>
        </div>

        {status === 'error' && (
          <div role="alert" className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
            <span>ড্যাশবোর্ডের তথ্য লোড করা যায়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</span>
            <button type="button" onClick={loadStats} className="font-bold underline underline-offset-4">আবার চেষ্টা করুন</button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {statDefinitions.map((stat, index) => {
            const Icon = stat.icon;
            const loading = status === 'loading';
            return (
              <motion.div key={stat.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Link href={stat.href} className="group block min-h-[138px] rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <span className={['flex h-10 w-10 items-center justify-center rounded-xl', stat.color].join(' ')}><Icon className="h-5 w-5" /></span>
                    <HiOutlineArrowRight className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600" />
                  </div>
                  {loading ? <div className="mt-4 h-7 w-16 animate-pulse rounded-md bg-neutral-100" /> : <p className="mt-4 text-2xl font-bold tabular-nums text-neutral-900">{counts?.[stat.key] ?? 0}</p>}
                  <p className="mt-0.5 text-xs font-medium text-neutral-500">{stat.label}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {status === 'success' && (
          <section className="mb-8 grid gap-5 xl:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4 sm:px-5">
                <div><h2 className="font-bold text-neutral-900">সাম্প্রতিক ক্রয়</h2><p className="mt-0.5 text-xs text-neutral-500">{counts?.pendingPurchases || 0}টি অনুমোদনের অপেক্ষায়</p></div>
                <Link href="/admin/purchases" className="text-xs font-bold text-primary-600">সব দেখুন</Link>
              </div>
              <div className="divide-y divide-neutral-100">
                {counts?.recentPurchases?.length ? counts.recentPurchases.map((purchase) => (
                  <Link key={purchase._id} href="/admin/purchases" className="flex min-h-[68px] items-center gap-3 px-4 py-3 transition hover:bg-neutral-50 sm:px-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><HiOutlineShoppingCart className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-neutral-800">{purchase.teacherId?.name || 'শিক্ষক'}</span><span className="block truncate text-xs text-neutral-500">{purchase.packageId?.name || 'প্যাকেজ'} · ৳{Number(purchase.finalAmount || 0).toLocaleString('bn-BD')}</span></span>
                    <span className={['rounded-full px-2 py-1 text-[10px] font-bold', purchase.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'].join(' ')}>{purchase.status === 'pending' ? 'অপেক্ষমাণ' : 'সম্পন্ন'}</span>
                  </Link>
                )) : <p className="p-6 text-center text-sm text-neutral-400">কোনো ক্রয় নেই</p>}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4 sm:px-5">
                <div><h2 className="font-bold text-neutral-900">নতুন শিক্ষক</h2><p className="mt-0.5 text-xs text-neutral-500">সর্বশেষ নিবন্ধিত অ্যাকাউন্ট</p></div>
                <Link href="/admin/teachers" className="text-xs font-bold text-primary-600">সব দেখুন</Link>
              </div>
              <div className="divide-y divide-neutral-100">
                {counts?.recentTeachers?.length ? counts.recentTeachers.map((teacher) => (
                  <Link key={teacher._id} href="/admin/teachers" className="flex min-h-[68px] items-center gap-3 px-4 py-3 transition hover:bg-neutral-50 sm:px-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-bold text-violet-700">{teacher.name?.charAt(0) || 'শ'}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-neutral-800">{teacher.name}</span><span className="block truncate text-xs text-neutral-500">{teacher.email}</span></span>
                    <span className="text-[10px] text-neutral-400">{new Date(teacher.createdAt).toLocaleDateString('bn-BD')}</span>
                  </Link>
                )) : <p className="p-6 text-center text-sm text-neutral-400">কোনো শিক্ষক নেই</p>}
              </div>
            </div>
          </section>
        )}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-neutral-900">দ্রুত কাজ</h2>
            <p className="mt-1 text-sm text-neutral-500">সবচেয়ে বেশি ব্যবহৃত প্রশাসনিক কার্যক্রম</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {workflows.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group flex min-h-[104px] items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md sm:p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><Icon className="h-6 w-6" /></span>
                  <span className="min-w-0 flex-1"><span className="block font-bold text-neutral-800">{item.title}</span><span className="mt-1 block text-xs leading-5 text-neutral-500">{item.description}</span></span>
                  <HiOutlineArrowRight className="h-5 w-5 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}