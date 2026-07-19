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
import MathRenderer from '@/components/shared/MathRenderer';

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
               {q.stimulus && (
                 <div className="mb-3 bg-neutral-50 border-l-4 border-primary-500 p-3 rounded-lg text-sm text-neutral-700 leading-relaxed font-serif">
                   <span className="font-bold block text-neutral-800 mb-1">উদ্দীপক:</span>
                   <MathRenderer text={q.stimulus} />
                   {q.stimulusImage && (
                     <div className="mt-2">
                       <img src={q.stimulusImage} alt="উদ্দীপক চিত্র" className="max-h-48 object-contain rounded border border-neutral-200 bg-white" />
                     </div>
                   )}
                 </div>
               )}

               <div className="text-sm sm:text-base text-neutral-800 font-medium leading-relaxed">
                 <MathRenderer text={q.questionText} />
               </div>

               {q.questionImage && (
                 <div className="mt-2 mb-3">
                   <img src={q.questionImage} alt="প্রশ্ন চিত্র" className="max-h-32 object-contain rounded border border-neutral-200 bg-white" />
                 </div>
               )}

               {q.type === 'MCQ' && q.options?.length > 0 && (
                 <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                   {q.options.map((opt, oi) => (
                     <div
                       key={oi}
                       className={`text-sm px-3 py-2 rounded-lg border flex items-center justify-between gap-2 ${opt.isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-700 font-medium' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}
                     >
                       <div className="flex items-center gap-1.5">
                         <span className="font-bold text-neutral-400">{String.fromCharCode(2453 + oi)})</span>
                         <MathRenderer text={opt.text} />
                       </div>
                       {opt.image && (
                         <div className="ml-2 shrink-0">
                           <img src={opt.image} alt="" className="h-10 w-10 object-contain rounded border bg-white" />
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}

               {q.type === 'CQ' && q.subParts?.length > 0 && (
                 <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3">
                   {q.subParts.map((sp, si) => (
                     <div key={si} className="text-sm text-neutral-700 pl-3 border-l-2 border-primary-300 space-y-1">
                       <div className="flex flex-wrap items-center gap-1">
                         <span className="font-bold text-primary-700">{sp.partLabel})</span>
                         <MathRenderer text={sp.text} />
                         <span className="text-xs text-neutral-400">({sp.marks} নম্বর)</span>
                       </div>
                       {sp.sampleAnswer && (
                         <div className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded">
                           <span className="font-semibold text-neutral-600 block mb-0.5">নমুনা উত্তর / মূল্যায়ন নির্দেশিকা:</span>
                           <MathRenderer text={sp.sampleAnswer} />
                         </div>
                       )}
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
