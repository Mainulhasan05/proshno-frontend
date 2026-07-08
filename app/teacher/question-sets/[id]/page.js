'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fetchQuestionSetDetail } from '@/store/slices/teacherSlice';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import {
  HiOutlineArrowLeft,
  HiOutlineClipboardList,
} from 'react-icons/hi';

const typeLabels = { MCQ: 'MCQ', CQ: 'সৃজনশীল', SHORT: 'সংক্ষিপ্ত' };
const typeColors = { MCQ: 'bg-indigo-100 text-indigo-700', CQ: 'bg-amber-100 text-amber-700', SHORT: 'bg-emerald-100 text-emerald-700' };

export default function QuestionSetDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { questionSetDetail, isLoading } = useSelector((state) => state.teacher);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchQuestionSetDetail(params.id));
    }
  }, [dispatch, params.id]);

  const qs = questionSetDetail;

  if (isLoading || !qs) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
          <HiOutlineArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">{qs.name}</h1>
          {qs.description && <p className="text-sm text-neutral-500 mt-0.5">{qs.description}</p>}
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-6 flex items-center gap-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
          <HiOutlineClipboardList className="h-6 w-6 text-white" />
        </div>
        <div className="flex gap-8 text-sm">
          <div>
            <span className="text-neutral-500">মোট প্রশ্ন</span>
            <p className="text-lg font-bold text-neutral-800">{qs.totalQuestions}</p>
          </div>
          <div>
            <span className="text-neutral-500">মোট নম্বর</span>
            <p className="text-lg font-bold text-neutral-800">{qs.totalMarks}</p>
          </div>
          <div>
            <span className="text-neutral-500">তৈরির তারিখ</span>
            <p className="text-lg font-bold text-neutral-800">
              {new Date(qs.createdAt).toLocaleDateString('bn-BD')}
            </p>
          </div>
        </div>
      </div>

      {/* Questions list */}
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">প্রশ্ন তালিকা</h2>
      <div className="space-y-4">
        {qs.questions?.map((item, idx) => {
          const q = item.questionId;
          if (!q) return null;
          return (
            <motion.div
              key={item.questionId?._id || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-xl border border-neutral-200 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-neutral-400">#{item.order}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[q.type] || 'bg-neutral-100 text-neutral-600'}`}>
                  {typeLabels[q.type] || q.type}
                </span>
                <span className="text-xs text-neutral-400 ml-auto">{q.marks} নম্বর</span>
                {q.chapterId?.name && (
                  <span className="text-xs text-neutral-400">• {q.chapterId.name}</span>
                )}
              </div>
              <p className="text-sm text-neutral-800 leading-relaxed">{q.questionText}</p>

              {q.type === 'MCQ' && q.options?.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`text-sm px-3 py-2 rounded-lg border ${opt.isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}
                    >
                      <span className="font-medium mr-1.5">{String.fromCharCode(2453 + oi)}.</span>
                      {opt.text}
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'CQ' && q.subParts?.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {q.subParts.map((sp, si) => (
                    <div key={si} className="text-sm text-neutral-600 pl-3 border-l-2 border-primary-200">
                      <span className="font-medium text-primary-600">{sp.partLabel}.</span> {sp.text}
                      <span className="text-xs text-neutral-400 ml-2">({sp.marks} নম্বর)</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
