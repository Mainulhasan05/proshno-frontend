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

  // Document Customization States (Screenshot 11)
  const [editingMode, setEditingMode] = useState(false);
  const [textAlign, setTextAlign] = useState('justify'); // 'left', 'center', 'right', 'justify'
  const [paperSize, setPaperSize] = useState('A4'); // 'A4', 'Letter', 'Legal', 'A5'
  const [showPageNumber, setShowPageNumber] = useState(false);
  const [optionStyle, setOptionStyle] = useState('parentheses'); // 'circle', 'parentheses', 'dot', 'right_paren'
  const [fontFamily, setFontFamily] = useState('bangla');
  const [fontSize, setFontSize] = useState(14);
  const [columnsCount, setColumnsCount] = useState(2); // 1, 2, 3
  const [showColumnDivider, setShowColumnDivider] = useState(true);
  const [questionGap, setQuestionGap] = useState(0); // px

  // Mobile View Toggle State
  const [activeMobileTab, setActiveMobileTab] = useState('paper'); // 'paper' | 'settings'

  // Question & Interaction States
  const [questionList, setQuestionList] = useState([]);
  const [gridFormats, setGridFormats] = useState({});
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [exchangeTargetIdx, setExchangeTargetIdx] = useState(null);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);

  // Helper for option labels
  const renderOptionLabel = (idx) => {
    const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    const letter = letters[idx] || String(idx + 1);
    if (optionStyle === 'circle') {
      return (
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold leading-none shrink-0 mr-1 text-neutral-900"
          style={{ border: '1.5px solid #171717' }}
        >
          {letter}
        </span>
      );
    }
    if (optionStyle === 'dot') return `${letter}.`;
    if (optionStyle === 'right_paren') return `${letter})`;
    return `(${letter})`;
  };

  useEffect(() => {
    if (params.id) {
      dispatch(fetchQuestionSetDetail(params.id));
    }
  }, [dispatch, params.id]);

  useEffect(() => {
    if (questionSetDetail && questionSetDetail.questions) {
      const qList = questionSetDetail.questions.map((qItem) => qItem.questionId).filter(Boolean);
      queueMicrotask(() => setQuestionList(qList));
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

  const getPaperSizeCSS = () => {
    switch (paperSize) {
      case 'Letter': return '8.5in 11in';
      case 'Legal': return '8.5in 14in';
      case 'A5': return '148mm 210mm';
      default: return '210mm 297mm';
    }
  };

  const getFontFamilyCSS = () => {
    switch (fontFamily) {
      case 'solaiman': return "'SolaimanLipi', serif";
      case 'kalpurush': return "'Kalpurush', sans-serif";
      case 'sutonny': return "'SutonnyMJ', serif";
      default: return 'inherit';
    }
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
          @page {
            size: ${getPaperSizeCSS()} portrait;
            margin: 15mm 12mm 15mm 12mm;
          }
          html, body {
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, nav, header, aside, footer, .bottom-nav, button {
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
            background: #fff !important;
          }
          .question-item {
            background: transparent !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            outline: none !important;
          }
          .question-item:hover {
            background: transparent !important;
          }
          ${showPageNumber ? `
          @page {
            @bottom-center {
              content: counter(page);
              font-size: 9pt;
              font-family: sans-serif;
              color: #999;
            }
          }` : ''}
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

      {/* Mobile View Toggle Bar (Only visible on screens < lg) */}
      <div className="no-print lg:hidden bg-white border-b border-neutral-200 px-4 py-2 sticky top-[57px] z-20 shadow-xs">
        <div className="flex bg-neutral-100 p-1 rounded-xl gap-1 font-sans text-xs">
          <button
            type="button"
            onClick={() => setActiveMobileTab('paper')}
            className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMobileTab === 'paper'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>📄 প্রশ্নপত্র</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('settings')}
            className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMobileTab === 'settings'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>⚙️ সেটিংস ও কাস্টমাইজেশন</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ════════════════════════════════════════════════════════════════════════
              LEFT MAIN COLUMN: Printable 2-Column Question Paper (Screenshot 9)
             ════════════════════════════════════════════════════════════════════════ */}
          <div className={`lg:col-span-3 ${activeMobileTab === 'paper' ? 'block' : 'hidden lg:block'}`}>
            <div className="print-sheet bg-white rounded-2xl border border-neutral-300 shadow-xl p-8 sm:p-12 space-y-6 font-serif text-neutral-900" style={{ fontFamily: getFontFamilyCSS() }}>
              {/* Header Box (Screenshot 9 & 10) */}
              <div className="relative border-b-2 border-neutral-800 pb-4 text-center space-y-1">
                {/* Marks Box Top Left */}
                {showMarksBox && (
                  <div className="absolute top-0 left-0 border-2 border-neutral-900 px-3 py-1 font-bold text-xs font-sans">
                    প্রাপ্ত নম্বর: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </div>
                )}

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

                {/* Subject Name & Subject Code */}
                {showSubjectName && (
                  <h3 className="text-sm font-bold text-neutral-800 flex items-center justify-center gap-2">
                    <span>{subjectName}</span>
                    {showSubjectCode && (
                      <span className="px-2 py-0.5 border border-neutral-800 text-xs font-mono font-bold">
                        বিষয় কোড: ১৭৪
                      </span>
                    )}
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
                  <div className="my-3 p-3 border border-neutral-800 rounded-lg text-xs grid grid-cols-2 gap-4 text-left font-sans font-semibold">
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

              {/* Question Paper Body */}
              <div
                style={{
                  fontSize: `${fontSize}px`,
                  textAlign: textAlign,
                  columnRule: columnsCount > 1 && showColumnDivider ? '1px solid #cbd5e1' : 'none',
                }}
                className={`${
                  columnsCount === 1
                    ? 'block'
                    : columnsCount === 3
                    ? 'columns-1 sm:columns-3 gap-x-6'
                    : 'columns-1 sm:columns-2 gap-x-8'
                } text-neutral-900 leading-relaxed font-sans pt-2`}
              >
                {questionList.map((q, idx) => {
                  // Smart auto-format: 4x1 if options are long (> 20 chars), else 2x2
                  const maxOptLen = q.options ? Math.max(...q.options.map((o) => (o.text ? o.text.length : 0))) : 0;
                  const defaultFormat = maxOptLen > 20 ? '4x1' : '2x2';
                  const formatType = gridFormats[idx] || defaultFormat;
                  const gridColsClass =
                    formatType === '4x1' ? 'grid-cols-1' : formatType === '1x4' ? 'grid-cols-4' : 'grid-cols-2';

                  // Tag strings (Board, University, School)
                  const tagList = [];
                  if (q.university && q.university.length > 0) {
                    q.university.forEach((u) => {
                      const uniName = u.universityId?.name || u.universityId?.shortForm || (typeof u.universityId === 'string' ? u.universityId : 'বিশ্ববিদ্যালয়');
                      const yr = u.year ? `'${String(u.year).slice(-2)}` : '';
                      tagList.push(`[${uniName}${yr}]`);
                    });
                  }
                  if (q.boardInfo && q.boardInfo.length > 0) {
                    q.boardInfo.forEach((b) => {
                      const bName = b.boardId?.shortForm || b.boardId?.name || (typeof b.boardId === 'string' ? b.boardId : 'বোর্ড');
                      const yr = b.year ? `'${String(b.year).slice(-2)}` : '';
                      tagList.push(`[${bName}${yr}]`);
                    });
                  }
                  if (q.topSchool && q.topSchool.length > 0) {
                    q.topSchool.forEach((ts) => {
                      const sName = ts.schoolId?.name || ts.schoolId?.shortForm || (typeof ts.schoolId === 'string' ? ts.schoolId : 'স্কুল');
                      const yr = ts.year ? `'${String(ts.year).slice(-2)}` : '';
                      tagList.push(`[${sName}${yr}]`);
                    });
                  }

                  return (
                    <div
                      key={q._id || idx}
                      style={{
                        marginBottom: `${Math.max(2, questionGap)}px`,
                        ...(showImportant ? { borderLeft: `3px solid ${importantColor}`, paddingLeft: '12px' } : {}),
                      }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="break-inside-avoid page-break-inside-avoid inline-block w-full align-top relative py-1 px-1.5 rounded-xl transition-all hover:bg-neutral-50/80 hover:ring-1 hover:ring-neutral-300 group question-item"
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

                      {/* Top Tag Badges Row — Controlled by showQuestionInfo toggle */}
                      {showQuestionInfo && tagList.length > 0 && (
                        <div className="flex justify-end mb-1 gap-1 flex-wrap no-print">
                          {tagList.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="bg-yellow-300 text-amber-900 border border-yellow-400 font-bold px-2 py-0.5 rounded text-[10px] shadow-2xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Question Text */}
                      <div
                        contentEditable={editingMode}
                        suppressContentEditableWarning={true}
                        className={`font-semibold flex items-start gap-1.5 mb-0.5 ${
                          editingMode ? 'outline-2 outline-dashed outline-emerald-400 bg-emerald-50/20 p-1 rounded' : ''
                        }`}
                      >
                        <span className="font-bold shrink-0">{toBengaliNumber(idx + 1)}.</span>
                        <div className="flex-1">
                          <MathRenderer text={q.questionText} />
                        </div>
                      </div>

                      {/* Options Grid */}
                      {q.type === 'MCQ' && q.options && (
                        <div className={`grid ${gridColsClass} gap-1.5 pl-4`}>
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              contentEditable={editingMode}
                              suppressContentEditableWarning={true}
                              className={`flex items-start gap-1.5 ${
                                editingMode ? 'outline-1 outline-dashed outline-emerald-400 bg-emerald-50/10 p-0.5 rounded' : ''
                              }`}
                            >
                              <span className="font-bold shrink-0 pt-0.5">
                                {renderOptionLabel(oIdx)}
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
                        <div className="mt-2 p-1.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 font-bold">
                          সঠিক উত্তর: ({['ক', 'খ', 'গ', 'ঘ'][q.options.findIndex((o) => o.isCorrect)] || 'ক'})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* OMR Sheet Page if Enabled */}
              {showOMR && (
                <div className="mt-12 pt-8 border-t-2 border-dashed border-neutral-400 font-sans space-y-4" style={{ breakBefore: 'page' }}>
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

              {/* ProshnoPedia Printed Paper Footer Branding */}
              <div className="pt-4 border-t-2 border-neutral-900 mt-8 flex items-center justify-between text-xs font-bold text-neutral-800 font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
                  <span>— Powered by <strong className="text-emerald-700 font-black text-sm">ProshnoPedia</strong> | প্রশ্নব্যাংক ও পরীক্ষা তৈরি —</span>
                </div>
                <span>www.proshnopedia.com</span>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              RIGHT SIDEBAR: Control Panel & Settings (Screenshot 9)
             ════════════════════════════════════════════════════════════════════════ */}
          <div className={`no-print space-y-4 ${activeMobileTab === 'settings' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto shadow-xs text-xs font-sans">
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

              {/* Group 3: ডকুমেন্ট কাস্টমাইজেশন (Document Customization - Screenshot 11) */}
              <div className="space-y-4 pt-3 border-t border-neutral-100 font-sans">
                <div className="bg-emerald-50 text-emerald-900 font-bold p-2.5 rounded-xl text-xs text-center border border-emerald-200">
                  ডকুমেন্ট কাস্টমাইজেশন
                </div>

                {/* 1. এডিটিং মোড */}
                <div className="flex items-center justify-between bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  <span className="font-semibold text-neutral-800 text-xs">এডিটিং মোড</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMode(!editingMode);
                      toast.success(editingMode ? 'এডিটিং মোড নিষ্ক্রিয়' : 'এডিটিং মোড সক্রিয়! কাগজে সরাসরি টেক্সট সম্পাদনা করুন।');
                    }}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      editingMode ? 'bg-emerald-600' : 'bg-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        editingMode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. টেক্সট এলাইনমেন্ট */}
                <div className="space-y-1.5 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  <span className="font-bold text-neutral-800 text-xs block">টেক্সট এলাইনমেন্ট</span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'left', label: '≡' },
                      { id: 'center', label: '≡' },
                      { id: 'right', label: '≡' },
                      { id: 'justify', label: '≡≡≡' },
                    ].map((align) => (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() => setTextAlign(align.id)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          textAlign === align.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {align.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. পেপার সাইজ */}
                <div className="space-y-1.5">
                  <span className="font-bold text-neutral-800 text-xs block">পেপার সাইজ</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['A4', 'Letter', 'Legal', 'A5'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPaperSize(size)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                          paperSize === size
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <div className="h-8 w-6 border border-neutral-400 bg-white rounded-xs mb-1"></div>
                        <span className="text-[11px]">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Page Setup */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="font-bold text-neutral-800 text-xs">Page Setup</span>
                  <button type="button" className="p-1 text-neutral-600 hover:bg-neutral-200 rounded">
                    ⚙️
                  </button>
                </div>

                {/* 5. পৃষ্ঠা নম্বর */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="font-semibold text-neutral-800 text-xs">পৃষ্ঠা নম্বর</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPageNumber(!showPageNumber)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        showPageNumber ? 'bg-emerald-600' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          showPageNumber ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <button type="button" className="p-1 text-neutral-600 hover:bg-neutral-200 rounded">
                      ⚙️
                    </button>
                  </div>
                </div>

                {/* 6. অপশন স্টাইল */}
                <div className="space-y-1.5">
                  <span className="font-bold text-neutral-800 text-xs block">অপশন স্টাইল</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'circle', label: 'circle' },
                      { id: 'parentheses', label: '()' },
                      { id: 'dot', label: '.' },
                      { id: 'right_paren', label: ')' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOptionStyle(opt.id)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          optionStyle === opt.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {opt.id === 'circle' ? (
                          <span className={`inline-flex items-center justify-center w-4.5 h-4.5 rounded-full border font-bold text-[10px] leading-none ${
                            optionStyle === 'circle' ? 'border-white text-white' : 'border-neutral-700 text-neutral-800'
                          }`}>
                            ক
                          </span>
                        ) : (
                          opt.label
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. ফন্ট পরিবর্তন */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-neutral-800 text-xs shrink-0">ফন্ট পরিবর্তন</span>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="bangla">বাংলা (Default)</option>
                    <option value="solaiman">SolaimanLipi</option>
                    <option value="kalpurush">Kalpurush</option>
                    <option value="sutonny">SutonnyMJ</option>
                  </select>
                </div>

                {/* 8. ফন্ট সাইজ */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="font-bold text-neutral-800 text-xs">ফন্ট সাইজ</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                      className="h-6 w-6 rounded border bg-white font-bold text-neutral-700 hover:bg-neutral-100 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-xs bg-white border rounded py-0.5 font-mono">
                      {fontSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                      className="h-6 w-6 rounded border bg-white font-bold text-neutral-700 hover:bg-neutral-100 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 9. কলাম */}
                <div className="space-y-1.5">
                  <span className="font-bold text-neutral-800 text-xs block">কলাম</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((cols) => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setColumnsCount(cols)}
                        className={`h-10 rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          columnsCount === cols
                            ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/20'
                            : 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200'
                        }`}
                      >
                        {Array.from({ length: cols }).map((_, cI) => (
                          <div key={cI} className="h-6 w-2.5 bg-neutral-300 rounded-xs"></div>
                        ))}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 10. কলাম ডিভাইডার */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="font-semibold text-neutral-800 text-xs">কলাম ডিভাইডার</span>
                  <button
                    type="button"
                    onClick={() => setShowColumnDivider(!showColumnDivider)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      showColumnDivider ? 'bg-emerald-600' : 'bg-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        showColumnDivider ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 11. প্রশ্নের নিচের গ্যাপ */}
                <div className="space-y-1 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  <div className="flex justify-between text-xs font-bold text-neutral-800">
                    <span>প্রশ্নের নিচের গ্যাপ</span>
                    <span className="font-mono text-neutral-600">{questionGap}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={questionGap}
                    onChange={(e) => setQuestionGap(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
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
