'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { fetchQuestionSets, deleteQuestionSet } from '@/store/slices/teacherSlice';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  HiOutlineClipboardList,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineHashtag,
  HiOutlineBookOpen,
} from 'react-icons/hi';

export default function TeacherQuestionSetsPage() {
  const dispatch = useDispatch();
  const { questionSets, isLoading } = useSelector((state) => state.teacher);

  const [setToDelete, setSetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchQuestionSets());
  }, [dispatch]);

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteQuestionSet(setToDelete._id)).unwrap();
      toast.success('প্রশ্ন সেটটি সফলভাবে মুছে ফেলা হয়েছে');
      setSetToDelete(null);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'প্রশ্ন সেট মুছে ফেলা ব্যর্থ হয়েছে');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-800">প্রশ্ন সেট</h1>
            {!isLoading && (
              <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 border border-primary-100">
                মোট {questionSets.length} টি
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            আপনার তৈরি সমস্ত পরীক্ষা ও প্রশ্ন সেটগুলোর তালিকা ও বিস্তারিত ব্যবস্থাপনা করুন
          </p>
        </div>
        <Link href="/teacher/question-sets/create">
          <Button variant="primary" icon={HiOutlinePlus} className="shadow-sm">
            নতুন প্রশ্ন সেট
          </Button>
        </Link>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 w-10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : questionSets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 text-neutral-400 text-center px-4">
          <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border border-neutral-200 flex items-center justify-center mb-4">
            <HiOutlineClipboardList className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-700 mb-1">কোনো প্রশ্ন সেট পাওয়া যায়নি</h3>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mb-5">
            আপনি এখনো কোনো প্রশ্ন সেট তৈরি করেননি। ১-ক্লিক বা ম্যানুয়ালি প্রশ্ন সেট তৈরি করতে নিচের বাটনে ক্লিক করুন।
          </p>
          <Link href="/teacher/question-sets/create">
            <Button variant="primary" icon={HiOutlinePlus}>
              প্রশ্ন সেট তৈরি করুন
            </Button>
          </Link>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {questionSets.map((qs) => (
              <motion.div
                key={qs._id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 12 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all duration-200"
              >
                <div>
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
                      <HiOutlineClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100/80 px-2 py-0.5 rounded-full border border-neutral-200/50">
                      {new Date(qs.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  {/* Card Title & Description */}
                  <h3 className="text-base font-bold text-neutral-800 mb-1.5 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                    {qs.name}
                  </h3>
                  {qs.description ? (
                    <p className="text-xs text-neutral-500 mb-4 line-clamp-2 leading-relaxed">
                      {qs.description}
                    </p>
                  ) : (
                    <div className="h-2 mb-2" />
                  )}

                  {/* Meta Stats Badges */}
                  <div className="flex items-center gap-3 mb-5 text-xs text-neutral-600 bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-100">
                    <div className="flex items-center gap-1.5 flex-1">
                      <HiOutlineBookOpen className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="truncate">
                        <strong className="font-semibold text-neutral-800">{qs.totalQuestions}</strong> টি প্রশ্ন
                      </span>
                    </div>
                    <div className="h-3 w-px bg-neutral-200" />
                    <div className="flex items-center gap-1.5 flex-1">
                      <HiOutlineHashtag className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="truncate">
                        <strong className="font-semibold text-neutral-800">{qs.totalMarks}</strong> নম্বর
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <Link href={`/teacher/question-sets/${qs._id}`} className="flex-1">
                    <Button variant="outline" size="sm" icon={HiOutlineEye} className="w-full justify-center">
                      দেখুন ও প্রিন্ট
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSetToDelete(qs)}
                    aria-label="প্রশ্ন সেট মুছুন"
                    className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 focus:bg-rose-50"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!setToDelete}
        onClose={() => {
          if (!isDeleting) setSetToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="প্রশ্ন সেট মুছে ফেলবেন?"
        message="এই প্রশ্ন সেটটি আপনার তালিকা থেকে মুছে ফেলা হবে। আপনি কি নিশ্চিত?"
        confirmText="হ্যাঁ, মুছুন"
        cancelText="বাতিল"
        variant="danger"
        isLoading={isDeleting}
        itemDetails={
          setToDelete ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                নির্বাচিত প্রশ্ন সেট
              </p>
              <p className="text-sm font-bold text-neutral-800 line-clamp-1">{setToDelete.name}</p>
              <div className="flex items-center gap-3 pt-0.5 text-xs text-neutral-600">
                <span className="inline-flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {setToDelete.totalQuestions} টি প্রশ্ন
                </span>
                <span className="text-neutral-300">•</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {setToDelete.totalMarks} নম্বর
                </span>
              </div>
            </div>
          ) : null
        }
      />
    </div>
  );
}
