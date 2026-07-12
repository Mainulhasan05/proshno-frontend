'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [examTokens, setExamTokens] = useState([
    { id: 'tok-1', title: 'প্রথম সাময়িক গণিত পরীক্ষা', template: 'SIGNATURE', totalQuestions: 40, negativeMarks: '0.25', code: 'OMR-8401-K9', date: '১২/০৭/২০২৬' },
    { id: 'tok-2', title: 'ইংরেজি সাপ্তাহিক কুইজ', template: 'GENERAL', totalQuestions: 60, negativeMarks: '0', code: 'OMR-1934-J2', date: '১০/০৭/২০২৬' }
  ]);
  const [selectedTokenId, setSelectedTokenId] = useState('');

  // New Token Modal states
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenTitle, setTokenTitle] = useState('');
  const [tokenTemplate, setTokenTemplate] = useState('SIGNATURE');
  const [tokenQuestions, setTokenQuestions] = useState('40');
  const [tokenNegativeMarks, setTokenNegativeMarks] = useState('0.25');

  const [downloading, setDownloading] = useState(false);
  const [templateMode, setTemplateMode] = useState('SIGNATURE'); // 'SIGNATURE' | 'GENERAL'
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [examTitle, setExamTitle] = useState('প্রথম সাময়িক পরীক্ষা');
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
  const [evalQuestionSetId, setEvalQuestionSetId] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(user?.omrTokens ?? 150);

  // Evaluated results mock state
  const [evaluatedRoll, setEvaluatedRoll] = useState('১২৩৪৫৬');
  const [evaluatedSet, setEvaluatedSet] = useState('খ');
  const [evaluatedScore, setEvaluatedScore] = useState(34);
  const [savedGrades, setSavedGrades] = useState([]);

  useEffect(() => {
    if (user?.institutionName) {
      setInstitutionName(user.institutionName);
    }
    if (user?.omrTokens != null) {
      setTokenBalance(user.omrTokens);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const qSetsRes = await apiClient.get('/teacher/question-sets');
        setQuestionSets(qSetsRes.data || []);
      } catch (err) {
        console.error('Failed to load data for OMR generator', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleDownloadPDF = () => {
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

      const runGeneration = () => {
        window.html2pdf().set(opt).from(tempDiv).save().then(() => {
          document.body.removeChild(tempDiv);
          setDownloading(false);
        }).catch(err => {
          console.error(err);
          document.body.removeChild(tempDiv);
          setDownloading(false);
          window.print();
        });
      };

      if (window.html2pdf) {
        runGeneration();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
          runGeneration();
        };
        script.onerror = () => {
          document.body.removeChild(tempDiv);
          setDownloading(false);
          alert('PDF জেনারেটর লোড করতে ব্যর্থ হয়েছে, বিকল্প হিসেবে প্রিন্ট উইন্ডো ওপেন হচ্ছে।');
          window.print();
        };
        document.body.appendChild(script);
      }
    }
  };

  // Generate Token handler
  const handleGenerateToken = () => {
    if (!tokenTitle.trim()) {
      alert('দয়া করে পরীক্ষার টাইটেল দিন!');
      return;
    }
    const qCount = Number(tokenQuestions);
    if (isNaN(qCount) || qCount < 10 || qCount > 100) {
      alert('মোট প্রশ্ন সংখ্যা ১০ থেকে ১০০ এর মধ্যে হতে হবে!');
      return;
    }
    if (tokenBalance <= 0) {
      alert('আপনার ওএমআর টোকেন ব্যালেন্স অপর্যাপ্ত! ওএমআর টোকেন কিনুন।');
      return;
    }

    const uniqueCode = `OMR-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9)}`;
    const newToken = {
      id: `tok-${Date.now()}`,
      title: tokenTitle,
      template: tokenTemplate,
      totalQuestions: qCount,
      negativeMarks: tokenNegativeMarks,
      code: uniqueCode,
      date: new Date().toLocaleDateString('bn-BD')
    };

    setExamTokens(prev => [newToken, ...prev]);
    setTokenBalance(prev => Math.max(0, prev - 1));
    setShowTokenModal(false);
    
    // Auto-select the newly created token!
    setSelectedTokenId(newToken.id);
    setTemplateMode(newToken.template);
    setTotalQuestionsCount(String(newToken.totalQuestions));
    setExamTitle(newToken.title);
    setCustomQuestionCount(true);
    
    alert(`টোকেন জেনারেট সফল হয়েছে! আপনার ইউনিক কোড: ${uniqueCode}`);
  };

  // --- OMR SCANNING & EVALUATION HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadedFileUrl(URL.createObjectURL(file));
      setShowResults(false);
    }
  };

  const triggerScan = () => {
    if (!uploadedFile) return;
    if (!evalQuestionSetId) {
      alert('দয়া করে মূল্যায়নের জন্য ওএমআর এক্সাম টোকেন নির্বাচন করুন।');
      return;
    }
    if (tokenBalance <= 0) {
      alert('আপনার পর্যাপ্ত ওএমআর টোকেন নেই! ওএমআর টোকেন রিচার্জ করুন।');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanStatus('ওএমআর শিটের বর্ডার সনাক্ত করা হচ্ছে...');

    const statuses = [
      { progress: 20, text: 'Timing Marks ডিকোড করা হচ্ছে...' },
      { progress: 45, text: 'শিক্ষার্থীর তথ্য এবং রোল নম্বর স্ক্যান করা হচ্ছে...' },
      { progress: 70, text: 'সেট কোড এবং উত্তর বাবলসমূহ রিড করা হচ্ছে...' },
      { progress: 90, text: 'উত্তরপত্রের সাথে উত্তরপত্র কী (Answer Key) যাচাই করা হচ্ছে...' },
      { progress: 100, text: 'মূল্যায়ন সম্পন্ন হয়েছে!' }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < statuses.length) {
        setScanProgress(statuses[currentIdx].progress);
        setScanStatus(statuses[currentIdx].text);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setShowResults(true);
        // Deduct token
        setTokenBalance(prev => Math.max(0, prev - 1));
        // Select random mock score from the OMR token parameters
        const activeTok = examTokens.find(t => t.id === evalQuestionSetId);
        const totalQ = activeTok ? activeTok.totalQuestions : 40;
        const randomScore = Math.floor(Math.random() * (totalQ - 10)) + 10;
        setEvaluatedScore(randomScore);
        // Random roll
        const rolls = ['১২৩৪৫৬', '৪৫০১৯২', '১৮৯৭৩৩', '৩০৪১৫৫'];
        setEvaluatedRoll(rolls[Math.floor(Math.random() * rolls.length)]);
        // Random set
        const sets = ['ক', 'খ', 'গ', 'ঘ'];
        setEvaluatedSet(sets[Math.floor(Math.random() * sets.length)]);
      }
    }, 800);
  };

  const handleSaveResult = () => {
    const activeTok = examTokens.find(t => t.id === evalQuestionSetId);
    const qSetName = activeTok ? activeTok.title : 'ওএমআর পরীক্ষা';
    const totalQ = activeTok ? activeTok.totalQuestions : 40;
    const newGrade = {
      id: Date.now(),
      roll: evaluatedRoll,
      set: evaluatedSet,
      score: evaluatedScore,
      total: totalQ,
      exam: qSetName,
      date: new Date().toLocaleDateString('bn-BD')
    };
    setSavedGrades(prev => [newGrade, ...prev]);
    // Reset scanner
    setUploadedFile(null);
    setUploadedFileUrl('');
    setShowResults(false);
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
                        const tok = examTokens.find(t => t.id === id);
                        if (tok) {
                          setTemplateMode(tok.template);
                          setTotalQuestionsCount(String(tok.totalQuestions));
                          setExamTitle(tok.title);
                          setCustomQuestionCount(true);
                        }
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none font-semibold text-neutral-700"
                  >
                    <option value="">কোনো টোকেন লিঙ্ক নেই (ম্যানুয়াল)</option>
                    {examTokens.map((t) => (
                      <option key={t.id} value={t.id}>
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
                  
                  {Array.from({ length: columns }).map((_, colIndex) => {
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
                  })}

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
              <p className="text-xs text-neutral-500 mt-1">প্রতিটি পরীক্ষার জন্য ইউনিক টোকেন কোড ও সেটিংস ওএমআর খাতার সাথে লিঙ্ক করতে ব্যবহৃত হয়</p>
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
          
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-100">
                  <th className="p-4 text-center">ক্রমিক</th>
                  <th className="p-4">পরীক্ষার নাম (Exam Title)</th>
                  <th className="p-4 text-center">টেমপ্লেট</th>
                  <th className="p-4 text-center">প্রশ্ন সংখ্যা</th>
                  <th className="p-4 text-center">নেগেটিভ মার্ক্স</th>
                  <th className="p-4 text-center">ইউনিক কোড</th>
                  <th className="p-4 text-center">তৈরি তারিখ</th>
                  <th className="p-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {examTokens.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-neutral-50 text-neutral-700 font-semibold">
                    <td className="p-4 text-center text-neutral-400">{idx + 1}</td>
                    <td className="p-4 text-neutral-800 font-extrabold">{t.title}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg ${t.template === 'SIGNATURE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'}`}>
                        {t.template === 'SIGNATURE' ? 'সিগনেচার' : 'সাধারণ'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-neutral-600">{t.totalQuestions} টি</td>
                    <td className="p-4 text-center font-bold text-red-600">-{t.negativeMarks}</td>
                    <td className="p-4 text-center font-black text-emerald-800 tracking-wider bg-emerald-50/20">{t.code}</td>
                    <td className="p-4 text-center text-neutral-500 font-medium">{t.date}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedTokenId(t.id);
                          setTemplateMode(t.template);
                          setTotalQuestionsCount(String(t.totalQuestions));
                          setExamTitle(t.title);
                          setCustomQuestionCount(true);
                          setActiveTab('design');
                        }}
                        className="px-3 py-1.5 text-xs text-neutral-700 bg-white border hover:bg-neutral-50 rounded-lg shadow-sm"
                      >
                        ডিজাইন দেখুন
                      </button>
                    </td>
                  </tr>
                ))}
                {examTokens.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-neutral-400 font-semibold">
                      কোন ওএমআর টোকেন তৈরি করা হয়নি এখনও। নতুন টোকেন তৈরি করতে উপরের বাটনে ক্লিক করুন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: EVALUATION WORKSPACE (SCANNER) ─── */}
      {activeTab === 'evaluate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
          
          {/* Scanner Setup & Upload Box */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6">
              
              <div>
                <h3 className="font-extrabold text-neutral-800 text-base mb-1.5">১. উত্তরপত্র মূল্যায়নের সেটিংস</h3>
                <p className="text-xs text-neutral-500">মূল্যায়ন করার আগে সংশ্লিষ্ট প্রশ্নপত্র সেট এবং ইমেজ আপলোড করুন।</p>
              </div>

              {/* Question set selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">সংশ্লিষ্ট প্রশ্ন সেট নির্বাচন করুন</label>
                <select
                  value={evalQuestionSetId}
                  onChange={(e) => {
                    setEvalQuestionSetId(e.target.value);
                    setShowResults(false);
                  }}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-[#0F5132]/25 focus:border-[#0F5132] outline-none"
                >
                  <option value="">নির্বাচন করুন...</option>
                  {questionSets.map((q) => (
                    <option key={q._id} value={q._id}>
                      {q.name} ({q.totalQuestions} টি এমসিকিউ প্রশ্ন)
                    </option>
                  ))}
                </select>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">ওএমআর শিটের ছবি বা স্ক্যান কপি</label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors relative overflow-hidden ${
                    uploadedFileUrl ? 'border-emerald-500 bg-emerald-50/25' : 'border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {uploadedFileUrl ? (
                    <div className="relative w-full max-w-[280px] aspect-[3/4] border rounded-xl bg-white shadow overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={uploadedFileUrl} 
                        alt="Uploaded OMR copy" 
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <label className="bg-white text-neutral-700 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-neutral-100">
                          পরিবর্তন করুন
                          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>

                      {/* SCANNING LASER EFFECT */}
                      {isScanning && (
                        <motion.div
                          initial={{ top: '0%' }}
                          animate={{ top: '100%' }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: 'easeInOut'
                          }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent shadow-[0_0_10px_#10B981] z-20"
                        />
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full py-6">
                      <HiOutlineUpload className="h-10 w-10 text-neutral-400 mb-3" />
                      <span className="text-sm font-bold text-neutral-700">OMR ইমেজ ফাইল ড্রপ করুন বা আপলোড করুন</span>
                      <span className="text-xs text-neutral-400 mt-1">PNG, JPG, JPEG (সর্বোচ্চ ১০ এমবি)</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {uploadedFileUrl && evalQuestionSetId && !showResults && (
                <button
                  onClick={triggerScan}
                  disabled={isScanning}
                  className="w-full py-4 rounded-xl font-bold bg-[#0F5132] text-white flex items-center justify-center gap-2 hover:bg-[#072617] transition-all disabled:opacity-70 shadow-lg shadow-emerald-800/10"
                >
                  {isScanning ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{scanStatus}</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineSparkles className="h-5 w-5" />
                      <span>ওএমআর মূল্যায়ন শুরু করুন (১টি টোকেন ব্যালেন্স কর্তন হবে)</span>
                    </>
                  )}
                </button>
              )}

            </div>
          </div>

          {/* Evaluated Result Preview Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live scan analysis results panel */}
            <AnimatePresence mode="wait">
              {showResults ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-md space-y-5"
                >
                  <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
                    <HiOutlineCheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
                    <div>
                      <h3 className="font-extrabold text-neutral-800 text-sm">ওএমআর সফলভাবে স্ক্যান করা হয়েছে!</h3>
                      <p className="text-[10px] text-neutral-400">ব্যালেন্স থেকে ১টি টোকেন কাটা হয়েছে</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 border p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-neutral-400 block uppercase">শনাক্তকৃত রোল</span>
                      <input 
                        type="text" 
                        value={evaluatedRoll} 
                        onChange={(e) => setEvaluatedRoll(e.target.value)}
                        className="text-base font-black text-neutral-800 bg-transparent border-b border-transparent focus:border-neutral-400 focus:outline-none w-full mt-0.5"
                      />
                    </div>
                    <div className="bg-neutral-50 border p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-neutral-400 block uppercase">শনাক্তকৃত সেট</span>
                      <input 
                        type="text" 
                        value={evaluatedSet} 
                        onChange={(e) => setEvaluatedSet(e.target.value)}
                        className="text-base font-black text-neutral-800 bg-transparent border-b border-transparent focus:border-neutral-400 focus:outline-none w-full mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Grading metrics */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-center">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">পরীক্ষার্থীর স্কোর</span>
                    <div className="flex items-baseline justify-center gap-1.5 mt-2">
                      <span className="text-4xl font-black text-emerald-950">{evaluatedScore}</span>
                      <span className="text-sm font-bold text-emerald-800">/ {questionSets.find(q => q._id === evalQuestionSetId)?.totalQuestions || 40}</span>
                    </div>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                      {evaluatedScore >= 16 ? 'কৃতকার্য (Passed)' : 'অকৃতকার্য (Failed)'}
                    </span>
                  </div>

                  {/* Answers sheet simulation grid */}
                  <div>
                    <h4 className="text-xs font-bold text-neutral-600 mb-2.5">উত্তরপত্রের উত্তর বাবল ওভারভিউ (নমুনা):</h4>
                    <div className="grid grid-cols-5 gap-1.5">
                      {Array.from({ length: Math.min(25, questionSets.find(q => q._id === evalQuestionSetId)?.totalQuestions || 40) }).map((_, idx) => {
                        const isCorrect = idx !== 4 && idx !== 11 && idx !== 18; // Fake correct/incorrect patterns
                        return (
                          <div 
                            key={idx}
                            className={`p-2 rounded-lg text-center font-bold text-xs border ${
                              isCorrect 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                : 'bg-rose-50 border-rose-200 text-rose-800'
                            }`}
                          >
                            Q{idx + 1}: {isCorrect ? '✔' : '✘'}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-2">* লাল চিহ্ন দ্বারা চিহ্নিত প্রশ্নগুলো শিক্ষার্থীর ভুল করা উত্তর নির্দেশ করে।</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowResults(false)}
                      className="flex-1 py-3 text-xs font-bold rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700"
                    >
                      পুনরায় স্ক্যান
                    </button>
                    <button
                      onClick={handleSaveResult}
                      className="flex-1 py-3 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      ফলাফল সংরক্ষণ করুন
                    </button>
                  </div>

                </motion.div>
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center py-16 text-neutral-400">
                  <HiOutlineExclamationCircle className="h-10 w-10 mx-auto opacity-40 mb-3" />
                  <h3 className="font-bold text-neutral-700 text-sm">কোনো স্ক্যান ফলাফল নেই</h3>
                  <p className="text-xs max-w-[240px] mx-auto mt-1 leading-relaxed">উত্তরপত্র স্ক্যান করা শুরু করলে ফলাফল বিবরণী এখানে প্রদর্শিত হবে।</p>
                </div>
              )}
            </AnimatePresence>

            {/* Saved exam results dashboard */}
            {savedGrades.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-extrabold text-neutral-800 text-xs">সাম্প্রতিক সংরক্ষিত মূল্যায়নসমূহ ({savedGrades.length})</h4>
                  <button onClick={() => setSavedGrades([])} className="text-[10px] text-rose-600 font-bold hover:underline">সব মুছুন</button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {savedGrades.map((grade) => (
                    <div key={grade.id} className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-lg border text-xs">
                      <div>
                        <p className="font-extrabold text-neutral-800">রোল: {grade.roll} ({grade.exam})</p>
                        <p className="text-[9px] text-neutral-400">{grade.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-800">{grade.score}</span>
                        <span className="text-neutral-400 font-bold"> / {grade.total}</span>
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
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#0F5132] hover:bg-[#072617] rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                Generate Token
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
