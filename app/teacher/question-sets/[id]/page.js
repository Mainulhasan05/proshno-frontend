'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchQuestionSetDetail, updateQuestionSet } from '@/store/slices/teacherSlice';
import apiClient from '@/store/api/apiClient';
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

/**
 * Mirrors the `paperSettings` subdocument on the QuestionSet model. Used both as the
 * initial state for a set saved before the field existed and as the merge base for
 * whatever the server returns.
 */
const DEFAULT_PAPER_SETTINGS = {
  // Header metadata
  showExamName: true,
  showClassName: true,
  showSubjectName: true,
  showChapterName: true,
  showSetCode: true,
  // Attachments / blocks
  showAnswerKey: false,
  showOMR: false,
  showImportant: false,
  importantColor: '#059669',
  showQuestionInfo: false,
  showStudentInfo: false,
  showSubjectCode: false,
  showMarksBox: false,
  showPageNumber: false,
  // Typography and layout
  textAlign: 'justify', // 'left' | 'center' | 'right' | 'justify'
  paperSize: 'A4', // 'A4' | 'Letter' | 'Legal' | 'A5'
  optionStyle: 'parentheses', // 'circle' | 'parentheses' | 'dot' | 'right_paren'
  fontFamily: 'bangla',
  fontSize: 14,
  columnsCount: 2, // 1 | 2 | 3
  showColumnDivider: true,
  questionGap: 0, // px
};

const OPTION_LAYOUTS = ['2x2', '4x1', '1x4'];

/**
 * Serialise the editable state into a comparable string.
 *
 * Only what actually gets saved is included, so toggling a question's hover state or
 * switching the mobile tab never makes the page claim there are unsaved changes. Keys
 * are sorted because object key order is not meaningful but would otherwise change the
 * result.
 */
function buildSnapshot(questionList, gridFormats, settings) {
  const ids = questionList.map((q) => q?._id).filter(Boolean);
  const layouts = ids
    .filter((id) => gridFormats[id])
    .map((id) => `${id}:${gridFormats[id]}`);
  const settingEntries = Object.keys(settings)
    .sort()
    .map((key) => `${key}=${settings[key]}`);

  return JSON.stringify({ ids, layouts, settings: settingEntries });
}

export default function QuestionSetDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { questionSetDetail, isLoading } = useSelector((state) => state.teacher);

  // Paper settings live in one object because they are saved as one unit — the server
  // stores them on the question set as `paperSettings`. Keeping them as ~20 separate
  // useState values made it impossible to tell what had changed since the last save.
  const [settings, setSettings] = useState(DEFAULT_PAPER_SETTINGS);

  // Destructured for reading so the rest of the component reads naturally.
  const {
    showExamName, showClassName, showSubjectName, showChapterName, showSetCode,
    showAnswerKey, showOMR, showImportant, importantColor,
    showQuestionInfo, showStudentInfo, showSubjectCode, showMarksBox, showPageNumber,
    textAlign, paperSize, optionStyle, fontFamily, fontSize,
    columnsCount, showColumnDivider, questionGap,
  } = settings;

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Editing mode is a transient view state, not a property of the paper, so it is not
  // part of `settings` and is never saved.
  const [editingMode, setEditingMode] = useState(false);

  // Mobile View Toggle State
  const [activeMobileTab, setActiveMobileTab] = useState('paper'); // 'paper' | 'settings'

  // Question & Interaction States
  const [questionList, setQuestionList] = useState([]);
  // Keyed by question id, not list position — a reorder must not reassign layouts.
  const [gridFormats, setGridFormats] = useState({});
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [exchangeTargetIdx, setExchangeTargetIdx] = useState(null);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [exchangeCandidates, setExchangeCandidates] = useState([]);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeError, setExchangeError] = useState('');

  // Snapshot of what the server last confirmed, so "unsaved changes" is a fact rather
  // than a guess.
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

  // Hydrate local editing state from whatever the server has stored for this set.
  useEffect(() => {
    if (!questionSetDetail?.questions) return;

    const items = questionSetDetail.questions.filter((item) => item?.questionId);
    const qList = items.map((item) => item.questionId);
    const layouts = {};
    for (const item of items) {
      if (item.optionLayout) layouts[String(item.questionId._id)] = item.optionLayout;
    }

    const loadedSettings = { ...DEFAULT_PAPER_SETTINGS, ...(questionSetDetail.paperSettings || {}) };

    queueMicrotask(() => {
      setQuestionList(qList);
      setGridFormats(layouts);
      setSettings(loadedSettings);
      setSavedSnapshot(buildSnapshot(qList, layouts, loadedSettings));
    });
  }, [questionSetDetail]);

  const qs = questionSetDetail;

  const currentSnapshot = useMemo(
    () => buildSnapshot(questionList, gridFormats, settings),
    [questionList, gridFormats, settings]
  );

  const isDirty = savedSnapshot !== null && currentSnapshot !== savedSnapshot;

  const handleSave = async () => {
    if (!params.id || !isDirty || isSaving) return;
    if (questionList.length === 0) {
      toast.error('প্রশ্ন সেটে অন্তত একটি প্রশ্ন থাকতে হবে');
      return;
    }

    setIsSaving(true);
    try {
      const questionIds = questionList.map((q) => q._id);
      // Only send layouts for questions still in the set, so removing a question also
      // drops its stale layout instead of leaving it to be reapplied later.
      const optionLayouts = {};
      for (const id of questionIds) {
        if (gridFormats[id]) optionLayouts[id] = gridFormats[id];
      }

      await dispatch(
        updateQuestionSet({
          id: params.id,
          body: { questionIds, optionLayouts, paperSettings: settings },
        })
      ).unwrap();

      setSavedSnapshot(currentSnapshot);
      toast.success('পরিবর্তনগুলো সংরক্ষণ করা হয়েছে');
    } catch (err) {
      // The thunk rejects with a plain string message; keep the object forms as a
      // fallback in case it is ever changed to pass the error envelope through.
      const message = typeof err === 'string' ? err : err?.error?.message || err?.message;
      toast.error(message || 'সংরক্ষণ করা যায়নি');
    } finally {
      setIsSaving(false);
    }
  };

  // Warn before losing unsaved edits to a navigation or tab close.
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const handlePrintDownload = () => {
    window.print();
  };

  const handleDeleteQuestion = (index) => {
    setQuestionList((prev) => prev.filter((_, idx) => idx !== index));
    toast.success('প্রশ্নটি মুছে ফেলা হয়েছে — সংরক্ষণ করতে "সেভ করুন" চাপুন');
  };

  const toggleGridFormat = (index) => {
    const questionId = questionList[index]?._id;
    if (!questionId) return;
    setGridFormats((prev) => {
      const currentIdx = OPTION_LAYOUTS.indexOf(prev[questionId] || OPTION_LAYOUTS[0]);
      const next = OPTION_LAYOUTS[(currentIdx + 1) % OPTION_LAYOUTS.length];
      return { ...prev, [questionId]: next };
    });
  };

  /**
   * Load replacement candidates for the question at `index`.
   *
   * Candidates are drawn from the same chapter and question type so the swap keeps the
   * paper coherent, and every question already in this set is excluded so the teacher
   * cannot introduce a duplicate (which the API would reject on save anyway).
   */
  const openExchangeModal = async (index) => {
    const target = questionList[index];
    if (!target) return;

    setExchangeTargetIdx(index);
    setExchangeModalOpen(true);
    setExchangeCandidates([]);
    setExchangeError('');
    setExchangeLoading(true);

    try {
      const chapterId = target.chapterId?._id || target.chapterId;
      const res = await apiClient.get('/teacher/content/questions', {
        params: {
          chapterId,
          type: target.type,
          excludeQuestionIds: questionList.map((q) => q._id).join(','),
          limit: 20,
        },
      });
      setExchangeCandidates(res?.data || []);
    } catch (err) {
      setExchangeError(err?.error?.message || 'বিকল্প প্রশ্ন লোড করা যায়নি');
    } finally {
      setExchangeLoading(false);
    }
  };

  const handleExchange = (candidate) => {
    if (exchangeTargetIdx === null) return;
    setQuestionList((prev) => {
      const list = [...prev];
      list[exchangeTargetIdx] = candidate;
      return list;
    });
    setExchangeModalOpen(false);
    toast.success('প্রশ্নটি প্রতিস্থাপন করা হয়েছে — সংরক্ষণ করতে "সেভ করুন" চাপুন');
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
            margin: 8mm 7mm 8mm 7mm;
          }
          html, body {
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: ${fontSize}px !important;
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
          .print-sheet > * {
            margin-top: 0 !important;
          }
          .print-sheet > *:first-child {
            margin-top: 0 !important;
          }
          .question-body-columns {
            column-gap: 14px !important;
          }
          .question-item {
            background: transparent !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            outline: none !important;
            padding: 0 !important;
            margin-bottom: ${Math.max(1, questionGap)}px !important;
            ring: none !important;
          }
          .question-item:hover {
            background: transparent !important;
            box-shadow: none !important;
            ring: none !important;
          }
          .print-header {
            padding-bottom: 4px !important;
            margin-bottom: 3px !important;
          }
          .print-header * {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .section-subheader {
            padding-bottom: 2px !important;
            margin-bottom: 2px !important;
          }
          .print-footer {
            padding-top: 3px !important;
            margin-top: 4px !important;
          }
          ${showPageNumber ? `
          @page {
            @bottom-center {
              content: counter(page);
              font-size: 8pt;
              font-family: sans-serif;
              color: #aaa;
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
                {isDirty && (
                  <span className="ml-2 font-bold text-amber-600">• অসংরক্ষিত পরিবর্তন</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <HiOutlineCheckCircle className="h-4 w-4" />
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সেভ করুন'}
            </button>

            <button
              onClick={handlePrintDownload}
              className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <HiOutlineDownload className="h-4 w-4" />
              ডাউনলোড
            </button>
          </div>
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
            <div className="print-sheet bg-white rounded-2xl border border-neutral-300 shadow-xl p-6 sm:p-8 space-y-3 font-serif text-neutral-900" style={{ fontFamily: getFontFamilyCSS() }}>
              {/* Header Box (Screenshot 9 & 10) */}
              <div className="print-header border-b-2 border-neutral-800 pb-2 text-center space-y-0.5">
                {/* Marks Box & Set Code - Top Row */}
                {(showMarksBox || showSetCode) && (
                  <div className="flex items-center justify-between mb-1">
                    {showMarksBox ? (
                      <div className="border-2 border-neutral-900 px-2 py-0.5 font-bold text-xs font-sans">
                        প্রাপ্ত নম্বর: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      </div>
                    ) : <div />}
                    {showSetCode ? (
                      <div className="border-2 border-neutral-900 px-2 py-0.5 font-bold text-xs">
                        সেট কোড: <span className="border border-neutral-900 px-1 py-0.5 ml-1">ক</span>
                      </div>
                    ) : <div />}
                  </div>
                )}

                {/* Exam Title */}
                {showExamName && (
                  <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                    {qs.name || 'New Educare'}
                  </h1>
                )}

                {/* Class Name */}
                {showClassName && (
                  <h2 className="text-sm font-bold text-neutral-800 leading-tight">
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
                  <div className="my-1.5 p-2 border border-neutral-800 rounded text-xs grid grid-cols-2 gap-2 text-left font-sans font-semibold">
                    <div>শিক্ষার্থীর নাম: ___________________________</div>
                    <div>রোল নম্বর: ___________________</div>
                  </div>
                )}

                {/* Meta Line: Time & Total Marks */}
                <div className="flex justify-between items-center text-xs font-bold text-neutral-900 pt-1.5 border-t border-neutral-200 mt-1.5">
                  <span>সময়— ৩০ মিনিট</span>
                  <span>পূর্ণমান— {totalMarks}</span>
                </div>

                {/* Notice Banner */}
                <div className="text-center text-xs font-bold text-neutral-800 pt-1 border-t border-neutral-200 mt-1">
                  প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেয়া যাবেনা।
                </div>
              </div>

              {/* Section Sub-Header */}
              <div className="section-subheader flex justify-between items-center text-xs font-bold text-neutral-900 border-b border-neutral-200 pb-1">
                <span>বহুনির্বাচনি অংশ:</span>
                <span>{questionList.length} × ১ = {questionList.length}</span>
              </div>

              {/* Question Paper Body */}
              <div
                style={{
                  fontSize: `${fontSize}px`,
                  textAlign: textAlign,
                  columnRule: columnsCount > 1 && showColumnDivider ? '1px solid #d4d4d4' : 'none',
                }}
                className={`question-body-columns ${
                  columnsCount === 1
                    ? 'block'
                    : columnsCount === 3
                    ? 'columns-1 sm:columns-3 gap-x-4'
                    : 'columns-1 sm:columns-2 gap-x-5'
                } text-neutral-900 leading-snug font-sans pt-1`}
              >
                {questionList.map((q, idx) => {
                  // Smart auto-format: 4x1 if options are long (> 20 chars), else 2x2
                  const maxOptLen = q.options ? Math.max(...q.options.map((o) => (o.text ? o.text.length : 0))) : 0;
                  const defaultFormat = maxOptLen > 20 ? '4x1' : '2x2';
                  const formatType = gridFormats[q._id] || defaultFormat;
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
                        marginBottom: `${Math.max(1, questionGap)}px`,
                        ...(showImportant ? { borderLeft: `2px solid ${importantColor}`, paddingLeft: '8px' } : {}),
                      }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="break-inside-avoid page-break-inside-avoid inline-block w-full align-top relative py-0.5 px-0 rounded-lg transition-colors hover:bg-neutral-50/60 group question-item"
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
                        className={`font-semibold flex items-start gap-1 leading-snug ${
                          editingMode ? 'outline-2 outline-dashed outline-emerald-400 bg-emerald-50/20 p-1 rounded' : ''
                        }`}
                      >
                        <span className="font-bold shrink-0">{toBengaliNumber(idx + 1)}.</span>
                        <div className="flex-1 min-w-0">
                          <MathRenderer text={q.questionText} />
                        </div>
                      </div>

                      {/* Options Grid */}
                      {q.type === 'MCQ' && q.options && (
                        <div className={`grid ${gridColsClass} gap-x-2 gap-y-0.5 pl-5 mt-0.5`}>
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              contentEditable={editingMode}
                              suppressContentEditableWarning={true}
                              className={`flex items-start gap-1 leading-snug ${
                                editingMode ? 'outline-1 outline-dashed outline-emerald-400 bg-emerald-50/10 p-0.5 rounded' : ''
                              }`}
                            >
                              <span className="font-bold shrink-0">
                                {renderOptionLabel(oIdx)}
                              </span>
                              <MathRenderer text={opt.text} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CQ Subparts */}
                      {q.type === 'CQ' && q.subParts && (
                        <div className="space-y-0.5 pl-5 text-xs mt-0.5">
                          {q.subParts.map((sp, spIdx) => (
                            <div key={spIdx} className="flex justify-between items-start leading-snug">
                              <div>
                                <span className="font-bold mr-1">{sp.partLabel}.</span>
                                <MathRenderer text={sp.text} />
                              </div>
                              <span className="font-semibold text-neutral-500 shrink-0 ml-2">[{sp.marks}]</span>
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
              <div className="print-footer pt-2 border-t-2 border-neutral-900 mt-4 flex items-center justify-between text-[10px] font-bold text-neutral-800 font-sans">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                  <span>Powered by <strong className="text-emerald-700 font-black text-xs">ProshnoPedia</strong> | প্রশ্নব্যাংক ও পরীক্ষা তৈরি</span>
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
                  { label: 'উত্তরপত্র', key: 'showAnswerKey', state: showAnswerKey },
                  { label: 'OMR সংযুক্ত', key: 'showOMR', state: showOMR },
                  { label: 'গুরুত্বপূর্ণ প্রশ্ন', key: 'showImportant', state: showImportant },
                  { label: 'প্রশ্নের তথ্য', key: 'showQuestionInfo', state: showQuestionInfo },
                  { label: 'শিক্ষার্থীর তথ্য', key: 'showStudentInfo', state: showStudentInfo },
                  { label: 'বিষয় কোড', key: 'showSubjectCode', state: showSubjectCode },
                  { label: 'প্রাপ্ত নম্বর ঘর', key: 'showMarksBox', state: showMarksBox },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <span className="font-medium text-neutral-700 text-xs">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => updateSetting(item.key, !item.state)}
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
                        onClick={() => updateSetting('textAlign', align.id)}
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
                        onClick={() => updateSetting('paperSize', size)}
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
                      onClick={() => updateSetting('showPageNumber', !showPageNumber)}
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
                        onClick={() => updateSetting('optionStyle', opt.id)}
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
                    onChange={(e) => updateSetting('fontFamily', e.target.value)}
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
                      onClick={() => updateSetting('fontSize', Math.max(10, fontSize - 1))}
                      className="h-6 w-6 rounded border bg-white font-bold text-neutral-700 hover:bg-neutral-100 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-xs bg-white border rounded py-0.5 font-mono">
                      {fontSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateSetting('fontSize', Math.min(24, fontSize + 1))}
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
                        onClick={() => updateSetting('columnsCount', cols)}
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
                    onClick={() => updateSetting('showColumnDivider', !showColumnDivider)}
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
                    onChange={(e) => updateSetting('questionGap', Number(e.target.value))}
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
            বর্তমান প্রশ্নটির পরিবর্তে একই অধ্যায় ও ধরনের বিকল্প প্রশ্ন নির্বাচন করুন:
          </p>

          {exchangeLoading && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-neutral-100 animate-pulse" />
              ))}
            </div>
          )}

          {!exchangeLoading && exchangeError && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-rose-700">
              {exchangeError}
            </div>
          )}

          {!exchangeLoading && !exchangeError && exchangeCandidates.length === 0 && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-500">
              এই অধ্যায়ে বিনিময়ের জন্য আর কোনো প্রশ্ন পাওয়া যায়নি।
            </div>
          )}

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {!exchangeLoading && !exchangeError && exchangeCandidates.map((altQ, aIdx) => {
              const tags = [];
              (altQ.boardInfo || []).forEach((b) => {
                const name = b.boardId?.shortForm || b.boardId?.name;
                if (name) tags.push(`[${name}${b.year ? ` '${String(b.year).slice(-2)}` : ''}]`);
              });
              (altQ.university || []).forEach((u) => {
                const name = u.universityId?.name || u.universityId?.shortForm;
                if (name) tags.push(`[${name}${u.year ? ` '${String(u.year).slice(-2)}` : ''}]`);
              });

              return (
                <div
                  key={altQ._id}
                  className="p-3.5 bg-neutral-50 hover:bg-emerald-50/40 border border-neutral-200 hover:border-emerald-400 rounded-xl transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-neutral-800 flex-1">
                      <span className="font-bold text-emerald-700 mr-1.5">{aIdx + 1}.</span>
                      <MathRenderer text={altQ.questionText} />
                    </div>
                    <div className="flex flex-wrap justify-end gap-1 shrink-0">
                      <span className="bg-neutral-200 text-neutral-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {altQ.marks ?? 1} নম্বর
                      </span>
                      {tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="bg-yellow-300 text-amber-900 border border-yellow-400 font-bold px-2 py-0.5 rounded text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {altQ.type === 'MCQ' && altQ.options?.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 pl-4 text-neutral-600 text-[11px]">
                      {altQ.options.map((o, oi) => (
                        <div key={oi}>
                          ({['ক', 'খ', 'গ', 'ঘ', 'ঙ'][oi] || oi + 1}) <MathRenderer text={o.text} />
                        </div>
                      ))}
                    </div>
                  )}

                  {altQ.type === 'CQ' && altQ.subParts?.length > 0 && (
                    <div className="pl-4 text-neutral-600 text-[11px] space-y-0.5">
                      {altQ.subParts.map((sp, si) => (
                        <div key={si}>
                          <span className="font-bold mr-1">{sp.partLabel}.</span>
                          <MathRenderer text={sp.text} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleExchange(altQ)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      বিনিময় করুন
                    </Button>
                  </div>
                </div>
              );
            })}
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
