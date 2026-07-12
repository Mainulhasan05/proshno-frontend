'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  HiOutlineCog, 
  HiOutlineDownload, 
  HiOutlineCheck, 
  HiOutlineExclamationCircle, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineDuplicate, 
  HiOutlineSparkles,
  HiOutlineTrash as TrashIcon,
  HiOutlineArrowUp,
  HiOutlineArrowDown
} from 'react-icons/hi';
import Button from '@/components/ui/Button';

export default function OfflineExamsPage() {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'download'
  
  // Paper Metadata states
  const [institutionName, setInstitutionName] = useState('নিউ এডুকেয়ার স্কুল অ্যান্ড কলেজ');
  const [examTitle, setExamTitle] = useState('এইচএসসি প্রাক-নির্বাচনী পরীক্ষা ২০২৬');
  const [className, setClassName] = useState('দ্বাদশ শ্রেণি (HSC)');
  const [subjectName, setSubjectName] = useState('পদার্থবিজ্ঞান ২য় পত্র');
  const [chapterName, setChapterName] = useState('অধ্যায় ১ - তাপগতিবিদ্যা');
  const [examTime, setExamTime] = useState('समय — ৪০ মিনিট');
  const [totalMarks, setTotalMarks] = useState('পূর্ণমান — ৩০');
  const [instructions, setInstructions] = useState('দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। যেকোনো ৩ টি প্রশ্নের উত্তর দাও। প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেয়া যাবেনা।');
  const [subjectCode, setSubjectCode] = useState('১৭৫');
  const [setCode, setSetCode] = useState('ক');

  // Question attachments toggles
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [showOMR, setShowOMR] = useState(false);
  const [showImportant, setShowImportant] = useState(false);
  const [showQuestionInfo, setShowQuestionInfo] = useState(true);
  const [showStudentInfo, setShowStudentInfo] = useState(false);
  const [showMarksBox, setShowMarksBox] = useState(false);
  const [showSubjectCode, setShowSubjectCode] = useState(false);

  // Metadata headers visibility toggles
  const [metaClass, setMetaClass] = useState(true);
  const [metaSubject, setMetaSubject] = useState(true);
  const [metaChapter, setMetaChapter] = useState(true);
  const [metaSetCode, setMetaSetCode] = useState(false);
  const [metaExamTitle, setMetaExamTitle] = useState(true);
  const [metaInstructions, setMetaInstructions] = useState(true);

  // Document formatting options
  const [editingMode, setEditingMode] = useState(true);
  const [fontSizeBase, setFontSizeBase] = useState(13); // px
  const [lineSpacing, setLineSpacing] = useState(1.5); // line-height
  const [columnsCount, setColumnsCount] = useState(2); // 1 or 2 columns
  const [paperFontFamily, setPaperFontFamily] = useState('Kalpurush'); // 'Kalpurush' | 'SolaimanLipi' | 'sans-serif'
  const [downloading, setDownloading] = useState(false);

  // Active Focused Element track for WYSIWYG
  const [focusedBlock, setFocusedBlock] = useState(null); // { qIndex: number, field: 'stem' | 'subQuestion', subIndex?: number }
  const [textSelections, setTextSelections] = useState({});

  useEffect(() => {
    // Inject font stylesheet if not present
    if (!document.getElementById('kalpurush-font')) {
      const link = document.createElement('link');
      link.id = 'kalpurush-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.cdnfonts.com/css/kalpurush';
      document.head.appendChild(link);
    }
  }, []);

  // Question List State
  const [questions, setQuestions] = useState([
    {
      id: 'q-1',
      type: 'CREATIVE',
      stem: 'জাহিদ ও শাহেদ সহপাঠী। জাহিদ পদার্থবিজ্ঞান ল্যাবে একটি রোধ থার্মোমিটার নিলো। যার বরফ বিন্দু ও বাষ্প বিন্দুতে রোধ যথাক্রমে ১২ Ω এবং ২৪ Ω। অন্যদিকে, শাহেদ ৫ atm চাপবিশিষ্ট একটি পাত্রে আবদ্ধ গ্যাসে ২৪০০ J তাপশক্তি সরবরাহ করে। এতে গ্যাসের আয়তন ১৬০০ cm³ থেকে ৩২০০ cm³ হয় এবং অভ্যন্তরীণ শক্তির পরিবর্তন হয় ১৫৮৯.৪ J।',
      subQuestions: [
        { key: 'ক', text: 'প্রত্যাগামী প্রক্রিয়া কী?', mark: '১' },
        { key: 'খ', text: 'কীভাবে ইঞ্জিনের দক্ষতা বৃদ্ধি করা যায়? ব্যাখ্যা করো।', mark: '২' },
        { key: 'গ', text: '২৫০°C তাপমাত্রায় জাহিদের থার্মোমিটারের রোধ নির্ণয় করো।', mark: '৩' },
        { key: 'ঘ', text: 'উদ্দীপকে শাহেদের পরীক্ষণটি তাপগতিবিদ্যার ১ম সূত্রকে সমর্থন করে কি? গাণিতিকভাবে বিশ্লেষণ করো।', mark: '৪' }
      ]
    },
    {
      id: 'q-2',
      type: 'CREATIVE',
      stem: 'একটি সিলিন্ডারে 10L গ্যাস 300 K তাপমাত্রায় ও 1 atm চাপে আবদ্ধ আছে।',
      subQuestions: [
        { key: 'ক', text: 'ডোপিং কি?', mark: '১' },
        { key: 'খ', text: 'শান্ট কিভাবে গ্যালভানোমিটারকে রক্ষা করে?', mark: '২' }
      ]
    }
  ]);

  // Questions manipulation handlers
  const handleAddQuestion = (type = 'CREATIVE') => {
    const newQ = {
      id: `q-${Date.now()}`,
      type,
      stem: type === 'CREATIVE' 
        ? 'উদ্দীপকের নতুন অনুচ্ছেদ এখানে লিখুন।' 
        : 'একটি নতুন বহুনির্বাচনি প্রশ্ন বা ছোট প্রশ্ন এখানে টাইপ করুন।',
      subQuestions: type === 'CREATIVE' ? [
        { key: 'ক', text: 'ক নম্বর জ্ঞানমূলক প্রশ্ন', mark: '১' },
        { key: 'খ', text: 'খ নম্বর অনুধাবনমূলক প্রশ্ন', mark: '২' },
        { key: 'গ', text: 'গ নম্বর প্রয়োগমূলক প্রশ্ন', mark: '৩' },
        { key: 'ঘ', text: 'ঘ নম্বর উচ্চতর দক্ষতামূলক প্রশ্ন', mark: '৪' }
      ] : [
        { key: 'ক', text: 'অপশন ক', mark: '০.৫' },
        { key: 'খ', text: 'অপশন খ', mark: '০.৫' }
      ]
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (qIndex, field, value, subIndex = null) => {
    const updated = [...questions];
    if (subIndex !== null) {
      updated[qIndex].subQuestions[subIndex].text = value;
    } else {
      updated[qIndex][field] = value;
    }
    setQuestions(updated);
  };

  const handleUpdateSubQuestionMark = (qIndex, subIndex, mark) => {
    const updated = [...questions];
    updated[qIndex].subQuestions[subIndex].mark = mark;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (qIndex) => {
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
    setFocusedBlock(null);
  };

  const handleDuplicateQuestion = (qIndex) => {
    const source = questions[qIndex];
    const copy = {
      ...source,
      id: `q-${Date.now()}`,
      subQuestions: source.subQuestions.map(s => ({ ...s }))
    };
    const updated = [...questions];
    updated.splice(qIndex + 1, 0, copy);
    setQuestions(updated);
  };

  const handleMoveQuestion = (qIndex, direction) => {
    if (direction === 'up' && qIndex === 0) return;
    if (direction === 'down' && qIndex === questions.length - 1) return;
    const targetIndex = direction === 'up' ? qIndex - 1 : qIndex + 1;
    const updated = [...questions];
    const temp = updated[qIndex];
    updated[qIndex] = updated[targetIndex];
    updated[targetIndex] = temp;
    setQuestions(updated);
  };

  // WYSIWYG Formatting actions helper
  const applyInlineStyle = (styleType, color = null) => {
    if (!focusedBlock) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    let wrappedText = '';
    if (styleType === 'BOLD') wrappedText = `<strong>${selectedText}</strong>`;
    if (styleType === 'ITALIC') wrappedText = `<em>${selectedText}</em>`;
    if (styleType === 'UNDERLINE') wrappedText = `<u>${selectedText}</u>`;
    if (styleType === 'COLOR' && color) wrappedText = `<span style="color: ${color}">${selectedText}</span>`;

    // Extract text element and replace
    const parentNode = range.commonAncestorContainer.parentNode;
    if (parentNode) {
      const doc = document.createElement('span');
      doc.innerHTML = wrappedText;
      range.deleteContents();
      range.insertNode(doc);
    }
  };

  // PDF Generator handler
  const handleDownloadPDF = () => {
    if (typeof window !== 'undefined') {
      setDownloading(true);
      const original = document.querySelector('.print-sheet');
      if (!original) {
        setDownloading(false);
        return;
      }

      // Create an isolated container to prevent layout clipping and fixed sidebar overlaps
      const tempDiv = document.createElement('div');
      tempDiv.className = original.className;
      tempDiv.innerHTML = original.innerHTML;

      // Force standard A4 dimensions and style resets on clone
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '15mm';
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.color = '#111827';
      tempDiv.style.fontFamily = paperFontFamily === 'sans-serif' ? 'sans-serif' : 'Kalpurush, SolaimanLipi, serif';

      // Temporarily append to body so html2canvas can compute styles
      document.body.appendChild(tempDiv);

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${examTitle || 'offline-exam'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2.5, 
          useCORS: true, 
          letterRendering: true,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
          alert('PDF জেনারেটর লোড করা সম্ভব হয়নি, সরাসরি প্রিন্ট অপশন খুলছে।');
          window.print();
        };
        document.body.appendChild(script);
      }
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-neutral-50">
      
      {/* ─── HEADER / CONTROLS (NO PRINT) ─── */}
      <div className="bg-[#0F5132] text-white p-5 border-b border-emerald-800 shadow-md no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
            <HiOutlineSparkles className="h-6 w-6 text-amber-300 animate-pulse" />
            ওএমআর ও অফলাইন প্রশ্ন জেনারেটর
          </h1>
          <p className="text-xs opacity-80 mt-1">উচ্চমানের দ্বৈত কলাম বিশিষ্ট বা একক কলাম বোর্ড স্ট্যান্ডার্ড প্রশ্নপত্র তৈরি করুন</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-amber-500 hover:bg-amber-600 text-neutral-900 font-extrabold px-6 py-2.5 rounded-xl shadow-lg border-none flex items-center gap-2 transition-all"
          >
            {downloading ? (
              <>
                <div className="h-4 w-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                <span>পিডিএফ জেনারেট হচ্ছে...</span>
              </>
            ) : (
              <>
                <HiOutlineDownload className="h-5 w-5" />
                <span>পিডিএফ ডাউনলোড</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* ─── LEFT WORKSPACE: QUESTION SHEET PREVIEW ─── */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between no-print">
            <span className="text-xs font-bold text-emerald-800">কুইক অ্যাকশন সেটিংস:</span>
            <button 
              onClick={() => handleAddQuestion('CREATIVE')}
              className="px-3.5 py-1.5 bg-[#0F5132] text-white rounded-lg text-xs font-black hover:bg-[#08291a] transition-all flex items-center gap-1"
            >
              <HiOutlinePlus className="h-4 w-4" />
              + আরও প্রশ্ন যুক্ত করুন
            </button>
          </div>

          {/* PRINTABLE SHEET PANEL */}
          <div className="bg-white border border-neutral-300 shadow-xl rounded-2xl p-8 overflow-x-auto select-text relative">
            
            {/* FLOATING WYSIWYG TOOLBAR */}
            {focusedBlock && editingMode && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40 bg-white border border-neutral-200 shadow-2xl rounded-xl p-2 flex items-center gap-1.5 no-print animate-slideUp">
                <button
                  type="button"
                  onClick={() => applyInlineStyle('BOLD')}
                  className="px-2.5 py-1 text-xs font-black border rounded hover:bg-neutral-50 text-neutral-800"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyInlineStyle('ITALIC')}
                  className="px-2.5 py-1 text-xs italic font-bold border rounded hover:bg-neutral-50 text-neutral-800"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => applyInlineStyle('UNDERLINE')}
                  className="px-2.5 py-1 text-xs underline font-bold border rounded hover:bg-neutral-50 text-neutral-800"
                  title="Underline"
                >
                  U
                </button>
                
                <span className="w-px h-5 bg-neutral-200 mx-1" />

                {/* Font Size Adjusters */}
                <button
                  type="button"
                  onClick={() => setFontSizeBase(prev => Math.max(10, prev - 1))}
                  className="px-2 py-0.5 text-xs font-bold border rounded hover:bg-neutral-50"
                >
                  -
                </button>
                <span className="text-[10px] font-bold text-neutral-500 px-1">{fontSizeBase}px</span>
                <button
                  type="button"
                  onClick={() => setFontSizeBase(prev => Math.min(22, prev + 1))}
                  className="px-2 py-0.5 text-xs font-bold border rounded hover:bg-neutral-50"
                >
                  +
                </button>

                <span className="w-px h-5 bg-neutral-200 mx-1" />

                {/* Color Palette */}
                <div className="flex gap-1">
                  {['#000000', '#D97706', '#DC2626', '#2563EB', '#16A34A'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => applyInlineStyle('COLOR', col)}
                      className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>

                <span className="w-px h-5 bg-neutral-200 mx-1" />

                <button 
                  onClick={() => setFocusedBlock(null)}
                  className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100"
                >
                  ডান
                </button>
              </div>
            )}

            {/* PRINT-SHEET CONTAINER */}
            <div 
              className="print-sheet mx-auto w-full max-w-[210mm] text-neutral-900 leading-relaxed"
              style={{ 
                fontSize: `${fontSizeBase}px`, 
                lineHeight: lineSpacing,
                fontFamily: paperFontFamily === 'sans-serif' ? 'sans-serif' : 'Kalpurush, SolaimanLipi, serif'
              }}
            >
              
              {/* ─── HEADER BLOCK ─── */}
              <div className="text-center border-b border-neutral-800 pb-3 mb-4 space-y-1 select-text">
                <h1 className="text-xl font-black tracking-wide uppercase select-all outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => setInstitutionName(e.target.innerText)}>
                  {institutionName}
                </h1>
                
                {metaExamTitle && (
                  <h2 className="text-sm font-bold text-neutral-700 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => setExamTitle(e.target.innerText)}>
                    {examTitle}
                  </h2>
                )}

                <div className="flex justify-center flex-wrap gap-4 text-xs font-bold text-neutral-600 mt-2">
                  {metaClass && (
                    <span className="outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => setClassName(e.target.innerText)}>
                      শ্রেণি: {className}
                    </span>
                  )}
                  {metaSubject && (
                    <span className="outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => setSubjectName(e.target.innerText)}>
                      বিষয়: {subjectName}
                    </span>
                  )}
                  {metaChapter && (
                    <span className="outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => setChapterName(e.target.innerText)}>
                      {chapterName}
                    </span>
                  )}
                </div>

                {/* Sub headers with Marks alignment and examiner box */}
                <div className="flex justify-between items-center text-xs font-bold pt-2 max-w-2xl mx-auto border-t border-dotted border-neutral-300 mt-2">
                  <span className="outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => setExamTime(e.target.innerText)}>{examTime}</span>
                  
                  {showSubjectCode && (
                    <div className="border border-neutral-800 px-2 py-0.5 font-black bg-neutral-50 text-[10px]">
                      বিষয় কোড: {subjectCode}
                    </div>
                  )}

                  {metaSetCode && (
                    <div className="font-extrabold text-emerald-800">
                      সেট কোড: {setCode}
                    </div>
                  )}

                  <span className="outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => setTotalMarks(e.target.innerText)}>{totalMarks}</span>
                </div>
              </div>

              {/* SPECIAL INSTRUCTIONS */}
              {metaInstructions && (
                <div className="text-xs font-semibold text-neutral-600 italic mb-5 leading-relaxed bg-neutral-50 p-2.5 rounded border border-neutral-100 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => setInstructions(e.target.innerText)}>
                  {instructions}
                </div>
              )}

              {/* ─── STUDENT EXAM CARD IF ENABLED ─── */}
              {showStudentInfo && (
                <div className="border border-neutral-800 p-4 rounded-xl mb-6 grid grid-cols-3 gap-3 text-xs font-bold bg-neutral-50">
                  <div>শিক্ষার্থীর নাম: ___________________________</div>
                  <div>রোল নম্বর: _________________</div>
                  <div>শাখা/সেকশন: ______________</div>
                </div>
              )}

              {/* ─── EXAMINER MARKS SCORECARD IF ENABLED ─── */}
              {showMarksBox && (
                <div className="flex justify-end mb-6">
                  <table className="border-collapse border border-neutral-800 text-[10px] text-center font-bold">
                    <thead>
                      <tr>
                        <th className="border border-neutral-800 px-2 py-1 bg-neutral-50">প্রশ্ন নং</th>
                        {questions.map((_, idx) => (
                          <th key={idx} className="border border-neutral-800 px-2.5 py-1">{idx + 1}</th>
                        ))}
                        <th className="border border-neutral-800 px-3 py-1 bg-neutral-100">মোট প্রাপ্ত</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-neutral-800 px-2 py-1.5 bg-neutral-50">নম্বর</td>
                        {questions.map((_, idx) => (
                          <td key={idx} className="border border-neutral-800 px-2.5 py-1.5"></td>
                        ))}
                        <td className="border border-neutral-800 px-3 py-1.5"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* ─── MAIN QUESTION BODY RENDERING ─── */}
              <div 
                className="grid gap-x-8 gap-y-6" 
                style={{ 
                  gridTemplateColumns: columnsCount === 2 ? 'repeat(2, minmax(0, 1fr))' : '1fr' 
                }}
              >
                {questions.map((q, qIndex) => {
                  const isActive = focusedBlock?.qIndex === qIndex;
                  return (
                    <div 
                      key={q.id}
                      className={`relative group p-2.5 rounded-xl border transition-all ${
                        isActive 
                          ? 'border-amber-400 bg-amber-50/20 shadow-md ring-2 ring-amber-400/20' 
                          : 'border-transparent hover:border-neutral-200 hover:bg-neutral-50/50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedBlock({ qIndex, field: 'stem' });
                      }}
                    >
                      {/* Left Reorder / Trash Float Bar (no-print) */}
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1.5 bg-white border border-neutral-200 px-2 py-1 rounded-lg shadow-sm no-print z-10">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveQuestion(qIndex, 'up'); }}
                          className="p-1 hover:bg-neutral-100 rounded text-neutral-500"
                          title="উপরে যান"
                        >
                          <HiOutlineArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveQuestion(qIndex, 'down'); }}
                          className="p-1 hover:bg-neutral-100 rounded text-neutral-500"
                          title="নিচে যান"
                        >
                          <HiOutlineArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDuplicateQuestion(qIndex); }}
                          className="p-1 hover:bg-neutral-100 rounded text-neutral-600"
                          title="ডুপ্লিকেট করুন"
                        >
                          <HiOutlineDuplicate className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(qIndex); }}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                          title="মুছে ফেলুন"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Question Index Prefix */}
                      <div className="flex gap-2 items-start font-bold">
                        <span className="font-extrabold text-neutral-800">
                          {String(qIndex + 1).padStart(2, '০')}.
                        </span>
                        
                        {/* Stem / Question Title ContentEditable */}
                        <div 
                          className="flex-1 outline-none select-text min-h-[20px]"
                          contentEditable={editingMode}
                          suppressContentEditableWarning
                          onBlur={(e) => handleUpdateQuestion(qIndex, 'stem', e.target.innerHTML)}
                          dangerouslySetInnerHTML={{ __html: q.stem }}
                        />
                      </div>

                      {/* Sub-Questions list (ক, খ, গ, ঘ) */}
                      {q.subQuestions && q.subQuestions.length > 0 && (
                        <div className="mt-3.5 pl-6 space-y-2 text-xs">
                          {q.subQuestions.map((sub, sIdx) => (
                            <div 
                              key={sIdx} 
                              className="flex items-start justify-between gap-2 hover:bg-neutral-100/50 p-1 rounded transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFocusedBlock({ qIndex, field: 'subQuestion', subIndex: sIdx });
                              }}
                            >
                              <div className="flex gap-2 items-start flex-1">
                                <span className="font-extrabold text-neutral-600">({sub.key})</span>
                                <div 
                                  className="outline-none flex-1 font-medium select-text min-h-[16px]"
                                  contentEditable={editingMode}
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleUpdateQuestion(qIndex, null, e.target.innerHTML, sIdx)}
                                  dangerouslySetInnerHTML={{ __html: sub.text }}
                                />
                              </div>

                              {showQuestionInfo && (
                                <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold no-print select-none">
                                  <span>নম্বর:</span>
                                  <input
                                    type="text"
                                    value={sub.mark}
                                    onChange={(e) => handleUpdateSubQuestionMark(qIndex, sIdx, e.target.value)}
                                    className="w-5 text-center border-b border-neutral-300 font-extrabold text-neutral-700 outline-none"
                                  />
                                </div>
                              )}

                              {showQuestionInfo && (
                                <span className="text-[11px] font-extrabold text-neutral-600 select-none pl-3">
                                  {sub.mark}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ─── INTEGRATED OMR PREVIEW AT PAPER BOTTOM IF ENABLED ─── */}
              {showOMR && (
                <div className="mt-12 pt-6 border-t-2 border-dashed border-neutral-400">
                  <div className="text-center mb-4">
                    <h3 className="font-extrabold text-xs text-neutral-800 uppercase tracking-widest">ওএমআর উত্তরপত্র সংযুক্তি (সংক্ষিপ্ত ৪টি অপশন বাবল শিট)</h3>
                    <p className="text-[9px] text-neutral-400">ওএমআর মূল্যায়ন স্ক্যানার দ্বারা স্বয়ংক্রিয় মূল্যায়নের জন্য ওএমআর বাবল শিট সংযুক্ত করা হয়েছে</p>
                  </div>

                  <div className="grid grid-cols-5 gap-3 max-w-xl mx-auto p-3 border rounded-xl bg-neutral-50/50">
                    {Array.from({ length: Math.min(25, questions.length * 4) }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 justify-center">
                        <span className="text-[9px] font-black text-neutral-400 w-4 text-right">{idx + 1}.</span>
                        <div className="flex gap-1">
                          {['ক', 'খ', 'গ', 'ঘ'].map((opt) => (
                            <div 
                              key={opt} 
                              className="h-3.5 w-3.5 rounded-full border border-neutral-500 flex items-center justify-center text-[7px] font-bold text-neutral-500 select-none"
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR: SETTINGS & DOWNLOAD ─── */}
        <div className="xl:col-span-4 space-y-6 no-print">
          
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {/* Sidebar Tab Header */}
            <div className="flex border-b border-neutral-100 bg-neutral-50/75">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 text-center text-xs font-extrabold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'border-[#0F5132] text-[#0F5132] bg-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <HiOutlineCog className="h-4.5 w-4.5" />
                কাস্টমাইজ সেটিংস
              </button>
              <button
                onClick={() => setActiveTab('download')}
                className={`flex-1 py-3 text-center text-xs font-extrabold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'download'
                    ? 'border-[#0F5132] text-[#0F5132] bg-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <HiOutlineDownload className="h-4.5 w-4.5" />
                রপ্তানি ও ডাউনলোড
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="p-5 space-y-5">
              
              {activeTab === 'settings' && (
                <>
                  {/* Section 1: Question Elements Attachments */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-neutral-800 border-b pb-1.5">প্রশ্নে সংযুক্তি (Layout Toggles)</h4>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>উত্তরপত্র ঘর সংযুক্তি</span>
                        <input 
                          type="checkbox" 
                          checked={showAnswerSheet}
                          onChange={(e) => setShowAnswerSheet(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>ওএমআর শিট সংযুক্তি (OMR attached)</span>
                        <input 
                          type="checkbox" 
                          checked={showOMR}
                          onChange={(e) => setShowOMR(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>গুরুত্বপূর্ণ প্রশ্ন চিহ্নিতকরণ</span>
                        <input 
                          type="checkbox" 
                          checked={showImportant}
                          onChange={(e) => setShowImportant(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>প্রশ্নের নম্বর/প্রাপ্ত তথ্য দেখান</span>
                        <input 
                          type="checkbox" 
                          checked={showQuestionInfo}
                          onChange={(e) => setShowQuestionInfo(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>শিক্ষার্থীর তথ্য কার্ড (Name/Roll)</span>
                        <input 
                          type="checkbox" 
                          checked={showStudentInfo}
                          onChange={(e) => setShowStudentInfo(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>নম্বর হিসাব ছক (Marks scorecard)</span>
                        <input 
                          type="checkbox" 
                          checked={showMarksBox}
                          onChange={(e) => setShowMarksBox(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>বিষয় কোড প্রদর্শন</span>
                        <input 
                          type="checkbox" 
                          checked={showSubjectCode}
                          onChange={(e) => setShowSubjectCode(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Header Metadata toggles */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-neutral-800 border-b pb-1.5">প্রশ্নের মেটাডাটা (হেডার)</h4>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>শ্রেণির নাম দেখান</span>
                        <input 
                          type="checkbox" 
                          checked={metaClass}
                          onChange={(e) => setMetaClass(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>বিষয়ের নাম দেখান</span>
                        <input 
                          type="checkbox" 
                          checked={metaSubject}
                          onChange={(e) => setMetaSubject(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>অধ্যায়ের নাম দেখান</span>
                        <input 
                          type="checkbox" 
                          checked={metaChapter}
                          onChange={(e) => setMetaChapter(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>সেট কোড দেখান</span>
                        <input 
                          type="checkbox" 
                          checked={metaSetCode}
                          onChange={(e) => setMetaSetCode(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>পরীক্ষার টাইটেল দেখান</span>
                        <input 
                          type="checkbox" 
                          checked={metaExamTitle}
                          onChange={(e) => setMetaExamTitle(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>পরীক্ষা নির্দেশনাবলী দেখান</span>
                        <input 
                          type="checkbox" 
                          checked={metaInstructions}
                          onChange={(e) => setMetaInstructions(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Document Customization */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-neutral-800 border-b pb-1.5">ডকুমেন্ট কাস্টমাইজেশন</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1">কলাম সংখ্যা (Columns Layout)</label>
                        <select 
                          value={columnsCount} 
                          onChange={(e) => setColumnsCount(Number(e.target.value))}
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs bg-white outline-none"
                        >
                          <option value={1}>১ কলাম (Standard)</option>
                          <option value={2}>২ কলাম (Board Double Columns)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1">ফন্ট টাইপ</label>
                        <select 
                          value={paperFontFamily} 
                          onChange={(e) => setPaperFontFamily(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs bg-white outline-none"
                        >
                          <option value="Kalpurush">কালপুরুষ (Kalpurush Serif)</option>
                          <option value="SolaimanLipi">সোলাইমানলিপি (SolaimanLipi Sans)</option>
                          <option value="sans-serif">সিস্টেম সাধারণ ফন্ট (Sans-Serif)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1">লাইন স্পেসিং (Line Spacing)</label>
                        <select 
                          value={lineSpacing} 
                          onChange={(e) => setLineSpacing(Number(e.target.value))}
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs bg-white outline-none"
                        >
                          <option value={1.2}>খুব কম (1.2)</option>
                          <option value={1.5}>স্বাভাবিক (1.5)</option>
                          <option value={1.8}>বেশি (1.8)</option>
                          <option value={2.0}>ডাবল (2.0)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600 border-t pt-2">
                        <span>এডিটিং মোড (Inline Edit)</span>
                        <input 
                          type="checkbox" 
                          checked={editingMode}
                          onChange={(e) => setEditingMode(e.target.checked)}
                          className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'download' && (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs font-medium text-neutral-600 text-left leading-relaxed">
                    <HiOutlineExclamationCircle className="h-5 w-5 text-emerald-600 mb-2 shrink-0" />
                    ডাউনলোডকৃত পিডিএফ ফাইলটি সরাসরি যেকোনো স্ট্যান্ডার্ড এ৪ (A4) প্রিন্টারের সাথে সামঞ্জস্যপূর্ণ। কাস্টম কলাম সেটিংস ২ কলামে সিলেক্ট করলে এটি সরাসরি মাধ্যমিক ও উচ্চমাধ্যমিক বোর্ড পরীক্ষার প্রশ্নপত্রের মত দেখাবে।
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 mb-1.5 text-left">সেট কোড টাইপ করুন</label>
                      <input 
                        type="text" 
                        value={setCode} 
                        onChange={(e) => setSetCode(e.target.value)}
                        placeholder="যেমন: ক"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 mb-1.5 text-left">বিষয় কোড</label>
                      <input 
                        type="text" 
                        value={subjectCode} 
                        onChange={(e) => setSubjectCode(e.target.value)}
                        placeholder="যেমন: ১৭৫"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none font-bold text-center"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="w-full py-3 bg-[#0F5132] text-white hover:bg-[#062416] text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-75"
                  >
                    <HiOutlineDownload className="h-4.5 w-4.5" />
                    ডকুমেন্ট ডাউনলোড ও মুদ্রণ (Print)
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Quick Helper Panel */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
              <HiOutlineExclamationCircle className="h-5 w-5 text-emerald-700 shrink-0" />
              টিউটোরিয়াল: কীভাবে প্রশ্নপত্রটি এডিট করবেন?
            </h4>
            <ul className="text-[11px] text-emerald-800 list-disc pl-4 space-y-1.5 font-medium leading-relaxed">
              <li>যেকোনো প্রশ্ন, উদ্দীপক, হেডার বা প্রতিষ্ঠানের নামের উপর ক্লিক করে সরাসরি টাইপ করা শুরু করুন।</li>
              <li>আপনার লেখা টেক্সট সিলেক্ট করলে উপরে স্টাইল করার জন্য বোল্ড, ইতালিক, আন্ডারলাইন এবং ফন্ট সাইজ প্যানেল প্রদর্শিত হবে।</li>
              <li>ডান পাশের সেটিংস থেকে কাস্টম কলাম সেটিংস ২ কলামে সেট করলে খাতাটি বোর্ড পরীক্ষার ফরম্যাটে রূপান্তরিত হবে।</li>
            </ul>
          </div>

        </div>

      </div>

      {/* ─── PRINT OPTIMIZED CSS MEDIA RULES ─── */}
      <style jsx global>{`
        @media print {
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

          nav, aside, header, .no-print, button, form, .sidebar-controls {
            display: none !important;
          }

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

        @font-face {
          font-family: 'Kalpurush';
          src: url('https://fonts.cdnfonts.com/css/kalpurush') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
