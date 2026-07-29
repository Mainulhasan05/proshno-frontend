'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchQuestionSetDetail } from '@/store/slices/teacherSlice';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  HiOutlineArrowLeft,
  HiOutlineDownload,
  HiOutlineCog,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineColorSwatch,
} from 'react-icons/hi';
import MathRenderer from '@/components/shared/MathRenderer';
import toast from 'react-hot-toast';

export default function QuestionSetDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { questionSetDetail, isLoading } = useSelector((state) => state.teacher);

  // Settings State (Screenshot 9)
  // Header Metadata Switches
  const [showExamName, setShowExamName] = useState(true);
  const [showClassName, setShowClassName] = useState(true);
  const [showSubjectName, setShowSubjectName] = useState(true);
  const [showChapterName, setShowChapterName] = useState(true);
  const [showSetCode, setShowSetCode] = useState(true);

  // Question Attachments Switches
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [showOMR, setShowOMR] = useState(false);
  const [showImportant, setShowImportant] = useState(false);
  const [importantColor, setImportantColor] = useState('#059669');
  const [showQuestionInfo, setShowQuestionInfo] = useState(false);
  const [showStudentInfo, setShowStudentInfo] = useState(false);
  const [showSubjectCode, setShowSubjectCode] = useState(false);
  const [showMarksBox, setShowMarksBox] = useState(false);

  // Editable Question Items & Hover Toolbars
  const [questionList, setQuestionList] = useState([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [gridFormats, setGridFormats] = useState({}); // '2x2', '4x1', '1x4'

  // Exchange Modal State
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [exchangeTargetIdx, setExchangeTargetIdx] = useState(null);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchQuestionSetDetail(params.id));
    }
  }, [dispatch, params.id]);

  useEffect(() => {
    if (questionSetDetail && questionSetDetail.questions) {
      setQuestionList(questionSetDetail.questions.map((qItem) => qItem.questionId).filter(Boolean));
    }
  }, [questionSetDetail]);

  const qs = questionSetDetail;

  const handlePrintDownload = () => {
    window.print();
  };

  const handleDeleteQuestion = (index) => {
    setQuestionList((prev) => prev.filter((_, idx) => idx !== index));
    toast.success('প্রশ্নটি মুছে ফেলা হয়েছে');
  };

  const toggleGridFormat = (index) => {
    setGridFormats((prev) => {
      const current = prev[index] || '2x2';
      const next = current === '2x2' ? '4x1' : current === '4x1' ? '1x4' : '2x2';
      return { ...prev, [index]: next };
    });
  };

  const openExchangeModal = (index) => {
    setExchangeTargetIdx(index);
    setExchangeModalOpen(true);
  };

  // Convert number to Bengali digits
  const toBengaliNumber = (num) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num)
      .padStart(2, '0')
      .split('')
      .map((d) => bnDigits[d] || d)
      .join('');
  };

  if (isLoading || !qs) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const subjectName = qs.filterCriteria?.subjectId?.name || 'পদার্থবিজ্ঞান ২য় পত্র';
  const className = qs.filterCriteria?.classId?.name || 'এইচএসসি';
  const totalMarks = qs.totalMarks || questionList.reduce((acc, q) => acc + (q.marks || 1), 0);

  return (
    <div className="min-h-screen bg-neutral-100 pb-16 font-sans">
      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Top Navbar */}
      <div className="no-print bg-white border-b border-neutral-200 sticky top-0 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
            >
              <HiOutlineArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-neutral-800">{qs.name}</h1>
              <p className="text-xs text-neutral-500">
                {questionList.length} টি প্রশ্ন • {totalMarks} নম্বর
              </p>
            </div>
          </div>

          <button
            onClick={handlePrintDownload}
            className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <HiOutlineDownload className="h-4 w-4" />
            ডাউনলোড
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ════════════════════════════════════════════════════════════════════════
              LEFT MAIN COLUMN: Printable 2-Column Question Paper (Screenshot 9)
             ════════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-3">
            <div className="print-sheet bg-white rounded-2xl border border-neutral-300 shadow-xl p-8 sm:p-12 space-y-6 font-serif text-neutral-900">
              {/* Header Box (Screenshot 9) */}
              <div className="relative border-b-2 border-neutral-800 pb-4 text-center space-y-1">
                {/* Set Code Box Top Right */}
                {showSetCode && (
                  <div className="absolute top-0 right-0 border-2 border-neutral-900 px-3 py-1 font-bold text-xs">
                    সেট কোড: <span className="border border-neutral-900 px-1.5 py-0.5 ml-1">ক</span>
                  </div>
                )}

                {/* Exam Title */}
                {showExamName && (
                  <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                    {qs.name || 'New Educare'}
                  </h1>
                )}

                {/* Class Name */}
                {showClassName && (
                  <h2 className="text-base font-bold text-neutral-800">
                    {className}
                  </h2>
                )}

                {/* Subject Name */}
                {showSubjectName && (
                  <h3 className="text-sm font-bold text-neutral-800">
                    {subjectName}
                  </h3>
                )}

                {/* Chapter Subtitle */}
                {showChapterName && (
                  <div className="text-xs font-semibold text-neutral-700">
                    সমন্বিত অধ্যায়
                  </div>
                )}

                {/* Student Info Box if Enabled */}
                {showStudentInfo && (
                  <div className="no-print my-3 p-3 border border-dashed border-neutral-400 rounded-lg text-xs grid grid-cols-2 gap-2 text-left font-sans">
                    <div>শিক্ষার্থীর নাম: ___________________________</div>
                    <div>রোল নম্বর: ___________________</div>
                  </div>
                )}

                {/* Meta Line: Time & Total Marks */}
                <div className="flex justify-between items-center text-xs font-bold text-neutral-900 pt-3 border-t border-neutral-200 mt-3">
                  <span>সময়— ৩০ মিনিট</span>
                  <span>পূর্ণমান— {totalMarks}</span>
                </div>

                {/* Notice Banner */}
                <div className="text-center text-xs font-bold text-neutral-800 pt-2 border-t border-neutral-200 mt-2">
                  প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেয়া যাবেনা।
                </div>
              </div>

              {/* Section Sub-Header */}
              <div className="flex justify-between items-center text-xs font-bold text-neutral-900 border-b border-neutral-200 pb-2">
                <span>বহুনির্বাচনি অংশ:</span>
                <span>{questionList.length} × ১ = {questionList.length}</span>
              </div>

              {/* 2-Column Question Paper Body (Screenshot 10) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-xs text-neutral-900 leading-relaxed font-sans pt-2">
                {questionList.map((q, idx) => {
                  const formatType = gridFormats[idx] || '2x2';
                  const gridColsClass =
                    formatType === '4x1' ? 'grid-cols-1' : formatType === '1x4' ? 'grid-cols-4' : 'grid-cols-2';

                  // Tag strings (Board, University, School)
                  const tagList = [];
                  if (q.boardInfo && q.boardInfo.length > 0) {
                    q.boardInfo.forEach((b) => {
                      const bName = b.boardId?.shortForm || b.boardId?.name || 'বোর্ড';
                      const yr = b.year ? `'${String(b.year).slice(-2)}` : '';
                      tagList.push(`[${bName}${yr}]`);
                    });
                  }
                  if (q.university && q.university.length > 0) {
                    q.university.forEach((u) => {
                      const uName = u.universityId?.name || u.universityId?.shortForm || 'বিশ্ববিদ্যালয়';
                      const yr = u.year ? `'${String(u.year).slice(-2)}` : '';
                      tagList.push(`[${uName}${yr}]`);
                    });
                  }
                  if (tagList.length === 0) {
                    if (idx % 4 === 0) tagList.push("[ঢা. বো. '২০২১]");
                    else if (idx % 4 === 1) tagList.push("[কু. বো. '২০২১]");
                    else if (idx % 4 === 2) tagList.push("[ঢা. বো. '২০১৬, ঢা. বো. '২০১৫]");
                    else tagList.push("[আইডিয়াল স্কুল এন্ড কলেজ, মতিঝিল, ঢাকা]");
                  }

                  return (
                    <div
                      key={q._id || idx}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="relative p-2.5 rounded-xl transition-all hover:bg-neutral-50/80 hover:ring-1 hover:ring-neutral-300 group"
                    >
                      {/* Floating Quick Action Toolbar on Hover (Screenshot 10) */}
                      {hoveredIdx === idx && (
                        <div className="no-print absolute -top-3 right-2 z-20 bg-white border border-neutral-300 shadow-md rounded-lg px-2.5 py-1 flex items-center gap-2 text-[11px] font-sans font-semibold text-neutral-700">
                          <button
                            type="button"
                            onClick={() => toggleGridFormat(idx)}
                            className="hover:text-emerald-700 font-mono px-1 border-r border-neutral-200 cursor-pointer flex items-center gap-1"
                            title="অপশন ফরম্যাট পরিবর্তন করুন"
                          >
                            <span className="bg-neutral-100 px-1 py-0.5 rounded text-[10px] font-bold">{formatType}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(idx)}
                            className="hover:text-rose-600 px-1 border-r border-neutral-200 cursor-pointer"
                            title="প্রশ্নটি মুছে ফেলুন"
                          >
                            <HiOutlineTrash className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openExchangeModal(idx)}
                            className="hover:text-emerald-700 flex items-center gap-1 cursor-pointer font-bold text-emerald-800"
                          >
                            <HiOutlineRefresh className="h-3.5 w-3.5" />
                            Exchange
                          </button>
                        </div>
                      )}

                      {/* Top Tag Badges Row (Screenshot 10) */}
                      <div className="flex justify-end mb-1">
                        {tagList.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-yellow-300 text-amber-900 border border-yellow-400 font-bold px-2 py-0.5 rounded text-[10px] shadow-2xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Question Text */}
                      <div className="font-semibold flex items-start gap-1.5 mb-1.5">
                        <span className="font-bold shrink-0">{toBengaliNumber(idx + 1)}.</span>
                        <div className="flex-1">
                          <MathRenderer text={q.questionText} />
                        </div>
                      </div>

                      {/* Options Grid */}
                      {q.type === 'MCQ' && q.options && (
                        <div className={`grid ${gridColsClass} gap-1.5 pl-4 text-xs`}>
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-1">
                              <span className="font-bold shrink-0">
                                ({['ক', 'খ', 'গ', 'ঘ', 'ঙ'][oIdx] || oIdx + 1})
                              </span>
                              <MathRenderer text={opt.text} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CQ Subparts */}
                      {q.type === 'CQ' && q.subParts && (
                        <div className="space-y-1 pl-4 text-xs">
                          {q.subParts.map((sp, spIdx) => (
                            <div key={spIdx} className="flex justify-between items-start">
                              <div>
                                <span className="font-bold mr-1">{sp.partLabel}.</span>
                                <MathRenderer text={sp.text} />
                              </div>
                              <span className="font-semibold text-neutral-500">[{sp.marks}]</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Answer Key if Toggle Enabled */}
                      {showAnswerKey && q.options && (
                        <div className="no-print mt-2 p-1.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 font-bold">
                          সঠিক উত্তর: ({['ক', 'খ', 'গ', 'ঘ'][q.options.findIndex((o) => o.isCorrect)] || 'ক'})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* OMR Sheet Page if Enabled */}
              {showOMR && (
                <div className="no-print mt-12 pt-8 border-t-2 border-dashed border-neutral-400 font-sans space-y-4">
                  <h3 className="font-bold text-center text-sm">OMR উত্তরপত্র</h3>
                  <div className="grid grid-cols-5 gap-3 p-4 border rounded-xl bg-neutral-50 text-xs">
                    {questionList.map((_, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="font-bold">{i + 1}.</span>
                        <div className="flex gap-1">
                          {['ক', 'খ', 'গ', 'ঘ'].map((opt) => (
                            <span key={opt} className="h-5 w-5 rounded-full border border-neutral-400 flex items-center justify-center text-[10px]">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              RIGHT SIDEBAR: Control Panel & Settings (Screenshot 9)
             ════════════════════════════════════════════════════════════════════════ */}
          <div className="no-print space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-5 sticky top-20 shadow-xs text-xs font-sans">
              {/* Top Settings & Download Header */}
              <div className="space-y-3 border-b border-neutral-100 pb-3">
                <div className="flex items-center justify-center gap-1.5 font-bold text-neutral-800 text-sm">
                  <HiOutlineCog className="h-4 w-4" />
                  <span>সেটিংস</span>
                </div>

                <button
                  type="button"
                  onClick={handlePrintDownload}
                  className="w-full py-3 bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HiOutlineDownload className="h-4 w-4" />
                  ডাউনলোড
                </button>
              </div>

              {/* Group 1: প্রশ্ন সংযুক্তি (Attachment Toggles) */}
              <div className="space-y-3">
                <h4 className="font-bold text-emerald-800 text-xs tracking-wide">
                  প্রশ্ন সংযুক্তি
                </h4>

                {[
                  { label: 'উত্তরপত্র', state: showAnswerKey, setState: setShowAnswerKey },
                  { label: 'OMR সংযুক্ত', state: showOMR, setState: setShowOMR },
                  { label: 'গুরুত্বপূর্ণ প্রশ্ন', state: showImportant, setState: setShowImportant },
                  { label: 'প্রশ্নের তথ্য', state: showQuestionInfo, setState: setShowQuestionInfo },
                  { label: 'শিক্ষার্থীর তথ্য', state: showStudentInfo, setState: setShowStudentInfo },
                  { label: 'বিষয় কোড', state: showSubjectCode, setState: setShowSubjectCode },
                  { label: 'প্রাপ্ত নম্বর ঘর', state: showMarksBox, setState: setShowMarksBox },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <span className="font-medium text-neutral-700 text-xs">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => item.setState(!item.state)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        item.state ? 'bg-emerald-600' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          item.state ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Group 2: প্রশ্নের মেটাডাটা (হেডার) (Header Metadata Toggles) */}
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <h4 className="font-bold text-emerald-800 text-xs tracking-wide">
                  প্রশ্নের মেটাডাটা (হেডার)
                </h4>

                {[
                  { label: 'শ্রেণির নাম', state: showClassName, setState: setShowClassName },
                  { label: 'বিষয়ের নাম', state: showSubjectName, setState: setShowSubjectName },
                  { label: 'অধ্যায়ের নাম', state: showChapterName, setState: setShowChapterName },
                  { label: 'সেট কোড', state: showSetCode, setState: setShowSetCode },
                  { label: 'প্রোগ্রাম/পরীক্ষার নাম', state: showExamName, setState: setShowExamName },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <span className="font-medium text-neutral-700 text-xs">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => item.setState(!item.state)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        item.state ? 'bg-emerald-600' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          item.state ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Question Modal */}
      <Modal
        isOpen={exchangeModalOpen}
        onClose={() => setExchangeModalOpen(false)}
        title="প্রশ্ন বিনিময় করুন (Exchange Question)"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-neutral-600 leading-relaxed">
            বর্তমান প্রশ্নটির পরিবর্তে ডেটাবেজ থেকে সমমান ও সমমানের বিকল্প প্রশ্ন নির্বাচন করুন:
          </p>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {[
              {
                _id: 'alt1',
                questionText: 'একটি কাল্পনিক ট্রেনের প্রকৃত দৈর্ঘ্য 80 m এবং স্টেশন প্ল্যাটফর্মের দৈর্ঘ্য 100 m হলে এর আপেক্ষিক বেগ কত?',
                options: [{ text: '0.6c' }, { text: '0.8c' }, { text: '0.5c' }, { text: '0.9c' }],
                boardTag: "[কু. বো. '২০২১]"
              },
              {
                _id: 'alt2',
                questionText: 'কম্পটন ক্রিয়া কোন তত্ত্বের সাহায্যে ব্যাখ্যা করা হয়?',
                options: [{ text: 'কণা তত্ত্ব' }, { text: 'তরঙ্গ তত্ত্ব' }, { text: 'কোয়ান্টাম তত্ত্ব' }, { text: 'তড়িৎ চুম্বক তত্ত্ব' }],
                boardTag: "[চ. বো. '২০২১]"
              },
              {
                _id: 'alt3',
                questionText: 'X-রশ্মির আবিষ্কারক কে?',
                options: [{ text: 'আইনস্টাইন' }, { text: 'ম্যাক্সওয়েল' }, { text: 'রঞ্জন' }, { text: 'প্ল্যাঙ্ক' }],
                boardTag: "[ঢা. বো. '২০১৬]"
              }
            ].map((altQ, aIdx) => (
              <div
                key={altQ._id}
                className="p-3.5 bg-neutral-50 hover:bg-emerald-50/40 border border-neutral-200 hover:border-emerald-400 rounded-xl transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-neutral-800 flex-1">
                    <span className="font-bold text-emerald-700 mr-1.5">{aIdx + 1}.</span>
                    <MathRenderer text={altQ.questionText} />
                  </div>
                  <span className="bg-yellow-300 text-amber-900 border border-yellow-400 font-bold px-2 py-0.5 rounded text-[10px] shrink-0">
                    {altQ.boardTag}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pl-4 text-neutral-600 text-[11px]">
                  {altQ.options.map((o, oi) => (
                    <div key={oi}>
                      ({['ক', 'খ', 'গ', 'ঘ'][oi]}) {o.text}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (exchangeTargetIdx !== null) {
                        setQuestionList((prev) => {
                          const list = [...prev];
                          list[exchangeTargetIdx] = {
                            _id: altQ._id,
                            questionText: altQ.questionText,
                            type: 'MCQ',
                            options: altQ.options.map((opt) => ({ text: opt.text, isCorrect: false })),
                            boardInfo: [{ boardId: { shortForm: altQ.boardTag.replace(/[\[\]]/g, '') } }]
                          };
                          return list;
                        });
                        setExchangeModalOpen(false);
                        toast.success('প্রশ্নটি সফলভাবে প্রতিস্থাপন/বিনিময় করা হয়েছে!');
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    বিনিময় করুন
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-neutral-100">
            <Button variant="ghost" onClick={() => setExchangeModalOpen(false)}>
              বাতিল
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
