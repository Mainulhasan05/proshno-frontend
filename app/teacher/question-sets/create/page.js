'use client';

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchTeacherClasses,
  fetchTeacherVersions,
  fetchTeacherSubjects,
  fetchTeacherChapters,
  fetchTeacherQuestions,
  createQuestionSet,
  autoGenerateQuestionSet,
} from '@/store/slices/teacherSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import {
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineSave,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineExclamation,
  HiOutlineChatAlt,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineCube,
  HiOutlineViewGrid,
} from 'react-icons/hi';
import MathRenderer from '@/components/shared/MathRenderer';
import toast from 'react-hot-toast';

export default function CreateQuestionSetPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { content, isLoading } = useSelector((state) => state.teacher);

  // Flow Step: 1 = Generator Form, 2 = Question Selection Workspace, 3 = Official Paper Preview
  const [step, setStep] = useState(1);
  const [creationMode, setCreationMode] = useState('auto'); // 'auto' (1-Click) or 'manual'

  // Form State
  const [examName, setExamName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState([]);
  const [examType, setExamType] = useState('COMBINED'); // 'MCQ', 'CQ', 'COMBINED'
  const [targetCount, setTargetCount] = useState(100);

  // Selected Question IDs in Workspace
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [loadedQuestions, setLoadedQuestions] = useState([]);
  const [generatedSetDetail, setGeneratedSetDetail] = useState(null);

  // Multi-Select Modals State
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [chapterSearch, setChapterSearch] = useState('');

  // Sidebar Filter States (Screenshots 5, 6, 7)
  const [keywordSearch, setKeywordSearch] = useState('');
  const [uniqueMode, setUniqueMode] = useState(true);
  const [historySets, setHistorySets] = useState([
    { id: '1', name: 'hsc physics sample', type: 'mcq', count: 0, excluded: false },
    { id: '2', name: 'khgjhdf', type: 'mcq', count: 20, excluded: false },
    { id: '3', name: 'Test 05', type: 'mcq', count: 0, excluded: false },
    { id: '4', name: 'fasfasf', type: 'All', count: 0, excluded: false },
  ]);
  const [sidebarChapterFilter, setSidebarChapterFilter] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [sidebarType, setSidebarType] = useState('MCQ');
  const [typeLock, setTypeLock] = useState(false);
  const [expandedExplanationIds, setExpandedExplanationIds] = useState([]);

  const toggleExplanation = (id) => {
    setExpandedExplanationIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Board Filter Section
  const [boardSectionOpen, setBoardSectionOpen] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBoards, setSelectedBoards] = useState([]);
  const BOARDS = [
    { id: 'Dhaka', name: 'ঢাকা বোর্ড' },
    { id: 'Barisal', name: 'বরিশাল বোর্ড' },
    { id: 'Dinajpur', name: 'দিনাজপুর বোর্ড' },
    { id: 'Comilla', name: 'কুমিল্লা বোর্ড' },
    { id: 'Jessore', name: 'যশোর বোর্ড' },
    { id: 'Sylhet', name: 'সিলেট বোর্ড' },
    { id: 'Rajshahi', name: 'রাজশাহী বোর্ড' },
    { id: 'Mymensingh', name: 'ময়মনসিংহ বোর্ড' },
    { id: 'Chittagong', name: 'চট্টগ্রাম বোর্ড' },
  ];

  const [specialFilters, setSpecialFilters] = useState({
    repeatedBoard: false,
    mathematical: false,
    theoretical: false,
    hasImage: false,
    multipleCorrect: false,
    passageBased: false,
  });

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Fetch Classes on Mount
  useEffect(() => {
    dispatch(fetchTeacherClasses());
  }, [dispatch]);

  // Fetch Versions when Class changes
  useEffect(() => {
    if (selectedClassId) {
      dispatch(fetchTeacherVersions(selectedClassId));
    }
  }, [selectedClassId, dispatch]);

  // Auto-select first version if available
  useEffect(() => {
    if (content.versions && content.versions.length > 0) {
      setSelectedVersionId(content.versions[0]._id);
    }
  }, [content.versions]);

  // Fetch Subjects when Class & Version changes
  useEffect(() => {
    if (selectedClassId && selectedVersionId) {
      dispatch(fetchTeacherSubjects({ classId: selectedClassId, versionId: selectedVersionId }));
    }
  }, [selectedClassId, selectedVersionId, dispatch]);

  // Fetch Chapters when selected subjects change
  useEffect(() => {
    if (selectedSubjectIds.length > 0) {
      dispatch(fetchTeacherChapters(selectedSubjectIds[0]));
    }
  }, [selectedSubjectIds, dispatch]);

  // Selected names for display
  const selectedClassName = useMemo(() => {
    return content.classes.find((c) => c._id === selectedClassId)?.name || '';
  }, [content.classes, selectedClassId]);

  const selectedSubjectNames = useMemo(() => {
    const subs = content.subjects.filter((s) => selectedSubjectIds.includes(s._id));
    return subs.map((s) => s.name).join(', ') || 'সকল বিষয়';
  }, [content.subjects, selectedSubjectIds]);

  // Active Chapter Topics
  const activeChapterTopics = useMemo(() => {
    if (!sidebarChapterFilter) return [];
    const chapter = content.chapters.find((c) => c._id === sidebarChapterFilter);
    return chapter?.topics || [
      { _id: 't1', name: 'আধুনিক পদার্থবিজ্ঞানের ধারণা, মৌলিক বল' },
      { _id: 't2', name: 'মাইকেলসন মোরলে পরীক্ষা ও আইনস্টাইনের আপেক্ষিকতা তত্ত্ব' },
      { _id: 't3', name: 'গ্যালিলিয়ান রূপান্তর ও লরেন্টজ রূপান্তর' },
      { _id: 't4', name: 'সময় সম্প্রসারণ ও দৈর্ঘ্য সংকোচন' },
      { _id: 't5', name: 'ভর শক্তির সম্পর্ক ও ফটোইলেকট্রিক ক্রিয়া' },
      { _id: 't6', name: 'মহাকাশ ভ্রমণে আপেক্ষিকতা তত্ত্বের ব্যবহার' },
      { _id: 't7', name: 'প্লাঙ্কের কালো বস্তুর বিকিরণ' },
      { _id: 't8', name: 'এক্স রে' },
      { _id: 't9', name: 'কম্পটন ক্রিয়া, ডি-ব্রগলি তরঙ্গ দৈর্ঘ্য ও অনিশ্চয়তা নীতি' },
    ];
  }, [content.chapters, sidebarChapterFilter]);

  // Filtered Questions for Workspace
  const filteredQuestions = useMemo(() => {
    let list = loadedQuestions.length > 0 ? loadedQuestions : content.questions || [];

    if (keywordSearch.trim()) {
      const q = keywordSearch.toLowerCase();
      list = list.filter((item) => item.questionText?.toLowerCase().includes(q));
    }

    if (sidebarChapterFilter) {
      list = list.filter((item) => item.chapterId === sidebarChapterFilter || item.chapterId?._id === sidebarChapterFilter);
    }

    if (selectedTopicIds.length > 0) {
      list = list.filter((item) => selectedTopicIds.includes(item.topicId) || selectedTopicIds.includes(item.topicId?._id));
    }

    if (typeLock && sidebarType) {
      list = list.filter((item) => item.type === sidebarType);
    }

    if (specialFilters.repeatedBoard) {
      list = list.filter((item) => item.boardInfo && item.boardInfo.length > 1);
    }
    if (specialFilters.mathematical) {
      list = list.filter((item) => item.category === 'mathematical' || item.category === 'both' || item.questionText?.includes('c') || item.questionText?.includes('='));
    }
    if (specialFilters.theoretical) {
      list = list.filter((item) => item.category === 'theoretical' || item.category === 'both' || !item.questionText?.includes('='));
    }
    if (specialFilters.hasImage) {
      list = list.filter((item) => item.containImage || item.questionImage);
    }
    if (specialFilters.multipleCorrect) {
      list = list.filter((item) => item.format === 'multiple_correct');
    }
    if (specialFilters.passageBased) {
      list = list.filter((item) => item.format === 'passage_mcq' || item.type === 'CQ');
    }

    if (selectedYear) {
      list = list.filter((item) => item.boardInfo && item.boardInfo.some((b) => Number(b.year) === Number(selectedYear)));
    }

    if (selectedBoards.length > 0) {
      list = list.filter((item) =>
        item.boardInfo &&
        item.boardInfo.some((b) =>
          selectedBoards.includes(b.boardId?.shortForm) ||
          selectedBoards.includes(b.boardId?.name) ||
          selectedBoards.some((sb) => b.boardId?.shortForm?.includes(sb))
        )
      );
    }

    return list;
  }, [loadedQuestions, content.questions, keywordSearch, sidebarChapterFilter, selectedTopicIds, typeLock, sidebarType, specialFilters, selectedYear, selectedBoards]);

  // Handle 1-Click Auto Generation
  const handleAutoGenerate = async () => {
    if (!examName.trim()) {
      toast.error('প্রোগ্রাম/পরীক্ষার নাম লিখুন');
      return;
    }
    if (!selectedClassId) {
      toast.error('শ্রেণি নির্বাচন করুন');
      return;
    }
    if (selectedSubjectIds.length === 0) {
      toast.error('অন্তত একটি বিষয় নির্বাচন করুন');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      const result = await dispatch(
        autoGenerateQuestionSet({
          name: examName.trim(),
          classId: selectedClassId,
          subjectIds: selectedSubjectIds,
          chapterIds: selectedChapterIds,
          type: examType,
          questionCount: Number(targetCount) || 100,
        })
      ).unwrap();

      setGeneratedSetDetail(result);
      if (result && result.questions) {
        const qList = result.questions.map((item) => (item.questionId ? item.questionId : item));
        setLoadedQuestions(qList);
        setSelectedQuestionIds(qList.map((q) => q._id));
      }
      toast.success('প্রশ্নসেট সফলভাবে তৈরি হয়েছে!');
      setStep(3); // Navigate to official Paper Preview screen
    } catch (err) {
      setError(typeof err === 'string' ? err : 'প্রশ্নসেট তৈরি ব্যর্থ হয়েছে');
      toast.error(typeof err === 'string' ? err : 'প্রশ্নসেট তৈরি ব্যর্থ হয়েছে');
    } finally {
      setGenerating(false);
    }
  };

  // Toggle Single Question Selection
  const toggleQuestionSelect = (id) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select All / Deselect All
  const toggleSelectAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map((q) => q._id));
    }
  };

  // Save Final Question Set
  const handleSaveQuestionSet = async () => {
    if (!examName.trim()) {
      toast.error('প্রশ্ন সেটের নাম দিন');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      toast.error('অন্তত একটি প্রশ্ন নির্বাচন করুন');
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        createQuestionSet({
          name: examName.trim(),
          description: `১ ক্লিকে তৈরি পরীক্ষা`,
          questionIds: selectedQuestionIds,
          filterCriteria: {
            classId: selectedClassId,
            subjectId: selectedSubjectIds[0],
            chapterIds: selectedChapterIds,
          },
        })
      ).unwrap();
      toast.success('প্রশ্নসেট সফলভাবে সংরক্ষিত হয়েছে!');
      router.push('/teacher/question-sets');
    } catch (err) {
      toast.error(err || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
              title="ফিরে যান"
            >
              <HiOutlineArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-neutral-800">
                {step === 1 ? '১ ক্লিকে প্রশ্ন তৈরি' : examName || 'প্রশ্ন সেট তৈরি'}
              </h1>
              <p className="text-xs text-neutral-500">
                {step === 1 ? 'সহজ ও দ্রুত উপায়ে প্রশ্নপত্র তৈরি করুন' : `${selectedClassName || ''} • ${selectedSubjectNames}`}
              </p>
            </div>
          </div>

          {/* Action Bar for Step 2 & 3 */}
          {step > 1 && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 transition-all">
                <input
                  type="checkbox"
                  checked={selectedQuestionIds.length > 0 && selectedQuestionIds.length === filteredQuestions.length}
                  onChange={toggleSelectAll}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>সব নির্বাচন</span>
              </label>

              <Button
                variant={step === 3 ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStep(step === 3 ? 2 : 3)}
                className="flex items-center gap-1 text-xs"
              >
                <HiOutlineEye className="h-4 w-4" />
                {step === 3 ? 'সম্পাদনা মোড' : 'প্রিভিউ'}
              </Button>

              <Button
                size="sm"
                onClick={handleSaveQuestionSet}
                loading={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 text-xs"
              >
                <HiOutlineSave className="h-4 w-4" />
                সেভ
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            STEP 1: Generator Form ("১ ক্লিকে প্রশ্ন তৈরি") - Screenshots 1, 2, 3
           ════════════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                  ১ ক্লিকে প্রশ্ন তৈরি
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করে মুহূর্তেই শতভাগ নির্ভুল প্রশ্নপত্র প্রস্তুত করুন।
                </p>
              </div>

              {/* 1. Exam Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  প্রোগ্রাম/পরীক্ষার নাম লিখুন *
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="যেমন: New Educare / মডেল টেস্ট ২০২৬"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                  required
                />
              </div>

              {/* 2. Class Select */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  শ্রেণি *
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedSubjectIds([]);
                    setSelectedChapterIds([]);
                  }}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                  required
                >
                  <option value="">শ্রেণি সিলেক্ট করুন</option>
                  {content.classes?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Subject Multi-Select Modal Trigger */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  বিষয় *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedClassId) {
                      toast.error('প্রথমে শ্রেণি নির্বাচন করুন');
                      return;
                    }
                    setSubjectModalOpen(true);
                  }}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm font-medium bg-white flex items-center justify-between hover:border-emerald-500 transition-all text-neutral-800"
                >
                  <span>
                    {selectedSubjectIds.length > 0
                      ? `নির্বাচিত বিষয় (${selectedSubjectIds.length} টি): ${selectedSubjectNames}`
                      : 'বিষয় পছন্দ করুন'}
                  </span>
                  <HiOutlineViewGrid className="h-5 w-5 text-neutral-400" />
                </button>
              </div>

              {/* 4. Chapter Multi-Select Modal Trigger */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  অধ্যায় *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedSubjectIds.length === 0) {
                      toast.error('প্রথমে বিষয় নির্বাচন করুন');
                      return;
                    }
                    setChapterModalOpen(true);
                  }}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm font-medium bg-white flex items-center justify-between hover:border-emerald-500 transition-all text-neutral-800"
                >
                  <span>
                    {selectedChapterIds.length > 0
                      ? `নির্বাচিত অধ্যায় (${selectedChapterIds.length} টি)`
                      : 'অধ্যায় পছন্দ করুন'}
                  </span>
                  <HiOutlineViewGrid className="h-5 w-5 text-neutral-400" />
                </button>
              </div>

              {/* 5. Exam Type & Target Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    টাইপ *
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                  >
                    <option value="MCQ">বহুনির্বাচনী (MCQ)</option>
                    <option value="CQ">সৃজনশীল (CQ)</option>
                    <option value="COMBINED">সমন্বিত প্রশ্ন (সৃজঃ + বহুঃ + সংক্ষিপ্ত + অন্যান্য)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    নম্বর / প্রশ্ন সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={targetCount}
                    onChange={(e) => setTargetCount(e.target.value)}
                    min={1}
                    max={200}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all text-center font-mono text-lg"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  disabled={generating}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {generating ? (
                    <span>প্রশ্ন তৈরী করা হচ্ছে...</span>
                  ) : (
                    <>
                      <span>প্রশ্ন তৈরী করুন</span>
                      <HiOutlineChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            STEP 2: Question Selection Workspace & Filter Sidebar (Screenshot 5)
           ════════════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: Questions List (3 Cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Notice Banner */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 text-center font-medium shadow-xs">
                প্রশ্নে ভুল পেলে রিপোর্ট করে প্রশ্নব্যাংক সমৃদ্ধ করুন।
              </div>

              {/* Counter Header */}
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-neutral-200 shadow-xs">
                <span className="text-sm font-bold text-neutral-800">
                  {examName || 'প্রশ্ন সেট'}
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                  {selectedQuestionIds.length}/{targetCount} নির্বাচিত
                </span>
              </div>

              {/* Questions Feed */}
              {filteredQuestions.length === 0 ? (
                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
                  কোনো প্রশ্ন পাওয়া যায়নি। ফিল্টার পরিবর্তন করুন।
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isSelected = selectedQuestionIds.includes(q._id);
                  const isExplanationExpanded = expandedExplanationIds.includes(q._id);

                  // Extract all tags (University, Board, Top School)
                  const tags = [];
                  if (q.university && q.university.length > 0) {
                    q.university.forEach((u) => {
                      const uniName = u.universityId?.name || u.universityId?.shortForm || 'বিশ্ববিদ্যালয়';
                      const yr = u.year ? `'${String(u.year).slice(-2)}` : '';
                      tags.push(`[${uniName}${yr}]`);
                    });
                  }
                  if (q.boardInfo && q.boardInfo.length > 0) {
                    q.boardInfo.forEach((b) => {
                      const bName = b.boardId?.shortForm || b.boardId?.name || 'বোর্ড';
                      const yr = b.year ? `'${String(b.year).slice(-2)}` : '';
                      tags.push(`[${bName}${yr}]`);
                    });
                  }
                  if (q.topSchool && q.topSchool.length > 0) {
                    q.topSchool.forEach((ts) => {
                      const sName = ts.schoolId?.name || 'স্কুল';
                      const yr = ts.year ? `'${String(ts.year).slice(-2)}` : '';
                      tags.push(`[${sName}${yr}]`);
                    });
                  }

                  // Default fallback tags for demo if empty
                  if (tags.length === 0) {
                    if (idx % 3 === 0) tags.push("[জাহাঙ্গীরনগর বিশ্ববিদ্যালয় '১৭]");
                    else if (idx % 3 === 1) tags.push("[চট্টগ্রাম বিশ্ববিদ্যালয় '২২]");
                    else tags.push("[ঢাকা বোর্ড '২১]");
                  }

                  return (
                    <motion.div
                      key={q._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => toggleQuestionSelect(q._id)}
                      className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-l-[6px] border-l-emerald-500 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/10'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {/* Top Row: Tags & Actions */}
                      <div className="flex items-center justify-end gap-2 mb-2">
                        {/* Yellow Tag Badges (Matching Screenshot 8) */}
                        {tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-yellow-300 text-amber-900 border border-yellow-400 font-bold px-2 py-0.5 rounded text-[11px] shadow-2xs"
                          >
                            {tag}
                          </span>
                        ))}

                        {/* View Explanation Button (Matching Screenshot 8) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExplanation(q._id);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          {isExplanationExpanded ? 'ব্যাখ্যা লুকান' : 'ব্যাখ্যা দেখুন'}
                        </button>

                        {/* Report Speech Bubble Icon */}
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                          title="রিপোর্ট করুন"
                        >
                          <HiOutlineChatAlt className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Question Text */}
                      <div className="flex items-start gap-2.5 mb-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleQuestionSelect(q._id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="font-semibold text-sm text-neutral-900 leading-relaxed">
                          <span className="font-bold text-emerald-700 mr-1.5">{idx + 1}.</span>
                          <MathRenderer text={q.questionText} />
                        </div>
                      </div>

                      {/* Options Grid for MCQ */}
                      {q.type === 'MCQ' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`text-xs px-3 py-2 rounded-xl border flex items-center gap-2 ${
                                opt.isCorrect
                                  ? 'bg-indigo-900 text-white font-medium border-indigo-900 shadow-xs'
                                  : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                              }`}
                            >
                              <span className="font-bold shrink-0">
                                {['ক', 'খ', 'গ', 'ঘ', 'ঙ'][oIdx] || oIdx + 1})
                              </span>
                              <MathRenderer text={opt.text} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Subparts for CQ */}
                      {q.type === 'CQ' && q.subParts && (
                        <div className="space-y-1.5 mt-3 pl-6 border-l-2 border-emerald-300">
                          {q.subParts.map((sp, spIdx) => (
                            <div key={spIdx} className="text-xs text-neutral-700">
                              <span className="font-bold text-emerald-800 mr-1">{sp.partLabel}.</span>
                              <MathRenderer text={sp.text} />
                              <span className="text-[10px] text-neutral-400 ml-1">({sp.marks} নম্বর)</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Expanded Explanation Box */}
                      {isExplanationExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-sans space-y-1"
                        >
                          <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <HiOutlineCheckCircle className="h-4 w-4 text-emerald-600" />
                            ব্যাখ্যা / সঠিক উত্তর:
                          </div>
                          <div className="pl-5 leading-relaxed">
                            <MathRenderer text={q.explanation || q.expectedAnswer || q.answer || 'সঠিক উত্তর নির্বাচন করুন। বিস্তারিত ব্যাখ্যা শীঘ্রই যুক্ত করা হবে।'} />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Right Column: Advanced Sidebar Filter Menu (Screenshots 5, 6, 7) */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-5 sticky top-20 shadow-xs text-xs max-h-[85vh] overflow-y-auto">
                <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
                  এডভান্সড ফিল্টার মেনু
                </h3>

                {/* Keyword Search */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={keywordSearch}
                    onChange={(e) => setKeywordSearch(e.target.value)}
                    placeholder="কিওয়ার্ড সার্চ করুন"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none text-xs"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold rounded-lg shrink-0"
                  >
                    সার্চ করুন
                  </button>
                </div>

                {/* Mode Switch Pills & Previous History Sets (Screenshot 5) */}
                <div className="space-y-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUniqueMode(true)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex-1 transition-all ${
                        uniqueMode ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-neutral-600 border'
                      }`}
                    >
                      ইউনিক মোড
                    </button>
                    <button
                      type="button"
                      onClick={() => setUniqueMode(false)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex-1 transition-all ${
                        !uniqueMode ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-neutral-600 border'
                      }`}
                    >
                      কমল প্রশ্ন (নতুন)
                    </button>
                  </div>
                  <div className="text-center font-bold text-emerald-800 text-xs">
                    ইউনিক প্রশ্ন তৈরি
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed font-sans text-center">
                    পূর্বের প্রশ্ন বাদ দিয়ে নতুন প্রশ্ন তৈরি হবে, একটি পরীক্ষার সাথে অন্য পরীক্ষার প্রশ্ন মিল হবে না।
                  </p>

                  {/* Previous Sets Tag List */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {historySets.map((hs) => (
                      <div
                        key={hs.id}
                        className={`flex items-center justify-between p-2 rounded-lg border bg-white ${
                          hs.excluded ? 'opacity-50 line-through' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${hs.type === 'mcq' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                            {hs.type}
                          </span>
                          <span className="truncate text-xs font-semibold text-neutral-800">{hs.name}</span>
                          <span className="text-[10px] text-neutral-400">({hs.count})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setHistorySets((prev) =>
                              prev.map((item) => (item.id === hs.id ? { ...item, excluded: !item.excluded } : item))
                            );
                          }}
                          className="h-5 w-5 rounded-full bg-neutral-100 hover:bg-rose-100 text-neutral-500 hover:text-rose-600 flex items-center justify-center shrink-0 font-bold"
                          title="বাদ দিন"
                        >
                          ➖
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Search Checkboxes (Screenshot 5) */}
                <div className="space-y-2 pt-1 border-t border-neutral-100">
                  <span className="font-bold text-neutral-800 block text-xs">প্রশ্নব্যাংক স্পেশাল সার্চ</span>
                  {[
                    { key: 'repeatedBoard', label: 'রিপিটেড বোর্ড প্রশ্ন' },
                    { key: 'mathematical', label: 'গাণিতিক' },
                    { key: 'theoretical', label: 'তত্ত্বীয়' },
                    { key: 'hasImage', label: 'চিত্রযুক্ত প্রশ্ন' },
                    { key: 'multipleCorrect', label: 'বহুপদী সমাপ্তিসূচক' },
                    { key: 'passageBased', label: 'অভিন্ন তথ্যভিত্তিক' },
                  ].map((sf) => (
                    <label key={sf.key} className="flex items-center gap-2 cursor-pointer text-neutral-700 hover:text-neutral-900">
                      <input
                        type="checkbox"
                        checked={specialFilters[sf.key]}
                        onChange={(e) => setSpecialFilters({ ...specialFilters, [sf.key]: e.target.checked })}
                        className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{sf.label}</span>
                    </label>
                  ))}
                </div>

                {/* Chapter Selection (Screenshot 5 & 6) */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <span className="font-bold text-neutral-800 block text-xs">অধ্যায়</span>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                      <input
                        type="radio"
                        name="sidebarChapter"
                        checked={!sidebarChapterFilter}
                        onChange={() => {
                          setSidebarChapterFilter('');
                          setSelectedTopicIds([]);
                        }}
                      />
                      <span>সকল অধ্যায়</span>
                    </label>
                    {content.chapters?.map((ch) => (
                      <label key={ch._id} className="flex items-center gap-2 cursor-pointer text-neutral-700 truncate" title={ch.name}>
                        <input
                          type="radio"
                          name="sidebarChapter"
                          checked={sidebarChapterFilter === ch._id}
                          onChange={() => {
                            setSidebarChapterFilter(ch._id);
                            setSelectedTopicIds([]);
                          }}
                        />
                        <span className="truncate">{ch.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Topic Selection Checkboxes (Screenshot 6) */}
                {sidebarChapterFilter && (
                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <span className="font-bold text-neutral-800 block text-xs">
                      টপিক - {content.chapters.find((c) => c._id === sidebarChapterFilter)?.name || 'অধ্যায়'}
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {activeChapterTopics.map((top) => {
                        const checked = selectedTopicIds.includes(top._id);
                        return (
                          <label key={top._id} className="flex items-start gap-2 cursor-pointer text-neutral-700 hover:text-neutral-900 leading-tight">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedTopicIds((prev) =>
                                  prev.includes(top._id) ? prev.filter((x) => x !== top._id) : [...prev, top._id]
                                );
                              }}
                              className="mt-0.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                            />
                            <span>{top.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Type & TypeLock Switch (Screenshot 6 & 7) */}
                <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between bg-neutral-100 p-2 rounded-lg">
                    <span className="font-bold text-neutral-800 text-xs">টাইপ</span>
                    <button
                      type="button"
                      onClick={() => setTypeLock(!typeLock)}
                      className={`p-1.5 rounded-md transition-colors ${typeLock ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-500 border'}`}
                      title={typeLock ? 'TypeLock সক্রিয়' : 'TypeLock নিষ্ক্রিয়'}
                    >
                      🔒
                    </button>
                  </div>

                  <div className="space-y-1.5 border border-neutral-200 rounded-lg p-2">
                    <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                      <input
                        type="radio"
                        name="sidebarType"
                        checked={sidebarType === 'MCQ'}
                        onChange={() => setSidebarType('MCQ')}
                      />
                      <span>বহুনির্বাচনী</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                      <input
                        type="radio"
                        name="sidebarType"
                        checked={sidebarType === 'CQ'}
                        onChange={() => setSidebarType('CQ')}
                      />
                      <span>সৃজনশীল</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed font-sans bg-neutral-50 p-2 rounded border text-center">
                    টাইপ ফিক্সড রাখতে TypeLock চালু করুন। নির্বাচিত অধ্যায়ে ফিক্সড টাইপ না থাকলে এটি নড়াচড়া করবে।
                  </p>
                </div>

                {/* Collapsible Board & Year Section (Screenshot 7) */}
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBoardSectionOpen(!boardSectionOpen)}
                    className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 font-bold text-neutral-800 text-xs cursor-pointer transition-colors"
                  >
                    <span>বোর্ড</span>
                    <span className={`transform transition-transform ${boardSectionOpen ? 'rotate-180' : ''}`}>▲</span>
                  </button>

                  {boardSectionOpen && (
                    <div className="p-3 space-y-3 bg-white">
                      {/* Year Selector */}
                      <div>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none bg-white font-medium"
                        >
                          <option value="">Year (সকল বছর)</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                          <option value="2021">2021</option>
                          <option value="2020">2020</option>
                          <option value="2019">2019</option>
                          <option value="2018">2018</option>
                          <option value="2017">2017</option>
                        </select>
                      </div>

                      {/* Education Boards Checkboxes */}
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {BOARDS.map((b) => {
                          const checked = selectedBoards.includes(b.id);
                          return (
                            <label key={b.id} className="flex items-center gap-2 cursor-pointer text-neutral-700 hover:text-neutral-900 text-xs">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedBoards((prev) =>
                                    prev.includes(b.id) ? prev.filter((x) => x !== b.id) : [...prev, b.id]
                                  );
                                }}
                                className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>{b.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            STEP 3: Official Paper Preview Screen (Screenshot 4)
           ════════════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
            {/* Styled Printable Question Paper Sheet */}
            <div className="bg-white rounded-2xl border border-neutral-300 shadow-md p-8 sm:p-12 space-y-6 font-serif">
              {/* Header Box (Screenshot 4) */}
              <div className="text-center space-y-1.5 border-b border-neutral-200 pb-4">
                <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                  {examName || 'New Educare'}
                </h1>
                <h2 className="text-base font-bold text-neutral-800">
                  {selectedClassName || 'এইচএসসি'}
                </h2>
                <h3 className="text-sm font-bold text-neutral-700">
                  {selectedSubjectNames || 'পদার্থবিজ্ঞান ২য় পত্র'}
                </h3>

                <div className="flex justify-between items-center text-xs font-bold text-neutral-800 pt-3">
                  <span>সময়: ১ ঘণ্টা ৪০ মিনিট</span>
                  <span>পূর্ণমান: {loadedQuestions.reduce((acc, q) => acc + (q.marks || 1), 0) || targetCount}</span>
                </div>

                <div className="text-center text-xs font-semibold text-neutral-700 pt-2 border-t border-neutral-100">
                  প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেয়া যাবেনা।
                </div>
              </div>

              {/* Printable Question Body */}
              <div className="space-y-6 text-sm text-neutral-900 leading-relaxed font-sans pt-2">
                {loadedQuestions.map((q, idx) => (
                  <div key={q._id || idx} className="space-y-2">
                    <div className="font-semibold flex items-start gap-2">
                      <span className="font-bold">{idx + 1}.</span>
                      <div className="flex-1">
                        <MathRenderer text={q.questionText} />
                      </div>
                      <span className="text-xs font-semibold text-neutral-500">[{q.marks || 1}]</span>
                    </div>

                    {/* MCQ Options */}
                    {q.type === 'MCQ' && q.options && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-5 text-xs text-neutral-800">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-1">
                            <span className="font-bold">{['ক', 'খ', 'গ', 'ঘ', 'ঙ'][oIdx] || oIdx + 1})</span>
                            <MathRenderer text={opt.text} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CQ Subparts */}
                    {q.type === 'CQ' && q.subParts && (
                      <div className="space-y-1.5 pl-5 text-xs text-neutral-800">
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
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Success & Add Questions Banner (Screenshot 4) */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-6 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-lg">
                <HiOutlineCheckCircle className="h-6 w-6" />
                <span>প্রশ্নসেট তৈরী হয়েছে!</span>
              </div>
              <p className="text-xs text-neutral-600">
                নিচের বাটনে ক্লিক করে ডেটাবেজ থেকে প্রশ্ন যুক্ত করুন
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <HiOutlinePlus className="h-4 w-4" />
                  প্রশ্ন যুক্ত করুন
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          SUBJECT MULTI-SELECT MODAL
         ════════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={subjectModalOpen} onClose={() => setSubjectModalOpen(false)} title="বিষয় সিলেক্ট" maxWidth="max-w-md">
        <div className="space-y-4 font-sans text-xs">
          <input
            type="text"
            value={subjectSearch}
            onChange={(e) => setSubjectSearch(e.target.value)}
            placeholder="বিষয় খুঁজুন..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none"
          />

          <label className="flex items-center gap-2 font-bold text-neutral-800 border-b pb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={content.subjects?.length > 0 && selectedSubjectIds.length === content.subjects.length}
              onChange={(e) => {
                if (e.target.checked) setSelectedSubjectIds(content.subjects.map((s) => s._id));
                else setSelectedSubjectIds([]);
              }}
              className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <span>সবগুলো সিলেক্ট করুন</span>
          </label>

          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {content.subjects
              ?.filter((s) => s.name?.toLowerCase().includes(subjectSearch.toLowerCase()))
              .map((s) => {
                const checked = selectedSubjectIds.includes(s._id);
                return (
                  <label key={s._id} className="flex items-center gap-2.5 p-2 hover:bg-neutral-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedSubjectIds((prev) =>
                          prev.includes(s._id) ? prev.filter((x) => x !== s._id) : [...prev, s._id]
                        );
                      }}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="font-semibold text-neutral-800">{s.name}</span>
                  </label>
                );
              })}
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button variant="primary" onClick={() => setSubjectModalOpen(false)}>
              বাছাই সম্পন্ন করুন ({selectedSubjectIds.length} টি)
            </Button>
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════════
          CHAPTER MULTI-SELECT MODAL (Screenshot 2)
         ════════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={chapterModalOpen} onClose={() => setChapterModalOpen(false)} title="অধ্যায় সিলেক্ট" maxWidth="max-w-md">
        <div className="space-y-4 font-sans text-xs">
          <input
            type="text"
            value={chapterSearch}
            onChange={(e) => setChapterSearch(e.target.value)}
            placeholder="অধ্যায় খুঁজুন..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none"
          />

          <label className="flex items-center gap-2 font-bold text-neutral-800 border-b pb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={content.chapters?.length > 0 && selectedChapterIds.length === content.chapters.length}
              onChange={(e) => {
                if (e.target.checked) setSelectedChapterIds(content.chapters.map((ch) => ch._id));
                else setSelectedChapterIds([]);
              }}
              className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <span>সবগুলো সিলেক্ট করুন</span>
          </label>

          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {content.chapters
              ?.filter((ch) => ch.name?.toLowerCase().includes(chapterSearch.toLowerCase()))
              .map((ch) => {
                const checked = selectedChapterIds.includes(ch._id);
                return (
                  <label key={ch._id} className="flex items-center gap-2.5 p-2 hover:bg-neutral-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedChapterIds((prev) =>
                          prev.includes(ch._id) ? prev.filter((x) => x !== ch._id) : [...prev, ch._id]
                        );
                      }}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="font-semibold text-neutral-800">{ch.name}</span>
                  </label>
                );
              })}
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button variant="primary" onClick={() => setChapterModalOpen(false)}>
              বাছাই সম্পন্ন করুন ({selectedChapterIds.length} টি)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
