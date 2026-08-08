'use client';

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuth from '@/hooks/useAuth';
import apiClient from '@/store/api/apiClient';
import Button from '@/components/ui/Button';
import {
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlinePrinter,
  HiOutlineDownload,
  HiOutlineCube,
  HiOutlineUpload,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineCheck,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';

/** Human labels for the ledger `reason` enum returned by the API. */
const LEDGER_REASON_LABELS = {
  package_purchase: 'প্যাকেজ ক্রয় (টোকেন যোগ)',
  purchase_refunded: 'ক্রয় ফেরত (টোকেন কর্তন)',
  exam_token_created: 'ওএমআর পরীক্ষা তৈরি',
  sheet_evaluated: 'উত্তরপত্র মূল্যায়ন',
  evaluation_refunded: 'মূল্যায়ন ফেরত',
  admin_adjustment: 'অ্যাডমিন সমন্বয়',
};

const bubbleOptions = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
const englishBubbleOptions = ['A', 'B', 'C', 'D', 'E'];

const colorThemes = [
  { name: 'রয়্যাল ব্লু (Royal Blue)', value: 'blue', hex: '#2563EB', bg: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-600' },
  { name: 'রুবি রেড (Ruby Red)', value: 'red', hex: '#DC2626', bg: 'bg-red-600', border: 'border-red-600', text: 'text-red-600' },
  { name: 'ডিপ পিঙ্ক (Deep Pink)', value: 'pink', hex: '#DB2777', bg: 'bg-pink-600', border: 'border-pink-600', text: 'text-pink-600' },
  { name: 'ফরেস্ট গ্রিন (Forest Green)', value: 'green', hex: '#16A34A', bg: 'bg-green-600', border: 'border-green-600', text: 'text-green-600' },
  { name: 'চারকোল (Charcoal)', value: 'gray', hex: '#374151', bg: 'bg-gray-700', border: 'border-gray-700', text: 'text-gray-700' },
  { name: 'ভায়োলেট (Violet)', value: 'violet', hex: '#7C3AED', bg: 'bg-violet-600', border: 'border-violet-600', text: 'text-violet-600' },
  { name: 'গোল্ডেন ইয়েলো (Gold)', value: 'amber', hex: '#D97706', bg: 'bg-amber-600', border: 'border-amber-600', text: 'text-amber-600' },
];

export default function TeacherOMRPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('design'); // 'design' | 'evaluate'
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- OMR DESIGN CONFIG STATES ---
  // Exams come from the server. They used to be a hardcoded array in component state,
  // so a printed sheet carried a code the backend had never issued and could never be
  // graded against.
  const [examTokens, setExamTokens] = useState([]);
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [creatingToken, setCreatingToken] = useState(false);

  // New Token Modal states
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenTitle, setTokenTitle] = useState('');
  const [tokenTemplate, setTokenTemplate] = useState('SIGNATURE');
  const [tokenQuestions, setTokenQuestions] = useState('40');
  const [tokenNegativeMarks, setTokenNegativeMarks] = useState('0.25');

  const [downloading, setDownloading] = useState(false);
  const [templateMode, setTemplateMode] = useState('SIGNATURE'); // 'SIGNATURE' | 'GENERAL'
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState('');
  // Seeded from the logged-in teacher but editable per sheet. Held as an override
  // rather than synced in an effect, so the field is correct on first paint and never
  // needs a render pass to catch up with `user`.
  const [institutionOverride, setInstitutionName] = useState(null);
  const institutionName = institutionOverride ?? (user?.institutionName || '');
  const [examTitle, setExamTitle] = useState('');
  const [className, setClassName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [examDate, setExamDate] = useState(new Date().toLocaleDateString('bn-BD'));

  const [headerMode, setHeaderMode] = useState('BIG'); // 'BIG' | 'SMALL'
  const [entryMode, setEntryMode] = useState('DIGITAL'); // 'DIGITAL' | 'MANUAL'
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]); // Default Royal Blue
  const [titleSize, setTitleSize] = useState(20); // 16 - 28px
  const [subtitleSize, setSubtitleSize] = useState(13); // 10 - 18px

  const [columns, setColumns] = useState(2);
  const [optionsPerQuestion, setOptionsPerQuestion] = useState('4');
  const [bubbleShape, setBubbleShape] = useState('circle');
  const [showRollGrid, setShowRollGrid] = useState(true);
  const [rollDigits, setRollDigits] = useState('6');
  const [showSetCodeGrid, setShowSetCodeGrid] = useState(true);

  const [totalQuestionsCount, setTotalQuestionsCount] = useState('40');
  const [customQuestionCount, setCustomQuestionCount] = useState(false);

  // --- OMR EVALUATION STATES ---
  // The token balance is server state; the page only mirrors it. It previously
  // defaulted to 150 and was decremented locally, so the number on screen had no
  // relationship to what the account actually held.
  const [tokenBalance, setTokenBalance] = useState(0);
  const [ledger, setLedger] = useState([]);

  const [evalExamId, setEvalExamId] = useState('');
  const [savingAnswerKey, setSavingAnswerKey] = useState(false);

  // Only the teacher's *edits* are stored; the full answer key and answer sheet are
  // derived from the selected exam during render. Holding the whole array in state
  // meant an effect had to rebuild it whenever the exam changed, which is both a
  // cascading render and a source of stale-form bugs.
  const [keyEdits, setKeyEdits] = useState({});
  const [answerEdits, setAnswerEdits] = useState({});

  const [entryRoll, setEntryRoll] = useState('');
  const [entrySetCode, setEntrySetCode] = useState('');
  const [entryStudentName, setEntryStudentName] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const [results, setResults] = useState([]);
  const [examSummary, setExamSummary] = useState(null);

  /** Refresh the authoritative balance and statement from the server. */
  const refreshBalance = useCallback(async () => {
    try {
      const res = await apiClient.get('/teacher/omr/balance');
      setTokenBalance(res.data?.balance ?? 0);
      setLedger(res.data?.ledger || []);
    } catch (err) {
      console.error('Failed to load OMR token balance', err);
    }
  }, []);

  const refreshExams = useCallback(async () => {
    try {
      const res = await apiClient.get('/teacher/omr/exams');
      setExamTokens(res.data || []);
    } catch (err) {
      console.error('Failed to load OMR exams', err);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [qSetsRes] = await Promise.all([
          apiClient.get('/teacher/question-sets'),
          refreshBalance(),
          refreshExams(),
        ]);
        setQuestionSets(qSetsRes.data || []);
      } catch (err) {
        console.error('Failed to load data for OMR generator', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshBalance, refreshExams]);

  const selectedEvalExam = useMemo(
    () => examTokens.find((t) => t._id === evalExamId) || null,
    [examTokens, evalExamId]
  );

  /** The exam the designer is currently laying out a sheet for, if any. */
  const linkedExam = useMemo(
    () => examTokens.find((t) => t._id === selectedTokenId) || null,
    [examTokens, selectedTokenId]
  );

  /**
   * The answer key shown in the editor: the exam's saved key, with any unsaved edits
   * layered on top. `questionNo in keyEdits` rather than a falsy check, so deselecting
   * an option (edit value `null`) correctly overrides a saved answer.
   */
  const answerKeyDraft = useMemo(() => {
    if (!selectedEvalExam) return [];
    const saved = new Map((selectedEvalExam.answerKey || []).map((e) => [e.questionNo, e.correctOption]));
    return Array.from({ length: selectedEvalExam.totalQuestions }, (_, i) => {
      const questionNo = i + 1;
      return {
        questionNo,
        correctOption: questionNo in keyEdits ? keyEdits[questionNo] : saved.get(questionNo) ?? null,
      };
    });
  }, [selectedEvalExam, keyEdits]);

  /** The sheet being entered. Always starts blank for each student. */
  const entryAnswers = useMemo(() => {
    if (!selectedEvalExam) return [];
    return Array.from({ length: selectedEvalExam.totalQuestions }, (_, i) => ({
      questionNo: i + 1,
      marked: answerEdits[i + 1] ?? null,
    }));
  }, [selectedEvalExam, answerEdits]);

  /** Load saved results whenever the selected exam changes. */
  useEffect(() => {
    if (!evalExamId) return undefined;

    let cancelled = false;
    const loadResults = async () => {
      try {
        const [resultsRes, summaryRes] = await Promise.all([
          apiClient.get('/teacher/omr/results', { params: { examTokenId: evalExamId, limit: 100 } }),
          apiClient.get(`/teacher/omr/exams/${evalExamId}/summary`),
        ]);
        if (cancelled) return;
        setResults(resultsRes.data || []);
        setExamSummary(summaryRes.data || null);
      } catch (err) {
        if (!cancelled) console.error('Failed to load OMR results', err);
      }
    };
    loadResults();

    return () => {
      cancelled = true;
    };
  }, [evalExamId]);

  /**
   * Switch the exam being evaluated, clearing everything tied to the previous one so no
   * result, summary, or half-entered sheet can bleed across exams.
   */
  const handleSelectExam = useCallback((examId) => {
    setEvalExamId(examId);
    setKeyEdits({});
    setAnswerEdits({});
    setEntryRoll('');
    setEntrySetCode('');
    setEntryStudentName('');
    setLastResult(null);
    setResults([]);
    setExamSummary(null);
  }, []);

  const refreshResults = useCallback(async (examId) => {
    if (!examId) return;
    try {
      const [resultsRes, summaryRes] = await Promise.all([
        apiClient.get('/teacher/omr/results', { params: { examTokenId: examId, limit: 100 } }),
        apiClient.get(`/teacher/omr/exams/${examId}/summary`),
      ]);
      setResults(resultsRes.data || []);
      setExamSummary(summaryRes.data || null);
    } catch (err) {
      console.error('Failed to refresh OMR results', err);
    }
  }, []);

  const handleSaveAnswerKey = async () => {
    if (!evalExamId) return;
    setSavingAnswerKey(true);
    try {
      await apiClient.put(`/teacher/omr/exams/${evalExamId}/answer-key`, {
        answerKey: answerKeyDraft,
      });
      await refreshExams();
      toast.success('উত্তরপত্র কী সংরক্ষণ করা হয়েছে');
    } catch (err) {
      toast.error(err?.error?.message || 'উত্তরপত্র কী সংরক্ষণ করা যায়নি');
    } finally {
      setSavingAnswerKey(false);
    }
  };

  const handleEvaluate = async () => {
    if (!evalExamId || !entryRoll.trim()) {
      toast.error('রোল নম্বর দিন');
      return;
    }

    setEvaluating(true);
    try {
      const res = await apiClient.post(`/teacher/omr/exams/${evalExamId}/evaluate`, {
        rollNumber: entryRoll.trim(),
        setCode: entrySetCode.trim(),
        studentName: entryStudentName.trim(),
        answers: entryAnswers,
      });
      setLastResult(res.data);
      toast.success(res.message || 'মূল্যায়ন সম্পন্ন হয়েছে');

      // Clear the sheet for the next student but keep the exam and set code, which are
      // the same across a stack of papers.
      setEntryRoll('');
      setEntryStudentName('');
      setAnswerEdits({});

      await Promise.all([refreshBalance(), refreshResults(evalExamId)]);
    } catch (err) {
      toast.error(err?.error?.message || 'মূল্যায়ন করা যায়নি');
    } finally {
      setEvaluating(false);
    }
  };

  const handleDeleteResult = async (resultId) => {
    try {
      await apiClient.delete(`/teacher/omr/results/${resultId}`);
      await refreshResults(evalExamId);
      toast.success('ফলাফল মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err?.error?.message || 'ফলাফল মুছে ফেলা যায়নি');
    }
  };

  // Safe numeric parsing helper
  const getSafeNum = (val, fallback) => {
    if (val === '' || val === null || isNaN(Number(val))) return fallback;
    return Number(val);
  };

  // Convert numbers to Bangla digits
  const toBanglaDigits = (num) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (digit) => banglaDigits[digit]);
  };

  // Blur handlers to enforce proper ranges [10-100] for questions
  const handleQuestionsCountBlur = () => {
    if (totalQuestionsCount === '') {
      setTotalQuestionsCount('40');
      return;
    }
    const val = Number(totalQuestionsCount);
    if (isNaN(val)) {
      setTotalQuestionsCount('40');
    } else {
      setTotalQuestionsCount(String(Math.min(100, Math.max(10, val))));
    }
  };

  const handleOptionsCountBlur = () => {
    if (optionsPerQuestion === '') {
      setOptionsPerQuestion('4');
      return;
    }
    const val = Number(optionsPerQuestion);
    if (isNaN(val)) {
      setOptionsPerQuestion('4');
    } else {
      setOptionsPerQuestion(String(Math.min(5, Math.max(2, val))));
    }
  };

  const handleRollDigitsBlur = () => {
    if (rollDigits === '') {
      setRollDigits('6');
      return;
    }
    const val = Number(rollDigits);
    if (isNaN(val)) {
      setRollDigits('6');
    } else {
      setRollDigits(String(Math.min(8, Math.max(3, val))));
    }
  };

  const finalTotalQuestions = getSafeNum(totalQuestionsCount, 40);
  const finalOptionsPerQuestion = getSafeNum(optionsPerQuestion, 4);
  const finalRollDigits = getSafeNum(rollDigits, 6);

  // Auto-calculated parameters
  const actualQuestionsPerColumn = Math.ceil(finalTotalQuestions / columns);
  const actualQuestionCount = finalTotalQuestions;

  // Dynamic color theme selector
  const themeHex = templateMode === 'GENERAL' ? '#171717' : selectedTheme.hex;

  // Dynamic styling for single-page coverage of up to 100 questions
  const isHighDensity = actualQuestionsPerColumn > 16;
  const bubbleSizeClass = isHighDensity 
    ? 'h-3.5 w-3.5 text-[7px] border-[1px] font-bold' 
    : 'h-5 w-5 text-[9px] border-2';
  
  const rowSpacingClass = isHighDensity 
    ? 'gap-1 py-0' 
    : 'gap-2.5 py-0.5';
  
  const sheetPaddingClass = isHighDensity 
    ? 'p-[8mm] pb-[4mm]' 
    : 'p-[12mm]';
  
  const topBarSpacingClass = isHighDensity
    ? 'mb-3'
    : 'mb-6';

  // The answer grid is `columns × questionsPerColumn × optionsPerQuestion` elements —
  // 400+ for a typical 100-question, 4-option sheet. It depends only on the sheet
  // layout, so it is memoised rather than rebuilt on every keystroke in the unrelated
  // configuration inputs (exam name, roll digits, question-set selection, …).
  const bubbleGrid = useMemo(() => (
    Array.from({ length: columns }).map((_, colIndex) => {
      const startIdx = colIndex * actualQuestionsPerColumn + 1;
      const endIdx = Math.min(startIdx + actualQuestionsPerColumn - 1, finalTotalQuestions);

      if (startIdx > finalTotalQuestions) return null;

      return (
        <div key={colIndex} className="space-y-1 bg-white border border-transparent px-2 py-0.5">
          {Array.from({ length: endIdx - startIdx + 1 }).map((_, rowIdx) => {
            const qNumber = startIdx + rowIdx;
            return (
              <div key={qNumber} className={`flex items-center ${rowSpacingClass} rounded`}>
                <span className="text-[9px] font-black w-4.5 text-right text-neutral-500 mr-1.5">{qNumber}.</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: finalOptionsPerQuestion }).map((_, optIndex) => (
                    <div key={optIndex} className="flex items-center">
                      <div
                        className={`flex items-center justify-center font-extrabold transition-all ${bubbleSizeClass}`}
                        style={{
                          borderColor: selectedTheme.hex,
                          color: selectedTheme.hex,
                          borderRadius: bubbleShape === 'square' ? '4px' : '999px'
                        }}
                      >
                        {bubbleOptions[optIndex]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    })
  ), [
    columns,
    actualQuestionsPerColumn,
    finalTotalQuestions,
    finalOptionsPerQuestion,
    rowSpacingClass,
    bubbleSizeClass,
    bubbleShape,
    selectedTheme.hex,
  ]);
  
  const headerBottomSpacingClass = isHighDensity 
    ? 'pb-2.5 mb-3' 
    : 'pb-4 mb-5';
  
  const studentInfoSpacingClass = isHighDensity 
    ? 'pb-2.5 mb-3' 
    : 'pb-5 mb-5';
    
  const rollBubbleSizeClass = isHighDensity
    ? 'h-3 w-3 text-[7px] border-[1px]'
    : 'h-3.5 w-3.5 text-[8px] border-[1px]';
    
  const instructionBoxSpacingClass = isHighDensity 
    ? 'p-2 text-[9px]' 
    : 'p-3 text-[10px]';

  // Handle Question Set Selection (in design tab)
  const handleQuestionSetChange = (e) => {
    const id = e.target.value;
    setSelectedQuestionSetId(id);
    if (id) {
      const qSet = questionSets.find(q => q._id === id);
      if (qSet) {
        setTotalQuestionsCount(String(qSet.totalQuestions || 40));
        setCustomQuestionCount(false);
        if (qSet.totalQuestions <= 20) {
          setColumns(1);
        } else if (qSet.totalQuestions <= 40) {
          setColumns(2);
        } else if (qSet.totalQuestions <= 60) {
          setColumns(3);
        } else {
          setColumns(4);
        }
        if (qSet.name) setExamTitle(qSet.name);
      }
    }
  };

  // Change question count presets
  const applyPreset = (count) => {
    setTotalQuestionsCount(String(count));
    setCustomQuestionCount(false);
    if (count === 40) {
      setColumns(2);
    } else if (count === 60) {
      setColumns(3);
    } else if (count === 80) {
      setColumns(4);
    } else if (count === 100) {
      setColumns(4);
    }
  };

  const handleDownloadPDF = async () => {
    if (typeof window !== 'undefined') {
      const original = document.querySelector('.print-sheet');
      if (!original) return;

      setDownloading(true);

      // Create an isolated container to prevent sidebar overlap/clipping
      const tempDiv = document.createElement('div');
      tempDiv.className = original.className;
      tempDiv.innerHTML = original.innerHTML;

      // Reset print container dimensions and positioning for clean canvas rendering
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '12mm';
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.color = '#111827';

      // Temporarily append to body
      document.body.appendChild(tempDiv);
      
      const opt = {
        margin:       [8, 8, 8, 8],
        filename:     `${institutionName || 'OMR'}_sheet.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 3, 
          useCORS: true, 
          logging: false,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // html2pdf is a project dependency loaded on demand, not a <script> injected from a
      // third-party CDN. The previous approach fetched ~200 KB from cdnjs with no
      // Subresource Integrity hash, so a compromised or spoofed CDN response would have
      // executed with full privileges inside an authenticated teacher session. A dynamic
      // import keeps it out of the initial bundle while removing that exposure — and the
      // export no longer depends on an external host being reachable.
      try {
        const { default: html2pdf } = await import('html2pdf.js');
        await html2pdf().set(opt).from(tempDiv).save();
      } catch (err) {
        console.error(err);
        alert('PDF জেনারেটর লোড করতে ব্যর্থ হয়েছে, বিকল্প হিসেবে প্রিন্ট উইন্ডো ওপেন হচ্ছে।');
        window.print();
      } finally {
        if (tempDiv.parentNode) document.body.removeChild(tempDiv);
        setDownloading(false);
      }
    }
  };

  /**
   * Create a real exam on the server. The token is charged server-side as part of
   * creation, so the balance shown afterwards is the balance that actually exists.
   */
  const handleGenerateToken = async () => {
    if (!tokenTitle.trim()) {
      toast.error('পরীক্ষার টাইটেল দিন');
      return;
    }
    const qCount = Number(tokenQuestions);
    if (isNaN(qCount) || qCount < 10 || qCount > 100) {
      toast.error('মোট প্রশ্ন সংখ্যা ১০ থেকে ১০০ এর মধ্যে হতে হবে');
      return;
    }

    setCreatingToken(true);
    try {
      const res = await apiClient.post('/teacher/omr/exams', {
        title: tokenTitle.trim(),
        templateMode: tokenTemplate,
        totalQuestions: qCount,
        optionsPerQuestion: finalOptionsPerQuestion,
        negativeMarks: Number(tokenNegativeMarks) || 0,
      });

      const created = res.data;
      await Promise.all([refreshExams(), refreshBalance()]);
      setShowTokenModal(false);

      // Load the new exam into the designer so the printed sheet matches it.
      setSelectedTokenId(created._id);
      setTemplateMode(created.templateMode);
      setTotalQuestionsCount(String(created.totalQuestions));
      setExamTitle(created.title);
      setCustomQuestionCount(true);

      toast.success(`টোকেন তৈরি হয়েছে — কোড: ${created.code}`);
    } catch (err) {
      toast.error(err?.error?.message || 'টোকেন তৈরি করা যায়নি');
    } finally {
      setCreatingToken(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await apiClient.delete(`/teacher/omr/exams/${examId}`);
      await refreshExams();
      if (evalExamId === examId) handleSelectExam('');
      if (selectedTokenId === examId) setSelectedTokenId('');
      toast.success('ওএমআর পরীক্ষা মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err?.error?.message || 'মুছে ফেলা যায়নি');
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* ─── HEADER / CONTROLS (NO PRINT) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
        <div>
          <h1 className="text-2xl font-black text-neutral-800 tracking-tight flex items-center gap-2">
            <HiOutlineDocumentText className="h-7 w-7 text-[#0F5132]" />
            OMR হাব (ওএমআর শিট কাস্টমাইজেশন ও মূল্যায়ন)
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">প্রিন্ট-রেডি OMR শিট জেনারেট করুন এবং আপলোড করে সাথে সাথে খাতা মূল্যায়ন করুন</p>
        </div>

        {activeTab === 'design' ? (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Button 
              onClick={handleDownloadPDF} 
              disabled={downloading}
              variant="primary" 
              size="md" 
              className="flex items-center gap-1.5 font-bold shadow-md bg-[#0f5132] hover:bg-[#072617] disabled:opacity-70"
            >
              {downloading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>পিডিএফ তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <HiOutlineDownload className="h-5 w-5" />
                  <span>OMR শিট ডাউনলোড করুন</span>
                </>
              )}
            </Button>
            <span className="text-[10px] text-neutral-400 no-print">সরাসরি পিডিএফ ফাইল ডাউনলোড হবে</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
            <span className="text-xs font-bold text-emerald-800">ওএমআর ব্যালেন্স:</span>
            <span className="text-sm font-black text-[#0B3B24]">{tokenBalance} টি টোকেন</span>
          </div>
        )}
      </div>

      {/* ─── TRIPLE TABS (NO PRINT) ─── */}
      <div className="flex border-b border-neutral-200 mb-6 no-print">
        <button
          onClick={() => setActiveTab('design')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'design'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <HiOutlineCog className="h-5 w-5" />
          ওএমআর ডিজাইন ল্যাব
        </button>
        
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tokens'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <HiOutlineClipboardList className="h-5 w-5" />
          আমার ওএমআর টোকেনসমূহ
        </button>

        <button
          onClick={() => setActiveTab('evaluate')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'evaluate'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <HiOutlineSparkles className="h-5 w-5" />
          ওএমআর মূল্যায়ন ও স্ক্যানার
        </button>
      </div>

      {/* ─── TAB 1: DESIGN WORKSPACE ─── */}
      {activeTab === 'design' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Panel: Customizer Controls (no-print) */}
          <div className="xl:col-span-4 space-y-6 no-print">
            
            {/* Step 1: OMR Template Selector */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-neutral-800 text-sm flex items-center gap-2 border-b pb-2.5">
                <span className="h-5 w-5 rounded-md bg-[#0F5132] text-white text-xs font-black flex items-center justify-center">১</span>
                ওএমআর টেমপ্লেট নির্বাচন
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-2">ডিজাইন ফরম্যাট নির্বাচন করুন</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { mode: 'SIGNATURE', label: 'সিগনেচার মোড', desc: 'রঙিন ও সম্পূর্ণ স্ক্যানযোগ্য' },
                    { mode: 'GENERAL', label: 'সাধারণ মোড', desc: 'সাধারণ সাদা-কালো ফরম্যাট' }
                  ].map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => setTemplateMode(item.mode)}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        templateMode === item.mode
                          ? 'bg-[#0f5132]/5 text-[#0f5132] border-[#0f5132] ring-2 ring-[#0f5132]/10'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{item.label}</div>
                      <div className="text-[9px] opacity-75 mt-0.5 font-medium leading-tight">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Question Set & Preset */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-neutral-800 text-sm flex items-center gap-2 border-b pb-2.5">
                <span className="h-5 w-5 rounded-md bg-[#0F5132] text-white text-xs font-black flex items-center justify-center">২</span>
                প্রশ্ন সেট ও ওএমআর টোকেন লিঙ্ক
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-neutral-600">সক্রিয় ওএমআর টোকেন লিঙ্ক করুন</label>
                    <button 
                      onClick={() => {
                        setTokenTitle('');
                        setTokenQuestions('40');
                        setShowTokenModal(true);
                      }}
                      className="text-[10px] text-emerald-700 hover:text-emerald-950 font-black cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                    >
                      + নতুন টোকেন তৈরী
                    </button>
                  </div>
                  <select 
                    value={selectedTokenId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedTokenId(id);
                      if (id) {
                        const tok = examTokens.find((t) => t._id === id);
                        if (tok) {
                          setTemplateMode(tok.templateMode);
                          setTotalQuestionsCount(String(tok.totalQuestions));
                          setOptionsPerQuestion(String(tok.optionsPerQuestion || 4));
                          setExamTitle(tok.title);
                          setCustomQuestionCount(true);
                        }
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none font-semibold text-neutral-700"
                  >
                    <option value="">কোনো টোকেন লিঙ্ক নেই (ম্যানুয়াল)</option>
                    {examTokens.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">অথবা প্রশ্ন সেট বেছে নিন</label>
                  <select 
                    value={selectedQuestionSetId} 
                    onChange={handleQuestionSetChange}
                    disabled={!!selectedTokenId}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs md:text-sm bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none font-semibold text-neutral-700 disabled:bg-neutral-50 disabled:text-neutral-400"
                  >
                    <option value="">ম্যানুয়াল কাস্টমাইজেশন</option>
                    {questionSets.map((q) => (
                      <option key={q._id} value={q._id}>
                        {q.name} ({q.totalQuestions} টি প্রশ্ন)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">দ্রুত বাবল প্রিসেট</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[40, 60, 80, 100].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => applyPreset(count)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          totalQuestionsCount === count && !customQuestionCount
                            ? 'bg-[#0f5132] text-white border-[#0f5132] shadow-sm'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {count}টি বাবল
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Ink color theme selector */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-neutral-800 text-sm flex items-center gap-2 border-b pb-2.5">
                <span className="h-5 w-5 rounded-md bg-[#0F5132] text-white text-xs font-black flex items-center justify-center">৩</span>
                কালার থিম (Ink Theme)
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-2">OMR শিট কালার নির্বাচন করুন</label>
                <div className="flex flex-wrap gap-2.5">
                  {colorThemes.map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => setSelectedTheme(theme)}
                      title={theme.name}
                      className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${theme.bg} ${
                        selectedTheme.value === theme.value 
                          ? 'ring-4 ring-offset-2 ring-emerald-600 border-white'
                          : 'border-transparent'
                      }`}
                    >
                      {selectedTheme.value === theme.value && (
                        <HiOutlineCheck className="h-4 w-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400 mt-2">বাস্তব ওএমআর প্রিন্ট করার সময় রঙিন ড্রপআউট কালি ব্যবহারের উদ্দেশ্যে এই কালারগুলো সাহায্য করবে।</p>
              </div>
            </div>

            {/* Step 4: Branding & Header configuration */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-neutral-800 text-sm flex items-center gap-2 border-b pb-2.5">
                <span className="h-5 w-5 rounded-md bg-[#0F5132] text-white text-xs font-black flex items-center justify-center">৪</span>
                ব্র্যান্ডিং ও তথ্য
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">হেডার সাইজ</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['BIG', 'SMALL'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setHeaderMode(mode)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          headerMode === mode
                            ? 'bg-[#0f5132] text-white border-[#0f5132]'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {mode === 'BIG' ? 'বড় হেডার (BIG)' : 'ছোট হেডার (SMALL)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">পরীক্ষার্থী তথ্য পূরণ পদ্ধতি</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['DIGITAL', 'MANUAL'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setEntryMode(mode)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          entryMode === mode
                            ? 'bg-[#0f5132] text-white border-[#0f5132]'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {mode === 'DIGITAL' ? 'ওএমআর বাবল (Digital)' : 'হাতে লেখা (Manual)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">প্রতিষ্ঠানের নাম</label>
                  <input 
                    type="text" 
                    value={institutionName} 
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="যেমন: মতিঝিল আইডিয়াল স্কুল"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-neutral-400">সাইজ: {titleSize}px</span>
                    <input 
                      type="range" 
                      min="16" 
                      max="28" 
                      value={titleSize} 
                      onChange={(e) => setTitleSize(Number(e.target.value))}
                      className="flex-1 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#0F5132]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">পরীক্ষার নাম</label>
                  <input 
                    type="text" 
                    value={examTitle} 
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="যেমন: বার্ষিক পরীক্ষা ২০২৬"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-neutral-400">সাইজ: {subtitleSize}px</span>
                    <input 
                      type="range" 
                      min="11" 
                      max="18" 
                      value={subtitleSize} 
                      onChange={(e) => setSubtitleSize(Number(e.target.value))}
                      className="flex-1 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#0F5132]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">শ্রেণি</label>
                    <input 
                      type="text" 
                      value={className} 
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="যেমন: ৩য় শ্রেণি"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">বিষয়</label>
                    <input 
                      type="text" 
                      value={subjectName} 
                      onChange={(e) => setSubjectName(e.target.value)}
                      placeholder="যেমন: ইংরেজি"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">তারিখ</label>
                  <input 
                    type="text" 
                    value={examDate} 
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Fine-tuning configurations */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-neutral-800 text-sm flex items-center gap-2 border-b pb-2.5">
                <span className="h-5 w-5 rounded-md bg-[#0F5132] text-white text-xs font-black flex items-center justify-center">৫</span>
                ওএমআর লেআউট সেটিংস
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-600">কাস্টম প্রশ্ন সংখ্যা?</span>
                  <input 
                    type="checkbox" 
                    checked={customQuestionCount}
                    onChange={(e) => setCustomQuestionCount(e.target.checked)}
                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                </div>

                {customQuestionCount && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">মোট প্রশ্ন সংখ্যা</label>
                    <input 
                      type="number" 
                      value={totalQuestionsCount}
                      onChange={(e) => setTotalQuestionsCount(e.target.value)}
                      onBlur={handleQuestionsCountBlur}
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                      min="10"
                      max="100"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">কলাম সংখ্যা</label>
                    <select 
                      value={columns} 
                      onChange={(e) => setColumns(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-xs bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                    >
                      <option value={1}>১ কলাম</option>
                      <option value={2}>২ কলাম</option>
                      <option value={3}>৩ কলাম</option>
                      <option value={4}>৪ কলাম</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">কলামে প্রশ্ন সংখ্যা</label>
                    <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs font-bold text-neutral-700 select-none">
                      {actualQuestionsPerColumn} টি (স্বয়ংক্রিয়)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">অপশন সংখ্যা (ক-ঙ)</label>
                    <input 
                      type="number" 
                      value={optionsPerQuestion}
                      onChange={(e) => setOptionsPerQuestion(e.target.value)}
                      onBlur={handleOptionsCountBlur}
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                      min="2"
                      max="5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">বাবল আকৃতি</label>
                    <select 
                      value={bubbleShape} 
                      onChange={(e) => setBubbleShape(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-xs bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                    >
                      <option value="circle">বৃত্ত (Circle)</option>
                      <option value="square">বর্গ (Square)</option>
                    </select>
                  </div>
                </div>

                {entryMode === 'DIGITAL' && (
                  <div className="border-t pt-3.5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-600">রোল বাবল গ্রিড দেখান</span>
                      <input 
                        type="checkbox" 
                        checked={showRollGrid}
                        onChange={(e) => setShowRollGrid(e.target.checked)}
                        className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                    </div>

                    {showRollGrid && (
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1">রোল নাম্বার ডিজিট সংখ্যা</label>
                        <input 
                          type="number" 
                          value={rollDigits}
                          onChange={(e) => setRollDigits(e.target.value)}
                          onBlur={handleRollDigitsBlur}
                          className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                          min="3"
                          max="8"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-xs font-bold text-neutral-600">সেট কোড বাবল গ্রিড দেখান</span>
                      <input 
                        type="checkbox" 
                        checked={showSetCodeGrid}
                        onChange={(e) => setShowSetCodeGrid(e.target.checked)}
                        className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Panel: OMR Sheet Live Preview (Printable) */}
          <div className="xl:col-span-8 flex justify-center">
            
            <div className={`print-sheet bg-white relative border border-neutral-300 shadow-xl rounded-xl ${sheetPaddingClass} w-full max-w-[210mm] text-neutral-900 leading-tight select-none`}>
              
              {/* ─── CORNER ALIGNMENT MARKS (SQUARES FOR CV SCANNER) ─── */}
              <div className="absolute top-[8mm] left-[8mm] h-6 w-6 bg-black" />
              <div className="absolute top-[8mm] right-[8mm] h-6 w-6 bg-black" />
              <div className="absolute bottom-[8mm] left-[8mm] h-6 w-6 bg-black" />
              <div className="absolute bottom-[8mm] right-[8mm] h-6 w-6 bg-black" />

              {/* ─── TOP TIMING CALIBRATION TRACKS ─── */}
              <div className={`w-[85%] mx-auto flex items-center justify-between h-3.5 ${topBarSpacingClass} px-4`}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className={`h-2.5 w-4 shrink-0 ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />
                ))}
              </div>

              {/* ─── SIDE TIMING TRACKS (Vertical alignment bars on border) ─── */}
              <div className="absolute top-1/4 bottom-1/4 left-[8mm] flex flex-col justify-between items-center w-2.5 z-10">
                {Array.from({ length: actualQuestionsPerColumn }).map((_, i) => (
                  <div key={i} className="h-1.5 w-3.5 bg-black" />
                ))}
              </div>
              <div className="absolute top-1/4 bottom-1/4 right-[8mm] flex flex-col justify-between items-center w-2.5 z-10">
                {Array.from({ length: actualQuestionsPerColumn }).map((_, i) => (
                  <div key={i} className="h-1.5 w-3.5 bg-black" />
                ))}
              </div>

              <div className="px-5">
                {/* ─── HEADER ─── */}
                <div className={`text-center border-b-2 ${headerBottomSpacingClass}`} style={{ borderColor: selectedTheme.hex }}>
                  {institutionName ? (
                    <h1 className="font-extrabold uppercase tracking-wide transition-all" style={{ fontSize: `${titleSize}px`, color: selectedTheme.hex }}>
                      {institutionName}
                    </h1>
                  ) : (
                    <div className="h-7 w-56 bg-neutral-200 rounded mx-auto mb-1 no-print animate-pulse" />
                  )}
                  
                  {headerMode === 'BIG' ? (
                    <div className="mt-1.5 space-y-1">
                      <h2 className="font-black uppercase tracking-wider text-[#1B2B22]" style={{ fontSize: `${subtitleSize}px` }}>{examTitle}</h2>
                      <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-neutral-600 mt-2 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 max-w-md mx-auto">
                        <div>শ্রেণি: {className || '______'}</div>
                        <div>বিষয়: {subjectName || '______'}</div>
                        <div>তারিখ: {examDate || '______'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs font-extrabold mt-2 max-w-xl mx-auto text-neutral-600">
                      <span>পরীক্ষা: {examTitle}</span>
                      <span>শ্রেণি: {className}</span>
                      <span>বিষয়: {subjectName}</span>
                    </div>
                  )}

                  {/* The exam code is what ties a printed sheet back to its answer key.
                      Without it on the paper a stack of sheets cannot be graded. */}
                  {linkedExam && (
                    <div className="mt-2 text-[10px] font-black tracking-[0.2em] text-neutral-500">
                      EXAM CODE: {linkedExam.code}
                    </div>
                  )}
                </div>

                {/* ─── STUDENT INFO & BUBBLE GRIDS ─── */}
                <div className={`grid grid-cols-12 gap-5 border-b border-dashed border-neutral-300 ${studentInfoSpacingClass}`}>
                  
                  {/* Handwritten student fields (Manual write-in) */}
                  <div className={`${entryMode === 'DIGITAL' ? 'col-span-6' : 'col-span-12'} space-y-3.5 text-xs font-bold text-neutral-700`}>
                    <div className="flex items-end">
                      <span className="shrink-0 mr-2" style={{ color: selectedTheme.hex }}>শিক্ষার্থীর নাম:</span>
                      <div className="border-b border-neutral-300 flex-1 h-5" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="flex items-end">
                        <span className="shrink-0 mr-2" style={{ color: selectedTheme.hex }}>শ্রেণি:</span>
                        <div className="border-b border-neutral-300 flex-1 h-5">{className}</div>
                      </div>
                      <div className="flex items-end">
                        <span className="shrink-0 mr-2" style={{ color: selectedTheme.hex }}>শাখা / সেকশন:</span>
                        <div className="border-b border-neutral-300 flex-1 h-5" />
                      </div>
                    </div>

                    {entryMode === 'MANUAL' ? (
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex items-end">
                          <span className="shrink-0 mr-2" style={{ color: selectedTheme.hex }}>রোল নম্বর:</span>
                          <div className="border-b border-neutral-300 flex-1 h-5" />
                        </div>
                        <div className="flex items-end">
                          <span className="shrink-0 mr-2" style={{ color: selectedTheme.hex }}>সেট কোড:</span>
                          <div className="border-b border-neutral-300 flex-1 h-5" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-end">
                        <span className="shrink-0 mr-2" style={{ color: selectedTheme.hex }}>আইডি / ফোন:</span>
                        <div className="border-b border-neutral-300 flex-1 h-5" />
                      </div>
                    )}

                    {/* Instruction box */}
                    <div className={`rounded-xl border leading-relaxed text-neutral-500 font-medium bg-neutral-50 border-neutral-200 ${instructionBoxSpacingClass}`}>
                      <p className="font-extrabold mb-1.5 uppercase tracking-wide" style={{ color: selectedTheme.hex }}>উত্তরপত্র পূরণের নিয়মাবলী:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>শুধুমাত্র কালো বল পয়েন্ট কলম ব্যবহার করুন।</li>
                        <li>বৃত্তাকার ঘরটি সম্পূর্ণ ভরাট করুন। আংশিক বা ক্রসিং দাগ বাতিল হবে।</li>
                        <li>ওএমআর শিটের বর্ডার বা কালো কোনার বাক্সে কোনো দাগ দেবেন না।</li>
                      </ul>
                    </div>
                  </div>

                  {/* Roll Number Bubble Grid */}
                  {entryMode === 'DIGITAL' && showRollGrid && (
                    <div className="col-span-4 border rounded-xl p-2 bg-white flex flex-col items-center border-neutral-300 shadow-sm">
                      <span className="text-[9px] font-black mb-1.5 uppercase tracking-wider" style={{ color: selectedTheme.hex }}>রোল নম্বর (ROLL NO)</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: finalRollDigits }).map((_, colIndex) => (
                          <div key={colIndex} className="flex flex-col items-center">
                            {/* Digit indicator box */}
                            <div className="h-4 w-4 border flex items-center justify-center text-[9px] font-black rounded-sm mb-1 bg-neutral-50 border-neutral-300" />
                            {/* Bubble rows 0 to 9 */}
                            {Array.from({ length: 10 }).map((_, digit) => (
                              <div 
                                key={digit} 
                                className={`border flex items-center justify-center font-black mb-0.5 select-none transition-all ${rollBubbleSizeClass}`}
                                style={{
                                  borderColor: selectedTheme.hex,
                                  color: selectedTheme.hex,
                                  borderRadius: bubbleShape === 'square' ? '2px' : '999px'
                                }}
                              >
                                {digit}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Set Code Bubble Grid */}
                  {entryMode === 'DIGITAL' && showSetCodeGrid && (
                    <div className="col-span-2 border rounded-xl p-2 bg-white flex flex-col items-center justify-center border-neutral-300 shadow-sm">
                      <span className="text-[9px] font-black mb-1.5 uppercase tracking-wider" style={{ color: selectedTheme.hex }}>সেট (SET)</span>
                      <div className="flex flex-col gap-1">
                        {['ক', 'খ', 'গ', 'ঘ'].map((setCode, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div 
                              className={`border flex items-center justify-center font-black select-none ${isHighDensity ? 'h-3.5 w-3.5 text-[8px]' : 'h-4.5 w-4.5 text-[9px]'}`}
                              style={{
                                borderColor: selectedTheme.hex,
                                color: selectedTheme.hex,
                                borderRadius: bubbleShape === 'square' ? '4px' : '999px'
                              }}
                            >
                              {setCode}
                            </div>
                            <span className="text-[8px] text-neutral-400 font-bold">{englishBubbleOptions[i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* ─── BUBBLE SHEET QUESTION COLUMNS ─── */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                  {bubbleGrid}
                </div>

                {/* ─── SIGNATURE BLOCK ─── */}
                <div className="flex justify-between items-end mt-12 px-6 text-xs font-bold text-neutral-600">
                  <div className="text-center w-28">
                    <div className="border-t border-neutral-400 pt-1">কক্ষ পরিদর্শকের স্বাক্ষর</div>
                  </div>
                  <div className="text-center w-28">
                    <div className="border-t border-neutral-400 pt-1">প্রধান শিক্ষকের স্বাক্ষর</div>
                  </div>
                </div>
              </div>

              {/* ─── BOTTOM ALIGNMENT TIMING BAR ─── */}
              <div className="w-[85%] mx-auto flex items-center justify-between h-3.5 mt-8 px-4">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className={`h-2.5 w-4 shrink-0 ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />
                ))}
              </div>

              <div className="text-center text-[8px] text-neutral-300 font-medium uppercase tracking-widest mt-2">
                PROSHNOPEDIA OMR DEC-V2.6 SCAN-COMPLIANT SHEET
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ─── TAB 2: MY TOKENS LIST ─── */}
      {activeTab === 'tokens' && (
        <div className="space-y-6 no-print">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-neutral-800 text-lg">আমার তৈরী ওএমআর এক্সাম টোকেন</h3>
              <p className="text-xs text-neutral-500 mt-1">প্রতিটি পরীক্ষার ইউনিক কোড ওএমআর খাতার সাথে লিঙ্ক করতে ব্যবহৃত হয়। মূল্যায়নের আগে উত্তরপত্র কী নির্ধারণ করতে হবে।</p>
            </div>

            <button
              onClick={() => {
                setTokenTitle('');
                setTokenQuestions('40');
                setShowTokenModal(true);
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#0F5132] hover:bg-[#072617] rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              + নতুন টোকেন তৈরী
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-100">
                  <th className="p-4 text-center">ক্রমিক</th>
                  <th className="p-4">পরীক্ষার নাম (Exam Title)</th>
                  <th className="p-4 text-center">টেমপ্লেট</th>
                  <th className="p-4 text-center">প্রশ্ন সংখ্যা</th>
                  <th className="p-4 text-center">নেগেটিভ মার্ক্স</th>
                  <th className="p-4 text-center">ইউনিক কোড</th>
                  <th className="p-4 text-center">উত্তরপত্র কী</th>
                  <th className="p-4 text-center">তৈরি তারিখ</th>
                  <th className="p-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {examTokens.map((t, idx) => (
                  <tr key={t._id} className="hover:bg-neutral-50 text-neutral-700 font-semibold">
                    <td className="p-4 text-center text-neutral-400">{idx + 1}</td>
                    <td className="p-4 text-neutral-800 font-extrabold">{t.title}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg ${t.templateMode === 'SIGNATURE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'}`}>
                        {t.templateMode === 'SIGNATURE' ? 'সিগনেচার' : 'সাধারণ'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-neutral-600">{t.totalQuestions} টি</td>
                    <td className="p-4 text-center font-bold text-red-600">-{t.negativeMarks}</td>
                    <td className="p-4 text-center font-black text-emerald-800 tracking-wider bg-emerald-50/20">{t.code}</td>
                    <td className="p-4 text-center">
                      {t.isAnswerKeyComplete ? (
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">সম্পূর্ণ</span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-amber-50 text-amber-700 border border-amber-200">অসম্পূর্ণ</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-neutral-500 font-medium">
                      {new Date(t.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTokenId(t._id);
                            setTemplateMode(t.templateMode);
                            setTotalQuestionsCount(String(t.totalQuestions));
                            setOptionsPerQuestion(String(t.optionsPerQuestion || 4));
                            setExamTitle(t.title);
                            setCustomQuestionCount(true);
                            setActiveTab('design');
                          }}
                          className="px-3 py-1.5 text-xs text-neutral-700 bg-white border hover:bg-neutral-50 rounded-lg shadow-sm"
                        >
                          ডিজাইন
                        </button>
                        <button
                          onClick={() => {
                            handleSelectExam(t._id);
                            setActiveTab('evaluate');
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg"
                        >
                          মূল্যায়ন
                        </button>
                        <button
                          onClick={() => handleDeleteExam(t._id)}
                          className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg"
                        >
                          মুছুন
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {examTokens.length === 0 && !loading && (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-neutral-400 font-semibold">
                      কোন ওএমআর টোকেন তৈরি করা হয়নি এখনও। নতুন টোকেন তৈরি করতে উপরের বাটনে ক্লিক করুন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Token statement — the record of where the balance actually went */}
          {ledger.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <h4 className="font-extrabold text-neutral-800 text-sm mb-3">টোকেন লেনদেনের বিবরণী</h4>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {ledger.map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between text-xs border-b border-neutral-50 py-2">
                    <div>
                      <p className="font-bold text-neutral-700">{LEDGER_REASON_LABELS[entry.reason] || entry.reason}</p>
                      <p className="text-[10px] text-neutral-400">
                        {new Date(entry.createdAt).toLocaleString('bn-BD')}
                        {entry.note ? ` • ${entry.note}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className={`font-black ${entry.amount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {entry.amount > 0 ? '+' : ''}{entry.amount}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">ব্যালেন্স: {entry.balanceAfter}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: EVALUATION WORKSPACE ─── */}
      {activeTab === 'evaluate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">

          {/* Answer key + sheet entry */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-neutral-800 text-base mb-1.5">১. পরীক্ষা নির্বাচন করুন</h3>
                <p className="text-xs text-neutral-500">যে ওএমআর পরীক্ষার খাতা মূল্যায়ন করবেন সেটি বেছে নিন।</p>
              </div>

              <select
                value={evalExamId}
                onChange={(e) => handleSelectExam(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
              >
                <option value="">নির্বাচন করুন...</option>
                {examTokens.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} — {t.code} ({t.totalQuestions} টি প্রশ্ন)
                  </option>
                ))}
              </select>

              {examTokens.length === 0 && !loading && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  কোনো ওএমআর পরীক্ষা নেই। প্রথমে &ldquo;আমার টোকেন&rdquo; ট্যাব থেকে একটি পরীক্ষা তৈরি করুন।
                </p>
              )}
            </div>

            {/* Answer key editor */}
            {selectedEvalExam && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-neutral-800 text-base mb-1.5">২. উত্তরপত্র কী (Answer Key)</h3>
                    <p className="text-xs text-neutral-500">প্রতিটি প্রশ্নের সঠিক উত্তর নির্ধারণ করুন। কী সম্পূর্ণ না হলে মূল্যায়ন করা যাবে না।</p>
                  </div>
                  <button
                    onClick={handleSaveAnswerKey}
                    disabled={savingAnswerKey}
                    className="shrink-0 px-4 py-2 text-xs font-bold text-white bg-[#0F5132] hover:bg-[#072617] rounded-xl disabled:opacity-60"
                  >
                    {savingAnswerKey ? 'সংরক্ষণ হচ্ছে...' : 'কী সংরক্ষণ করুন'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                  {answerKeyDraft.map((entry, idx) => (
                    <div key={entry.questionNo} className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-lg p-1.5">
                      <span className="text-[11px] font-black text-neutral-500 w-6 shrink-0">
                        {toBanglaDigits(entry.questionNo)}.
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: selectedEvalExam.optionsPerQuestion || 4 }).map((_, optIdx) => (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() =>
                              setKeyEdits((prev) => ({
                                ...prev,
                                [entry.questionNo]: entry.correctOption === optIdx ? null : optIdx,
                              }))
                            }
                            className={`h-6 w-6 rounded-full text-[10px] font-black border transition-colors ${
                              entry.correctOption === optIdx
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-neutral-500 border-neutral-300 hover:border-emerald-400'
                            }`}
                          >
                            {bubbleOptions[optIdx]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sheet entry */}
            {selectedEvalExam && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="font-extrabold text-neutral-800 text-base mb-1.5">৩. উত্তরপত্র এন্ট্রি</h3>
                  <p className="text-xs text-neutral-500">
                    শিক্ষার্থীর খাতা থেকে উত্তরগুলো বসান। প্রতিটি নতুন রোলের মূল্যায়নে ১টি টোকেন খরচ হবে; একই রোল সংশোধন করলে কোনো টোকেন কাটা হবে না।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5">রোল নম্বর *</label>
                    <input
                      value={entryRoll}
                      onChange={(e) => setEntryRoll(e.target.value)}
                      placeholder="যেমন: ১২৩৪৫৬"
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#0F5132]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5">সেট কোড</label>
                    <input
                      value={entrySetCode}
                      onChange={(e) => setEntrySetCode(e.target.value)}
                      placeholder="যেমন: ক"
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#0F5132]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5">শিক্ষার্থীর নাম</label>
                    <input
                      value={entryStudentName}
                      onChange={(e) => setEntryStudentName(e.target.value)}
                      placeholder="ঐচ্ছিক"
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#0F5132]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                  {entryAnswers.map((entry, idx) => (
                    <div key={entry.questionNo} className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-lg p-1.5">
                      <span className="text-[11px] font-black text-neutral-500 w-6 shrink-0">
                        {toBanglaDigits(entry.questionNo)}.
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: selectedEvalExam.optionsPerQuestion || 4 }).map((_, optIdx) => (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() =>
                              setAnswerEdits((prev) => ({
                                ...prev,
                                [entry.questionNo]: entry.marked === optIdx ? null : optIdx,
                              }))
                            }
                            className={`h-6 w-6 rounded-full text-[10px] font-black border transition-colors ${
                              entry.marked === optIdx
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-neutral-500 border-neutral-300 hover:border-indigo-400'
                            }`}
                          >
                            {bubbleOptions[optIdx]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {!selectedEvalExam.isAnswerKeyComplete && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    এই পরীক্ষার উত্তরপত্র কী এখনো সম্পূর্ণ নয়। উপরে সব প্রশ্নের সঠিক উত্তর নির্ধারণ করে সংরক্ষণ করুন।
                  </p>
                )}

                <button
                  onClick={handleEvaluate}
                  disabled={evaluating || !selectedEvalExam.isAnswerKeyComplete || !entryRoll.trim()}
                  className="w-full py-4 rounded-xl font-bold bg-[#0F5132] text-white flex items-center justify-center gap-2 hover:bg-[#072617] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-800/10"
                >
                  {evaluating ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>মূল্যায়ন হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineCheck className="h-5 w-5" />
                      <span>মূল্যায়ন করুন ও সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Result panel */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {lastResult ? (
                <motion.div
                  key={lastResult._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-md space-y-5"
                >
                  <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                    <HiOutlineCheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
                    <div>
                      <h3 className="font-extrabold text-neutral-800 text-sm">মূল্যায়ন সম্পন্ন হয়েছে</h3>
                      <p className="text-[10px] text-neutral-400">
                        রোল {lastResult.rollNumber}
                        {lastResult.setCode ? ` • সেট ${lastResult.setCode}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-center">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">প্রাপ্ত নম্বর</span>
                    <div className="flex items-baseline justify-center gap-1.5 mt-2">
                      <span className="text-4xl font-black text-emerald-950">{lastResult.score}</span>
                      <span className="text-sm font-bold text-emerald-800">/ {lastResult.totalMarks}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                      <span className="block text-lg font-black text-emerald-800">{lastResult.correctCount}</span>
                      <span className="text-[10px] font-bold text-emerald-700">সঠিক</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                      <span className="block text-lg font-black text-rose-700">{lastResult.wrongCount}</span>
                      <span className="text-[10px] font-bold text-rose-600">ভুল</span>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl">
                      <span className="block text-lg font-black text-neutral-600">{lastResult.blankCount}</span>
                      <span className="text-[10px] font-bold text-neutral-500">খালি</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center py-16 text-neutral-400">
                  <HiOutlineExclamationCircle className="h-10 w-10 mx-auto opacity-40 mb-3" />
                  <h3 className="font-bold text-neutral-700 text-sm">এখনো কোনো মূল্যায়ন হয়নি</h3>
                  <p className="text-xs max-w-[240px] mx-auto mt-1 leading-relaxed">উত্তরপত্র এন্ট্রি করে মূল্যায়ন করলে ফলাফল এখানে দেখা যাবে।</p>
                </div>
              )}
            </AnimatePresence>

            {examSummary && examSummary.evaluated > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                <h4 className="font-extrabold text-neutral-800 text-xs mb-3">এই পরীক্ষার সারসংক্ষেপ</h4>
                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="bg-neutral-50 border rounded-xl p-3">
                    <span className="block text-lg font-black text-neutral-800">{examSummary.evaluated}</span>
                    <span className="text-[10px] text-neutral-500 font-bold">মূল্যায়িত খাতা</span>
                  </div>
                  <div className="bg-neutral-50 border rounded-xl p-3">
                    <span className="block text-lg font-black text-neutral-800">{examSummary.averageScore}</span>
                    <span className="text-[10px] text-neutral-500 font-bold">গড় নম্বর</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <span className="block text-lg font-black text-emerald-800">{examSummary.highestScore}</span>
                    <span className="text-[10px] text-emerald-700 font-bold">সর্বোচ্চ</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                    <span className="block text-lg font-black text-rose-700">{examSummary.lowestScore}</span>
                    <span className="text-[10px] text-rose-600 font-bold">সর্বনিম্ন</span>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
                <h4 className="font-extrabold text-neutral-800 text-xs border-b pb-2">
                  সংরক্ষিত ফলাফল ({results.length})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {results.map((grade) => (
                    <div key={grade._id} className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-lg border text-xs gap-2">
                      <div className="min-w-0">
                        <p className="font-extrabold text-neutral-800 truncate">
                          রোল: {grade.rollNumber}
                          {grade.studentName ? ` — ${grade.studentName}` : ''}
                        </p>
                        <p className="text-[9px] text-neutral-400">
                          {new Date(grade.createdAt).toLocaleDateString('bn-BD')}
                          {grade.setCode ? ` • সেট ${grade.setCode}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-black text-emerald-800">{grade.score}</span>
                          <span className="text-neutral-400 font-bold"> / {grade.totalMarks}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteResult(grade._id)}
                          className="text-[10px] text-rose-600 font-bold hover:underline"
                        >
                          মুছুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── NEW TOKEN MODAL ─── */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="bg-[#0F5132] text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">নতুন টোকেন তৈরী</h3>
              <button 
                onClick={() => setShowTokenModal(false)}
                className="text-white hover:text-neutral-200 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 flex items-start gap-2.5 text-xs font-semibold leading-relaxed">
                <HiOutlineExclamationCircle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  টোকেন এর মধ্যে আপনার পরীক্ষার উত্তরপত্র, কোন OMR টেমপ্লেট এ পরীক্ষা নিয়েছেন এই তথ্য গুলো থাকবে।
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">পরীক্ষা বা একটি টাইটেল দিন</label>
                <input 
                  type="text"
                  value={tokenTitle}
                  onChange={(e) => setTokenTitle(e.target.value)}
                  placeholder="যেমন: অর্ধবার্ষিক গণিত পরীক্ষা"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-2">OMR Template নির্বাচন করুন</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { mode: 'SIGNATURE', label: 'সিগনেচার', desc: 'রঙিন ও স্ক্যানযোগ্য' },
                    { mode: 'GENERAL', label: 'সাধারণ', desc: 'সাদা-কালো স্ট্যান্ডার্ড' }
                  ].map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => setTokenTemplate(item.mode)}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        tokenTemplate === item.mode
                          ? 'bg-[#0f5132]/5 text-[#0f5132] border-[#0f5132] ring-2 ring-[#0f5132]/10'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{item.label}</div>
                      <div className="text-[9px] opacity-75 mt-0.5 font-medium">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">Total Question</label>
                  <input 
                    type="number"
                    value={tokenQuestions}
                    onChange={(e) => setTokenQuestions(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none font-bold"
                    min="10"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">Negative Marks</label>
                  <select 
                    value={tokenNegativeMarks}
                    onChange={(e) => setTokenNegativeMarks(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-xs bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none font-bold text-neutral-700"
                  >
                    <option value="0">নেই (0.00)</option>
                    <option value="0.25">০.২৫ (0.25)</option>
                    <option value="0.50">০.৫০ (0.50)</option>
                    <option value="1.00">১.০০ (1.00)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-neutral-50 border-t p-4 flex items-center justify-end gap-2.5">
              <button 
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 bg-white border rounded-xl hover:bg-neutral-50"
              >
                বাতিল
              </button>
              <button
                onClick={handleGenerateToken}
                disabled={creatingToken}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#0F5132] hover:bg-[#072617] rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creatingToken ? 'তৈরি হচ্ছে...' : 'Generate Token'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRINT OPTIMIZED GLOBAL CSS STYLES ─── */}
      <style jsx global>{`
        @media print {
          /* Reset parent wrapping layout constraints */
          html, body, #__next, .flex, .flex-1, main, div {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }

          /* Hide dashboard shell sidebars, buttons and headers */
          nav, aside, header, .no-print, button, form, .sidebar-controls, .border-b {
            display: none !important;
          }
          
          /* Full A4 single page print layout resetting margins */
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print-sheet {
            position: relative !important;
            margin: 0 auto !important;
            padding: 10mm !important;
            width: 100% !important;
            max-width: 210mm !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: avoid;
            page-break-inside: avoid;
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
