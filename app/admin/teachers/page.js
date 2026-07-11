'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchTeachers, toggleTeacherActive } from '@/store/slices/adminSlice';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import {
  HiOutlineUsers, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineSearch, HiOutlineMail, HiOutlinePhone,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';

export default function TeachersPage() {
  const dispatch = useDispatch();
  const { teachers = [], pagination = {}, isLoading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    const params = { page };
    if (search) params.search = search;
    if (filterActive !== 'all') params.isActive = filterActive;
    dispatch(fetchTeachers(params));
  }, [dispatch, search, filterActive, page]);

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleTeacherActive(id)).unwrap();
      const params = { page };
      if (search) params.search = search;
      if (filterActive !== 'all') params.isActive = filterActive;
      dispatch(fetchTeachers(params));
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">শিক্ষক ব্যবস্থাপনা</h1>
          <p className="text-sm text-neutral-500 mt-1">নিবন্ধিত শিক্ষকদের তালিকা ও পরিচালনা</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="নাম, ইমেইল বা ফোনে খুঁজুন..."
            className="w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <select
          value={filterActive}
          onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-neutral-300 rounded-lg text-sm outline-none min-w-[140px]"
        >
          <option value="all">সকল</option>
          <option value="true">সক্রিয়</option>
          <option value="false">নিষ্ক্রিয়</option>
        </select>
      </div>

      {/* Teachers List */}
      {teachers.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          কোনো শিক্ষক পাওয়া যায়নি
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher, i) => (
          <motion.div
            key={teacher._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow ${!teacher.isActive ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-full flex items-center justify-center text-base font-bold ${
                  teacher.isActive ? 'bg-violet-100 text-violet-600' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {teacher.name?.charAt(0) || 'শ'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-800 text-sm truncate">{teacher.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {teacher.isActive ? (
                      <span className="text-xs bg-success-50 text-success-600 px-2 py-0.5 rounded-full">সক্রিয়</span>
                    ) : (
                      <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">নিষ্ক্রিয়</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <HiOutlineMail className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="truncate">{teacher.email}</span>
              </div>
              {teacher.phone && (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <HiOutlinePhone className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span>{teacher.phone}</span>
                </div>
              )}
              {teacher.institutionName && (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <HiOutlineOfficeBuilding className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="truncate">{teacher.institutionName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
              <span className="text-xs text-neutral-400">যোগদান: {formatDate(teacher.createdAt)}</span>
              <button
                onClick={() => handleToggle(teacher._id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  teacher.isActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-success-50 text-success-600 hover:bg-green-100'
                }`}
              >
                {teacher.isActive ? (
                  <><HiOutlineEyeOff className="h-3.5 w-3.5" /> নিষ্ক্রিয়</>
                ) : (
                  <><HiOutlineEye className="h-3.5 w-3.5" /> সক্রিয়</>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
