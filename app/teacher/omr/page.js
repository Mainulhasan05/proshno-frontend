'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
} from 'react-icons/hi';

const bubbleOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function TeacherOMRPage() {
  const { user } = useAuth();
  const [questionSets, setQuestionSets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [examTitle, setExamTitle] = useState('প্রথম সাময়িক পরীক্ষা');
  const [className, setClassName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [examDate, setExamDate] = useState(new Date().toLocaleDateString('bn-BD'));
  
  // OMR Config overrides
  const [columns, setColumns] = useState(2);
  const [questionsPerColumn, setQuestionsPerColumn] = useState(25);
  const [optionsPerQuestion, setOptionsPerQuestion] = useState(4);
  const [bubbleShape, setBubbleShape] = useState('circle');
  const [showRollGrid, setShowRollGrid] = useState(true);
  const [rollDigits, setRollDigits] = useState(6);
  const [showSetCodeGrid, setShowSetCodeGrid] = useState(true);

  // Total questions count (synced with question set or manually customized)
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(50);
  const [customQuestionCount, setCustomQuestionCount] = useState(false);

  useEffect(() => {
    if (user?.institutionName) {
      setInstitutionName(user.institutionName);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [qSetsRes, templatesRes] = await Promise.all([
          apiClient.get('/teacher/question-sets'),
          apiClient.get('/omr-templates'),
        ]);
        setQuestionSets(qSetsRes.data || []);
        setTemplates(templatesRes.data || []);
      } catch (err) {
        console.error('Failed to load data for OMR generator', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle Question Set Selection
  const handleQuestionSetChange = (e) => {
    const id = e.target.value;
    setSelectedQuestionSetId(id);
    if (id) {
      const qSet = questionSets.find(q => q._id === id);
      if (qSet) {
        setTotalQuestionsCount(qSet.totalQuestions || 25);
        setCustomQuestionCount(false);
        // Prefill subject/class if criteria are available
        if (qSet.filterCriteria) {
          if (qSet.filterCriteria.subjectId) {
            setSubjectName(qSet.filterCriteria.subjectName || '');
          }
          if (qSet.filterCriteria.className) {
            setClassName(qSet.filterCriteria.className || '');
          }
        }
      }
    }
  };

  // Handle OMR Template Selection
  const handleTemplateChange = (e) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    if (id) {
      const tpl = templates.find(t => t._id === id);
      if (tpl && tpl.layout) {
        setColumns(tpl.layout.columns || 2);
        setQuestionsPerColumn(tpl.layout.questionsPerColumn || 25);
        setOptionsPerQuestion(tpl.layout.optionsPerQuestion || 4);
        setBubbleShape(tpl.layout.bubbleShape || 'circle');
      }
    }
  };

  // Calculate actual questions list to display
  const actualQuestionCount = customQuestionCount 
    ? totalQuestionsCount 
    : Math.min(totalQuestionsCount, columns * questionsPerColumn);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen">
      {/* Top Header Controls (no-print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">OMR শিট জেনারেটর</h1>
          <p className="text-sm text-neutral-500 mt-1">আপনার প্রশ্ন সেট থেকে প্রিন্ট-রেডি OMR শিট তৈরি করুন</p>
        </div>
        <Button onClick={handlePrint} variant="primary" size="sm">
          <HiOutlinePrinter className="h-4 w-4 mr-1.5" />
          OMR শিট প্রিন্ট করুন
        </Button>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Pane: Customization Controls (no-print) */}
        <div className="xl:col-span-4 space-y-6 no-print">
          
          {/* Question Set Selection */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-neutral-800 font-semibold border-b pb-2">
              <HiOutlineClipboardList className="h-5 w-5 text-primary-500" />
              <span>১. প্রশ্ন সেট ও টেমপ্লেট</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">প্রশ্ন সেট নির্বাচন করুন</label>
                <select 
                  value={selectedQuestionSetId} 
                  onChange={handleQuestionSetChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                >
                  <option value="">নির্বাচন করুন (ঐচ্ছিক)</option>
                  {questionSets.map((q) => (
                    <option key={q._id} value={q._id}>
                      {q.name} ({q.totalQuestions} টি প্রশ্ন)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">OMR টেমপ্লেট নির্বাচন করুন</label>
                <select 
                  value={selectedTemplateId} 
                  onChange={handleTemplateChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                >
                  <option value="">ডিফল্ট টেমপ্লেট</option>
                  {templates.map((tpl) => (
                    <option key={tpl._id} value={tpl._id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Header Details */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-neutral-800 font-semibold border-b pb-2">
              <HiOutlineCog className="h-5 w-5 text-emerald-500" />
              <span>২. পরীক্ষার তথ্য ও হেডার</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">প্রতিষ্ঠানের নাম</label>
                <input 
                  type="text" 
                  value={institutionName} 
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="যেমন: মতিঝিল আইডিয়াল স্কুল"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">পরীক্ষার নাম</label>
                <input 
                  type="text" 
                  value={examTitle} 
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="যেমন: অর্ধবার্ষিক পরীক্ষা ২০২৬"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">শ্রেণি</label>
                  <input 
                    type="text" 
                    value={className} 
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="যেমন: শ্রেণি ৩"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">বিষয়</label>
                  <input 
                    type="text" 
                    value={subjectName} 
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="যেমন: গণিত"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">তারিখ</label>
                <input 
                  type="text" 
                  value={examDate} 
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Layout Configurations */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-neutral-800 font-semibold border-b pb-2">
              <HiOutlineCube className="h-5 w-5 text-amber-500" />
              <span>৩. OMR লেআউট কাস্টমাইজেশন</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700">কাস্টম প্রশ্ন সংখ্যা?</span>
                <input 
                  type="checkbox" 
                  checked={customQuestionCount}
                  onChange={(e) => setCustomQuestionCount(e.target.checked)}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
              </div>

              {customQuestionCount && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">মোট প্রশ্ন সংখ্যা</label>
                  <input 
                    type="number" 
                    value={totalQuestionsCount}
                    onChange={(e) => setTotalQuestionsCount(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    min="1"
                    max="200"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">কলাম সংখ্যা</label>
                  <select 
                    value={columns} 
                    onChange={(e) => setColumns(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  >
                    <option value={1}>১ কলাম</option>
                    <option value={2}>২ কলাম</option>
                    <option value={3}>৩ কলাম</option>
                    <option value={4}>৪ কলাম</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">কলামে প্রশ্ন সংখ্যা</label>
                  <input 
                    type="number" 
                    value={questionsPerColumn}
                    onChange={(e) => setQuestionsPerColumn(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    min="5"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">অপশন সংখ্যা (A-E)</label>
                  <input 
                    type="number" 
                    value={optionsPerQuestion}
                    onChange={(e) => setOptionsPerQuestion(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    min="2"
                    max="6"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">বাবল আকৃতি</label>
                  <select 
                    value={bubbleShape} 
                    onChange={(e) => setBubbleShape(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  >
                    <option value="circle">বৃত্ত (Circle)</option>
                    <option value="square">বর্গ (Square)</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700">রোল নাম্বার গ্রিড দেখান</span>
                  <input 
                    type="checkbox" 
                    checked={showRollGrid}
                    onChange={(e) => setShowRollGrid(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                </div>

                {showRollGrid && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">রোল নাম্বার ডিজিট</label>
                    <input 
                      type="number" 
                      value={rollDigits}
                      onChange={(e) => setRollDigits(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                      min="3"
                      max="10"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-xs font-semibold text-neutral-700">সেট কোড গ্রিড দেখান</span>
                  <input 
                    type="checkbox" 
                    checked={showSetCodeGrid}
                    onChange={(e) => setShowSetCodeGrid(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Pane: Sheet Live Preview & Printable Container */}
        <div className="xl:col-span-8 flex justify-center">
          
          <div className="print-sheet bg-white border border-neutral-300 shadow-xl rounded-xl p-[20mm] w-full max-w-[210mm] text-neutral-900 leading-tight">
            
            {/* Sheet Header */}
            <div className="text-center border-b-2 border-neutral-800 pb-4 mb-6">
              {institutionName ? (
                <h1 className="text-xl font-bold tracking-wide text-neutral-800 uppercase">{institutionName}</h1>
              ) : (
                <div className="h-6 w-48 bg-neutral-200 rounded mx-auto mb-1 no-print animate-pulse" />
              )}
              <h2 className="text-base font-bold text-neutral-700 mt-1 uppercase tracking-wider">{examTitle}</h2>
              
              <div className="grid grid-cols-3 text-xs font-medium text-neutral-600 mt-3 max-w-lg mx-auto">
                <div>শ্রেণি: {className || '_______'}</div>
                <div>বিষয়: {subjectName || '_______'}</div>
                <div>তারিখ: {examDate || '_______'}</div>
              </div>
            </div>

            {/* Student Info & Bubble Grids Section */}
            <div className="grid grid-cols-12 gap-6 border-b border-dashed border-neutral-400 pb-6 mb-6">
              
              {/* Written Information block (Name, Class, Roll etc.) */}
              <div className="col-span-7 space-y-3.5 text-xs">
                <div className="flex items-end">
                  <span className="font-bold shrink-0 mr-2">শিক্ষার্থীর নাম:</span>
                  <div className="border-b border-neutral-400 flex-1 h-5" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-end">
                    <span className="font-bold shrink-0 mr-2">শ্রেণি:</span>
                    <div className="border-b border-neutral-400 flex-1 h-5">{className}</div>
                  </div>
                  <div className="flex items-end">
                    <span className="font-bold shrink-0 mr-2">শাখা:</span>
                    <div className="border-b border-neutral-400 flex-1 h-5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-end">
                    <span className="font-bold shrink-0 mr-2">রোল নম্বর:</span>
                    <div className="border-b border-neutral-400 flex-1 h-5" />
                  </div>
                  <div className="flex items-end">
                    <span className="font-bold shrink-0 mr-2">আইডি:</span>
                    <div className="border-b border-neutral-400 flex-1 h-5" />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 leading-relaxed no-print text-[10px] text-neutral-500">
                  <p className="font-bold text-neutral-700 mb-1">নির্দেশনাবলী:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>শুধুমাত্র কালো বা বলপয়েন্ট কলম ব্যবহার করুন।</li>
                    <li>বৃত্তটি সম্পূর্ণভাবে ভরাট করুন। আংশিক ভরাট বা কাটা দাগ গ্রহণযোগ্য নয়।</li>
                    <li>প্রতিটি প্রশ্নের জন্য একটির বেশি উত্তর ভরাট করবেন না।</li>
                  </ul>
                </div>
              </div>

              {/* Roll Number Bubble Grid */}
              {showRollGrid && (
                <div className="col-span-3 border border-neutral-400 rounded-lg p-2 bg-white flex flex-col items-center">
                  <span className="text-[10px] font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">রোল নম্বর (ROLL)</span>
                  
                  <div className="flex gap-1.5">
                    {Array.from({ length: rollDigits }).map((_, colIndex) => (
                      <div key={colIndex} className="flex flex-col items-center">
                        {/* Digit box at top */}
                        <div className="h-5 w-5 border border-neutral-400 flex items-center justify-center text-[10px] font-bold rounded-sm mb-1 bg-neutral-50" />
                        {/* Bubble row (0 to 9) */}
                        {Array.from({ length: 10 }).map((_, digit) => (
                          <div 
                            key={digit} 
                            className={`h-4 w-4 border border-neutral-600 flex items-center justify-center text-[8px] font-semibold mb-0.5 cursor-default select-none ${
                              bubbleShape === 'square' ? 'rounded-sm' : 'rounded-full'
                            }`}
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
              {showSetCodeGrid && (
                <div className="col-span-2 border border-neutral-400 rounded-lg p-2 bg-white flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">সেট (SET)</span>
                  <div className="flex flex-col gap-1">
                    {['A', 'B', 'C', 'D'].map((setCode) => (
                      <div key={setCode} className="flex items-center gap-1.5">
                        <div 
                          className={`h-5 w-5 border border-neutral-600 flex items-center justify-center text-[10px] font-bold cursor-default select-none ${
                            bubbleShape === 'square' ? 'rounded-sm' : 'rounded-full'
                          }`}
                        >
                          {setCode}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Bubble Sheets Column Rows */}
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              
              {Array.from({ length: columns }).map((_, colIndex) => {
                const startIdx = colIndex * questionsPerColumn + 1;
                const endIdx = Math.min(startIdx + questionsPerColumn - 1, actualQuestionCount);
                
                if (startIdx > actualQuestionCount) return null;

                return (
                  <div key={colIndex} className="space-y-1 bg-white border border-transparent px-2">
                    {Array.from({ length: endIdx - startIdx + 1 }).map((_, rowIdx) => {
                      const qNumber = startIdx + rowIdx;
                      return (
                        <div key={qNumber} className="flex items-center gap-2 hover:bg-neutral-50 p-0.5 rounded transition-colors">
                          <span className="text-[10px] font-bold text-neutral-500 w-5 text-right">{qNumber}.</span>
                          <div className="flex gap-2">
                            {Array.from({ length: optionsPerQuestion }).map((_, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-1">
                                <div 
                                  className={`h-5 w-5 border-2 border-neutral-700 flex items-center justify-center text-[9px] font-bold transition-all ${
                                    bubbleShape === 'square' ? 'rounded-md' : 'rounded-full'
                                  }`}
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

          </div>

        </div>

      </div>

      {/* Global CSS style block for PDF/Print Optimization */}
      <style jsx global>{`
        @media print {
          /* Hide app dashboard shell elements */
          nav, aside, header, .no-print, button, form, .sidebar-controls {
            display: none !important;
          }
          
          /* Full A4 single page print styling */
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print-sheet {
            position: absolute;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 10mm !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
