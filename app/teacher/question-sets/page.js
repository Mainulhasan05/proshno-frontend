'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fetchQuestionSets, deleteQuestionSet } from '@/store/slices/teacherSlice';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import {
  HiOutlineClipboardList,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineEye,
} from 'react-icons/hi';

export default function TeacherQuestionSetsPage() {
  const dispatch = useDispatch();
  const { questionSets, isLoading } = useSelector((state) => state.teacher);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchQuestionSets());
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteQuestionSet(id)).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err || 'মুছে ফেলা ব্যর্থ হয়েছে');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">প্রশ্ন সেট</h1>
          <p className="text-sm text-neutral-500 mt-1">আপনার তৈরি প্রশ্ন সেট ব্যবস্থাপনা করুন</p>
        </div>
        <Link href="/teacher/question-sets/create">
          <Button variant="primary" icon={HiOutlinePlus}>
            নতুন প্রশ্ন সেট
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : questionSets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <HiOutlineClipboardList className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">কোনো প্রশ্ন সেট নেই</p>
          <p className="text-sm mt-1">নতুন প্রশ্ন সেট তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionSets.map((qs, idx) => (
            <motion.div
              key={qs._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                  <HiOutlineClipboardList className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-neutral-400">
                  {new Date(qs.createdAt).toLocaleDateString('bn-BD')}
                </span>
              </div>

              <h3 className="text-sm font-bold text-neutral-800 mb-1 line-clamp-2">{qs.name}</h3>
              {qs.description && (
                <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{qs.description}</p>
              )}

              <div className="flex items-center gap-4 mb-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-neutral-700">{qs.totalQuestions}</span> প্রশ্ন
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-neutral-700">{qs.totalMarks}</span> নম্বর
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/teacher/question-sets/${qs._id}`} className="flex-1">
                  <Button variant="outline" size="sm" icon={HiOutlineEye} className="w-full">
                    দেখুন
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(qs._id)}
                  className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </Button>
              </div>

              {/* Delete confirm */}
              {deleteConfirm === qs._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-neutral-200"
                >
                  <p className="text-xs text-neutral-600 mb-2">মুছে ফেলতে চান?</p>
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(qs._id)}>
                      হ্যাঁ, মুছুন
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                      বাতিল
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
