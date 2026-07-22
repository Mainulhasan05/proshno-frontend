'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '@/store/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchQuestions, createQuestion, bulkImportQuestions, parseExcelQuestions, updateQuestion, toggleQuestionActive, deleteQuestion } from '@/store/slices/questionSlice';
import { fetchTree } from '@/store/slices/hierarchySlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineFilter,
  HiOutlineCheck, HiOutlineX, HiOutlineClipboardCopy,
  HiOutlineUpload, HiOutlineDownload, HiOutlineCheckCircle,
  HiOutlineExclamationCircle, HiOutlineDocumentText, HiOutlinePencilAlt
} from 'react-icons/hi';
import dynamic from 'next/dynamic';

const MathRenderer = dynamic(() => import('@/components/shared/MathRenderer'), { ssr: false });
const ImageUpload = dynamic(() => import('@/components/ui/ImageUpload'), { ssr: false });
const MathInput = dynamic(() => import('@/components/ui/MathInput'), { ssr: false });

const COGNITIVE_DOMAINS = [
  { value: 'knowledge', label: 'জ্ঞান', color: 'bg-blue-100 text-blue-700' },
  { value: 'comprehension', label: 'অনুধাবন', color: 'bg-green-100 text-green-700' },
  { value: 'application', label: 'প্রয়োগ', color: 'bg-amber-100 text-amber-700' },
  { value: 'higher_skills', label: 'উচ্চতর দক্ষতা', color: 'bg-purple-100 text-purple-700' },
  { value: 'none', label: 'প্রযোজ্য নয়', color: 'bg-neutral-100 text-neutral-600' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'সহজ', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'medium', label: 'মধ্যম', color: 'bg-amber-100 text-amber-700' },
  { value: 'hard', label: 'কঠিন', color: 'bg-red-100 text-red-700' },
];

const TYPE_LABELS = { MCQ: 'বহুনির্বাচনী', CQ: 'সৃজনশীল', SHORT: 'সংক্ষিপ্ত (Legacy)', OTHER: 'অন্যান্য' };
const TYPE_COLORS = {
  MCQ: 'bg-indigo-100 text-indigo-700',
  CQ: 'bg-rose-100 text-rose-700',
  SHORT: 'bg-teal-100 text-teal-700',
  OTHER: 'bg-amber-100 text-amber-700',
};

const FORMAT_LABELS = {
  single_correct: 'সাধারণ বহুনির্বাচনি',
  multiple_correct: 'বহুপদী সমাপ্তিসূচক',
  passage_mcq: 'অভিন্ন তথ্যভিত্তিক',
  none: 'প্রযোজ্য নয়',
  true_false: 'সত্য/মিথ্যা (True/False)',
  assertion_reason: 'দৃঢ়োক্তি-যুক্তি (Assertion-Reason)',
  creative_default: 'সৃজনশীল (CQ)',
  short_answer: 'সংক্ষিপ্ত উত্তর (Short Answer)',
  other_format: 'অন্যান্য ফরম্যাট'
};

const IMPORT_TEMPLATES = {
  mcq: [
    {
      question: "একটি সমবাহু ত্রিভুজের প্রতিটি কোণের মান কত?",
      type: "MCQ",
      format: "single_correct",
      options: [
        "৪৫ ডিগ্রি",
        "৬০ ডিগ্রি",
        "৯০ ডিগ্রি",
        "১৮০ ডিগ্রি"
      ],
      mcqAns: 1,
      cognitiveDomain: "none",
      difficulty: "easy",
      explanation: "সমবাহু ত্রিভুজের তিনটি কোণ সমান এবং সমষ্টি ১৮০ ডিগ্রি, তাই প্রতিটি কোণ ৬০ ডিগ্রি।"
    }
  ],
  cq: [
    {
      question: "উদ্দীপক: রহিম সাহেব তার জমিতে রাসায়নিক সারের পরিবর্তে জৈব সার ব্যবহার করলেন। এতে তার জমির উর্বরতা বৃদ্ধি পেল এবং পরিবেশের ক্ষতি কম হলো।",
      type: "CQ",
      format: "creative_default",
      subParts: [
        { "partLabel": "ক", "text": "জৈব সার কী?", "marks": 1 },
        { "partLabel": "খ", "text": "রাসায়নিক সারের অতিরিক্ত ব্যবহারের ক্ষতিকর দিক ব্যাখ্যা করো।", "marks": 2 },
        { "partLabel": "গ", "text": "রহিম সাহেবের জমিতে উর্বরতা বৃদ্ধির কারণ ব্যাখ্যা করো।", "marks": 3 },
        { "partLabel": "ঘ", "text": "পরিবেশ রক্ষায় রহিম সাহেবের সিদ্ধান্তের যৌক্তিকতা বিশ্লেষণ করো।", "marks": 4 }
      ],
      cognitiveDomain: "none",
      difficulty: "medium",
      explanation: "জৈব সার মাটির গঠন উন্নত করে এবং পরিবেশবান্ধব।"
    }
  ],
  short: [
    {
      question: "সালোকসংশ্লেষণ প্রক্রিয়ার মূল উপাদান কয়টি ও কী কী?",
      type: "OTHER",
      format: "short_answer",
      expectedAnswer: "মূল উপাদান ৪টি: আলোক, ক্লোরোফিল, পানি ও কার্বন ডাই অক্সাইড।",
      cognitiveDomain: "none",
      difficulty: "medium"
    }
  ]
};

export default function QuestionsPage() {
  const dispatch = useDispatch();
  const { questions = [], pagination, isLoading } = useSelector((s) => s.questions || {});
  const { tree = [] } = useSelector((s) => s.hierarchy || {});

  // Filters
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Bulk Import Modal (JSON)
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState('mcq');

  // Excel Bulk Upload State
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [excelError, setExcelError] = useState('');
  const [excelParsedResult, setExcelParsedResult] = useState(null);
  const [editingExcelIdx, setEditingExcelIdx] = useState(null);
  const [editingExcelItem, setEditingExcelItem] = useState(null);


  // Input states for sources sub-forms
  const [newBoard, setNewBoard] = useState({ shortForm: '', year: '', questionNo: '' });
  const [newAdmission, setNewAdmission] = useState({ name: '', year: '', questionNo: '' });
  const [newSchool, setNewSchool] = useState({ name: '', year: '', questionNo: '' });
  const [inlineSourceInput, setInlineSourceInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Selected hierarchy for bulk import
  const [impClass, setImpClass] = useState('');
  const [impVersion, setImpVersion] = useState('');
  const [impSubject, setImpSubject] = useState('');
  const [impChapter, setImpChapter] = useState('');
  const [impTopic, setImpTopic] = useState('');

  const impVersions = tree.find((c) => c._id === impClass)?.versions || [];
  const impSubjects = impVersions.find((v) => v._id === impVersion)?.subjects || [];
  const impChapters = impSubjects.find((s) => s._id === impSubject)?.chapters || [];
  const impTopics = impChapters.find((ch) => ch._id === impChapter)?.topics || [];

  // Form
  const [form, setForm] = useState({
    type: 'MCQ',
    format: 'single_correct',
    questionText: '',
    cognitiveDomain: 'knowledge',
    difficulty: 'medium',
    marks: 1,
    explanation: '',
    chapterId: '',
    topicId: '',
    options: [
      { text: '', isCorrect: true, order: 1 },
      { text: '', isCorrect: false, order: 2 },
      { text: '', isCorrect: false, order: 3 },
      { text: '', isCorrect: false, order: 4 },
    ],
    stimulus: '',
    stimulusImage: '',
    questionImage: '',
    expectedAnswer: '',
    bookReference: '',
    subParts: [{ partLabel: 'ক', text: '', marks: 1, sampleAnswer: '' }],
    sources: [],
    boardInfo: [],
    topSchool: [],
    university: [],
  });

  // Selected hierarchy for chapter picker (in modal)
  const [selClass, setSelClass] = useState('');
  const [selVersion, setSelVersion] = useState('');
  const [selSubject, setSelSubject] = useState('');

  // Dynamic sources state
  const [availableSources, setAvailableSources] = useState(['Admission', 'Board', 'Main Book', 'Onusiloni', 'Top School/College', 'Inspired']);

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkUpdatePayload, setBulkUpdatePayload] = useState({
    format: '',
    cognitiveDomain: '',
    difficulty: '',
    bookReference: '',
  });
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const toggleSelectAll = () => {
    if (questions.length === 0) return;
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map((q) => q._id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে সিলেক্ট করা ${selectedIds.length}টি প্রশ্ন একসাথে মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      setIsBulkProcessing(true);
      await apiClient.post('/questions/bulk-delete', { ids: selectedIds });
      toast.success(`${selectedIds.length}টি প্রশ্ন সফলভাবে মুছে ফেলা হয়েছে`);
      setSelectedIds([]);
      dispatch(fetchQuestions(filters));
    } catch (err) {
      toast.error(err?.error?.message || 'একসাথে প্রশ্ন মুছে ফেলা ব্যর্থ হয়েছে');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkToggle = async (isActive) => {
    if (selectedIds.length === 0) return;
    try {
      setIsBulkProcessing(true);
      await apiClient.post('/questions/bulk-toggle', { ids: selectedIds, isActive });
      toast.success(`${selectedIds.length}টি প্রশ্ন ${isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
      setSelectedIds([]);
      dispatch(fetchQuestions(filters));
    } catch (err) {
      toast.error(err?.error?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkUpdateSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    try {
      setIsBulkProcessing(true);
      await apiClient.post('/questions/bulk-update', {
        ids: selectedIds,
        updateData: bulkUpdatePayload,
      });
      toast.success(`${selectedIds.length}টি প্রশ্ন সফলভাবে আপডেট করা হয়েছে!`);
      setBulkEditModalOpen(false);
      setSelectedIds([]);
      dispatch(fetchQuestions(filters));
    } catch (err) {
      toast.error(err?.error?.message || 'একসাথে প্রশ্ন আপডেট ব্যর্থ হয়েছে');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  useEffect(() => {
    dispatch(fetchTree());
    dispatch(fetchQuestions(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    apiClient.get('/settings').then((res) => {
      if (res.data?.questionSources?.length) {
        setAvailableSources(res.data.questionSources);
      }
    }).catch(() => {});
  }, []);

  // Modal hierarchy options
  const versions = tree.find((c) => c._id === selClass)?.versions || [];
  const subjects = versions.find((v) => v._id === selVersion)?.subjects || [];
  const chapters = subjects.find((s) => s._id === selSubject)?.chapters || [];
  const topics = chapters.find((ch) => ch._id === form.chapterId)?.topics || [];

  // Filter bar hierarchy options (cascade)
  const filterVersions = tree.find((c) => c._id === filters.classId)?.versions || [];
  const filterSubjects = filterVersions.find((v) => v._id === filters.versionId)?.subjects || [];
  const filterChapters = filterSubjects.find((s) => s._id === filters.subjectId)?.chapters || [];
  const filterTopics = filterChapters.find((ch) => ch._id === filters.chapterId)?.topics || [];

  const resetForm = () => {
    setForm({
      type: 'MCQ',
      format: 'single_correct',
      questionText: '',
      cognitiveDomain: 'knowledge',
      difficulty: 'medium',
      marks: 1,
      negativeMarks: 0,
      explanation: '',
      chapterId: '',
      topicId: '',
      options: [
        { text: '', isCorrect: true, order: 1 },
        { text: '', isCorrect: false, order: 2 },
        { text: '', isCorrect: false, order: 3 },
        { text: '', isCorrect: false, order: 4 },
      ],
      stimulus: '',
      stimulusImage: '',
      expectedAnswer: '',
      bookReference: '',
      subParts: [{ partLabel: 'ক', text: '', marks: 1, sampleAnswer: '' }],
      sources: [],
      boardInfo: [],
      topSchool: [],
      university: [],
    });
    setSelClass(''); setSelVersion(''); setSelSubject('');
  };

  const openModal = (item = null) => {
    setShowAdvanced(false);
    apiClient.get('/settings').then((res) => {
      if (res.data?.questionSources?.length) {
        setAvailableSources((prev) => Array.from(new Set([...res.data.questionSources, ...prev])));
      }
    }).catch(() => {});

    if (item) {
      setEditItem(item);
      setForm({
        type: item.type,
        format: item.format || (item.type === 'CQ' ? 'creative_default' : item.type === 'SHORT' || item.type === 'OTHER' ? 'short_answer' : 'single_correct'),
        questionText: item.questionText,
        cognitiveDomain: item.cognitiveDomain,
        difficulty: item.difficulty,
        marks: item.marks,
        negativeMarks: item.negativeMarks || 0,
        explanation: item.explanation || '',
        chapterId: item.chapterId?._id || item.chapterId,
        topicId: item.topicId?._id || item.topicId || '',
        options: item.options?.length > 0 ? item.options : [
          { text: '', isCorrect: true, order: 1 }, { text: '', isCorrect: false, order: 2 },
          { text: '', isCorrect: false, order: 3 }, { text: '', isCorrect: false, order: 4 },
        ],
        stimulus: item.stimulus || '',
        stimulusImage: item.stimulusImage || '',
        questionImage: item.questionImage || '',
        expectedAnswer: item.expectedAnswer || '',
        bookReference: item.bookReference || '',
        subParts: item.subParts?.length > 0 ? item.subParts : [{ partLabel: 'ক', text: '', marks: 1, sampleAnswer: '' }],
        sources: item.sources || [],
        boardInfo: item.boardInfo || [],
        topSchool: item.topSchool || [],
        university: item.university || [],
      });
      // Set hierarchy selectors
      setSelClass(item.classId?._id || item.classId || '');
      setSelVersion(item.versionId?._id || item.versionId || '');
      setSelSubject(item.subjectId?._id || item.subjectId || '');
    } else {
      setEditItem(null);
      resetForm();
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  // Option helpers
  const addOption = () => {
    setForm({ ...form, options: [...form.options, { text: '', isCorrect: false, order: form.options.length + 1 }] });
  };
  const removeOption = (idx) => {
    if (form.options.length <= 2) return;
    setForm({ ...form, options: form.options.filter((_, i) => i !== idx) });
  };
  const updateOption = (idx, field, value) => {
    const opts = [...form.options];
    if (field === 'isCorrect') {
      if (form.format === 'multiple_correct') {
        opts[idx] = { ...opts[idx], isCorrect: !opts[idx].isCorrect };
      } else {
        opts.forEach((o, i) => { o.isCorrect = i === idx; });
      }
    } else {
      opts[idx] = { ...opts[idx], [field]: value };
    }
    setForm({ ...form, options: opts });
  };

  // Sub-part helpers
  const PART_LABELS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];
  const addSubPart = () => {
    const next = PART_LABELS[form.subParts.length] || `${form.subParts.length + 1}`;
    const defaultMarks = form.subParts.length === 1 ? 2 : form.subParts.length === 2 ? 3 : form.subParts.length === 3 ? 4 : 2;
    setForm({ ...form, subParts: [...form.subParts, { partLabel: next, text: '', marks: defaultMarks, sampleAnswer: '' }] });
  };
  const removeSubPart = (idx) => {
    if (form.subParts.length <= 1) return;
    setForm({ ...form, subParts: form.subParts.filter((_, i) => i !== idx) });
  };
  const updateSubPart = (idx, field, value) => {
    const parts = [...form.subParts];
    parts[idx] = { ...parts[idx], [field]: value };
    setForm({ ...form, subParts: parts });
  };

  const handleCopyTemplate = (key) => {
    const templateStr = JSON.stringify(IMPORT_TEMPLATES[key], null, 2);
    navigator.clipboard.writeText(templateStr);
    toast.success('টেমপ্লেট কপি করা হয়েছে!');
  };

  const toggleSource = (src) => {
    const next = form.sources.includes(src)
      ? form.sources.filter(s => s !== src)
      : [...form.sources, src];
    setForm({ ...form, sources: next });
  };

  const handleAddInlineSource = () => {
    const src = inlineSourceInput.trim();
    if (!src) return;
    if (!availableSources.includes(src)) {
      setAvailableSources([...availableSources, src]);
    }
    if (!form.sources.includes(src)) {
      setForm({ ...form, sources: [...form.sources, src] });
    }
    setInlineSourceInput('');
    toast.success(`"${src}" উৎস যোগ করা হয়েছে`);
  };

  const addBoardInfo = () => {
    if (!newBoard.shortForm || !newBoard.year) {
      toast.error('বোর্ডের নাম ও বছর প্রদান করুন');
      return;
    }
    const item = {
      boardId: { shortForm: newBoard.shortForm },
      year: Number(newBoard.year) || 0,
      questionNo: newBoard.questionNo || undefined,
    };
    setForm({ ...form, boardInfo: [...form.boardInfo, item] });
    setNewBoard({ shortForm: '', year: '', questionNo: '' });
  };

  const removeBoardInfo = (idx) => {
    setForm({ ...form, boardInfo: form.boardInfo.filter((_, i) => i !== idx) });
  };

  const addAdmissionInfo = () => {
    if (!newAdmission.name || !newAdmission.year) {
      toast.error('প্রতিষ্ঠানের নাম ও বছর প্রদান করুন');
      return;
    }
    const item = {
      universityId: { name: newAdmission.name },
      year: Number(newAdmission.year) || 0,
      questionNo: newAdmission.questionNo || undefined,
    };
    setForm({ ...form, university: [...form.university, item] });
    setNewAdmission({ name: '', year: '', questionNo: '' });
  };

  const removeAdmissionInfo = (idx) => {
    setForm({ ...form, university: form.university.filter((_, i) => i !== idx) });
  };

  const addSchoolInfo = () => {
    if (!newSchool.name || !newSchool.year) {
      toast.error('স্কুল/কলেজের নাম ও বছর প্রদান করুন');
      return;
    }
    const item = {
      schoolId: { name: newSchool.name },
      year: Number(newSchool.year) || 0,
      questionNo: newSchool.questionNo || undefined,
    };
    setForm({ ...form, topSchool: [...form.topSchool, item] });
    setNewSchool({ name: '', year: '', questionNo: '' });
  };

  const removeSchoolInfo = (idx) => {
    setForm({ ...form, topSchool: form.topSchool.filter((_, i) => i !== idx) });
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    setImportError('');
    setIsImporting(true);

    if (!impChapter) {
      setImportError('অনুগ্রহ করে অধ্যায় নির্বাচন করুন');
      setIsImporting(false);
      return;
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(importJson);
      if (parsedJson && parsedJson.result && Array.isArray(parsedJson.result.questions)) {
        parsedJson = parsedJson.result.questions;
      } else if (parsedJson && Array.isArray(parsedJson.questions)) {
        parsedJson = parsedJson.questions;
      }
      if (!Array.isArray(parsedJson)) {
        throw new Error('JSON format is invalid. It must be an array of questions.');
      }
    } catch (err) {
      setImportError(`JSON পার্স করতে ব্যর্থ: ${err.message}`);
      setIsImporting(false);
      return;
    }

    try {
      const formattedQuestions = parsedJson.map((q) => ({
        ...q,
        topicId: q.topicId || impTopic || undefined,
      }));
      await dispatch(bulkImportQuestions({ questions: formattedQuestions, chapterId: impChapter })).unwrap();
      toast.success(`${parsedJson.length}টি প্রশ্ন সফলভাবে ইমপোর্ট করা হয়েছে`);
      setImportModalOpen(false);
      setImportJson('');
      setImportError('');
      dispatch(fetchQuestions(filters));
    } catch (err) {
      setImportError(err || 'ইমপোর্ট করতে ব্যর্থ হয়েছে');
    } finally {
      setIsImporting(false);
    }
  };

  const handleParseExcelFile = async (fileToParse) => {
    const file = fileToParse || excelFile;
    if (!file) {
      toast.error('অনুগ্রহ করে একটি Excel ফাইল নির্বাচন করুন');
      return;
    }
    setIsParsingExcel(true);
    setExcelError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const params = {};
      if (impSubject) params.subjectId = impSubject;
      if (impChapter) params.chapterId = impChapter;
      if (impTopic) params.topicId = impTopic;

      const res = await dispatch(parseExcelQuestions({ formData, params })).unwrap();
      setExcelParsedResult(res);
      toast.success(`${res.totalParsed || 0}টি প্রশ্ন পার্স এবং বিষয়/অধ্যায় নাম রেজোলিউশন সম্পন্ন হয়েছে`);
    } catch (err) {
      setExcelError(typeof err === 'string' ? err : 'Excel ফাইল পার্স করতে ব্যর্থ হয়েছে');
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleConfirmExcelImport = async () => {
    if (!excelParsedResult || !excelParsedResult.questions || excelParsedResult.questions.length === 0) {
      toast.error('ইমপোর্ট করার জন্য কোনো প্রশ্ন নেই');
      return;
    }
    const validQuestions = excelParsedResult.questions.filter((q) => q.status !== 'invalid');
    if (validQuestions.length === 0) {
      toast.error('কোনো বৈধ (Valid) প্রশ্ন পাওয়া যায়নি');
      return;
    }
    setIsImportingExcel(true);
    setExcelError('');
    try {
      await dispatch(bulkImportQuestions({ questions: validQuestions, chapterId: impChapter || undefined })).unwrap();
      toast.success(`${validQuestions.length}টি প্রশ্ন সফলভাবে ডাটাবেজে ইমপোর্ট করা হয়েছে!`);
      setExcelModalOpen(false);
      setExcelFile(null);
      setExcelParsedResult(null);
      dispatch(fetchQuestions(filters));
    } catch (err) {
      setExcelError(err || 'ইমপোর্ট করতে ব্যর্থ হয়েছে');
    } finally {
      setIsImportingExcel(false);
    }
  };

  const handleDeleteParsedItem = (idx) => {
    if (!excelParsedResult) return;
    const updated = [...excelParsedResult.questions];
    updated.splice(idx, 1);
    const validCount = updated.filter((q) => q.status === 'valid').length;
    const warningCount = updated.filter((q) => q.status === 'warning').length;
    const invalidCount = updated.filter((q) => q.status === 'invalid').length;
    setExcelParsedResult({
      ...excelParsedResult,
      totalParsed: updated.length,
      validCount,
      warningCount,
      invalidCount,
      questions: updated,
    });
  };

  const handleOpenEditParsedItem = (idx) => {
    setEditingExcelIdx(idx);
    setEditingExcelItem(JSON.parse(JSON.stringify(excelParsedResult.questions[idx])));
  };

  const handleSaveEditedParsedItem = () => {
    if (editingExcelIdx === null || !editingExcelItem) return;
    const updated = [...excelParsedResult.questions];
    const errors = [];
    const warnings = [];

    if (!editingExcelItem.questionText) errors.push('প্রশ্ন আবশ্যক');
    if (!editingExcelItem.chapterId) errors.push('অধ্যায় আবশ্যক');

    let status = 'valid';
    if (errors.length > 0) {
      status = 'invalid';
    } else if (warnings.length > 0) {
      status = 'warning';
    }

    const newItem = {
      ...editingExcelItem,
      status,
      errors,
      warnings,
    };

    updated[editingExcelIdx] = newItem;
    const validCount = updated.filter((q) => q.status === 'valid').length;
    const warningCount = updated.filter((q) => q.status === 'warning').length;
    const invalidCount = updated.filter((q) => q.status === 'invalid').length;

    setExcelParsedResult({
      ...excelParsedResult,
      totalParsed: updated.length,
      validCount,
      warningCount,
      invalidCount,
      questions: updated,
    });
    setEditingExcelIdx(null);
    setEditingExcelItem(null);
    toast.success('প্রশ্ন আপডেট করা হয়েছে');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        type: form.type,
        format: form.format,
        questionText: form.questionText,
        questionImage: form.questionImage || undefined,
        cognitiveDomain: form.cognitiveDomain,
        difficulty: form.difficulty,
        marks: Number(form.marks),
        explanation: form.explanation || undefined,
        chapterId: form.chapterId,
        topicId: form.topicId || undefined,
      };

      if (form.type === 'MCQ') {
        body.options = form.options.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, image: o.image || undefined, order: i + 1 }));
        body.negativeMarks = Number(form.negativeMarks) || 0;
        if (form.format === 'passage_mcq') {
          body.stimulus = form.stimulus || undefined;
          body.stimulusImage = form.stimulusImage || undefined;
        }
      }
      if (form.type === 'CQ') {
        body.stimulus = form.stimulus;
        body.stimulusImage = form.stimulusImage || undefined;
        body.subParts = form.subParts.map((p) => ({
          partLabel: p.partLabel,
          text: p.text,
          marks: Number(p.marks),
          sampleAnswer: p.sampleAnswer || undefined,
        }));
        // Auto-calculate marks as the sum of subparts
        body.marks = body.subParts.reduce((acc, sp) => acc + sp.marks, 0);
      }
      if (form.type === 'OTHER' || form.type === 'SHORT') {
        body.expectedAnswer = form.expectedAnswer || undefined;
      }

      body.bookReference = form.bookReference || undefined;
      body.sources = form.sources || [];
      body.boardInfo = form.sources.includes('Board') ? form.boardInfo : [];
      body.university = form.sources.includes('Admission') ? form.university : [];
      body.topSchool = form.sources.includes('Top School/College') ? form.topSchool : [];

      if (editItem) {
        await dispatch(updateQuestion({ id: editItem._id, body })).unwrap();
        toast.success('প্রশ্ন আপডেট হয়েছে');
      } else {
        await dispatch(createQuestion(body)).unwrap();
        toast.success('প্রশ্ন তৈরি হয়েছে');
      }
      dispatch(fetchQuestions(filters));
      closeModal();
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleQuestionActive(id)).unwrap();
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('এই প্রশ্নটি মুছে ফেলতে চান?')) return;
    try {
      await dispatch(deleteQuestion(id)).unwrap();
      toast.success('প্রশ্ন মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err || 'মুছে ফেলা যায়নি');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">প্রশ্ন ব্যাংক</h1>
          <p className="text-sm text-neutral-500 mt-1">
            মোট {pagination?.total || questions.length}টি প্রশ্ন
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <HiOutlineFilter className="h-4 w-4" />
            ফিল্টার
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            JSON ইমপোর্ট
          </Button>
          <Button
            size="sm"
            onClick={() => setExcelModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all"
          >
            <HiOutlineUpload className="h-4 w-4" />
            Excel থেকে আপলোড
          </Button>
          <Button size="sm" onClick={() => openModal()}>
            <HiOutlinePlus className="h-4 w-4" />
            নতুন প্রশ্ন
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white rounded-xl border border-neutral-200 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, page: 1, search: e.target.value || undefined })}
                placeholder="প্রশ্ন খুঁজুন..."
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none w-full col-span-2 sm:col-span-1"
              />
              <select value={filters.type || ''} onChange={(e) => setFilters({ ...filters, page: 1, type: e.target.value || undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-full">
                <option value="">সব ধরন</option>
                <option value="MCQ">বহুনির্বাচনী (MCQ)</option>
                <option value="CQ">সৃজনশীল (CQ)</option>
                <option value="OTHER">অন্যান্য (Other)</option>
                <option value="SHORT">সংক্ষিপ্ত (Legacy)</option>
              </select>
              <select value={filters.cognitiveDomain || ''} onChange={(e) => setFilters({ ...filters, page: 1, cognitiveDomain: e.target.value || undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-full">
                <option value="">সব ডোমেইন</option>
                {COGNITIVE_DOMAINS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <select value={filters.difficulty || ''} onChange={(e) => setFilters({ ...filters, page: 1, difficulty: e.target.value || undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-full">
                <option value="">সব মাত্রা</option>
                {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <select value={filters.source || ''} onChange={(e) => setFilters({ ...filters, page: 1, source: e.target.value || undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-full">
                <option value="">সব উৎস (All Sources)</option>
                {availableSources.map((s) => (
                  <option key={s} value={s}>{s === 'Inspired' ? '💡 Inspired (যাচাইযোগ্য)' : s}</option>
                ))}
              </select>

              {/* Class Filter */}
              <select value={filters.classId || ''} onChange={(e) => setFilters({ ...filters, page: 1, classId: e.target.value || undefined, versionId: undefined, subjectId: undefined, chapterId: undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-full">
                <option value="">সব ক্লাস</option>
                {tree.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>

              {/* Version Filter */}
              <select value={filters.versionId || ''} onChange={(e) => setFilters({ ...filters, page: 1, versionId: e.target.value || undefined, subjectId: undefined, chapterId: undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-full" disabled={!filters.classId}>
                <option value="">সব ভার্সন</option>
                {filterVersions.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>

              {/* Subject Filter */}
              <select value={filters.subjectId || ''} onChange={(e) => setFilters({ ...filters, page: 1, subjectId: e.target.value || undefined, chapterId: undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-full" disabled={!filters.versionId}>
                <option value="">সব বিষয়</option>
                {filterSubjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>

              {/* Chapter Filter */}
              <select value={filters.chapterId || ''} onChange={(e) => setFilters({ ...filters, page: 1, chapterId: e.target.value || undefined, topicId: undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-full" disabled={!filters.subjectId}>
                <option value="">সব অধ্যায়</option>
                {filterChapters.map((ch) => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
              </select>

              {/* Topic Filter */}
              <select value={filters.topicId || ''} onChange={(e) => setFilters({ ...filters, page: 1, topicId: e.target.value || undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-full" disabled={!filters.chapterId}>
                <option value="">সব টপিক/পাঠ</option>
                {filterTopics.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>

              <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="w-full">রিসেট</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Select All Bar */}
      {questions.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-neutral-200 mb-4 shadow-xs">
          <label className="flex items-center gap-2.5 cursor-pointer select-none font-medium text-xs text-neutral-700">
            <input
              type="checkbox"
              checked={questions.length > 0 && selectedIds.length === questions.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <span>পেজের সব প্রশ্ন সিলেক্ট করুন ({questions.length} টি)</span>
          </label>
          {selectedIds.length > 0 && (
            <span className="text-primary-700 font-bold bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200 text-xs">
              {selectedIds.length} টি প্রশ্ন সিলেক্ট করা হয়েছে
            </span>
          )}
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          কোনো প্রশ্ন নেই। &quot;নতুন প্রশ্ন&quot; বাটনে ক্লিক করুন।
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, i) => (
          <motion.div
            key={q._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all ${
              selectedIds.includes(q._id) ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/10' : 'border-neutral-200'
            } ${!q.isActive ? 'opacity-65' : ''}`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedIds.includes(q._id)}
                onChange={() => toggleSelectOne(q._id)}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer mt-1 shrink-0"
              />
              <div className="flex-1 min-w-0">
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${TYPE_COLORS[q.type] || 'bg-neutral-100 text-neutral-700'}`}>
                    {TYPE_LABELS[q.type]}
                  </span>
                  {q.format && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium border border-neutral-200">
                      {FORMAT_LABELS[q.format] || q.format}
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${COGNITIVE_DOMAINS.find((d) => d.value === q.cognitiveDomain)?.color || 'bg-blue-50 text-blue-600'}`}>
                    {COGNITIVE_DOMAINS.find((d) => d.value === q.cognitiveDomain)?.label}
                  </span>
                  {q.topicId && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium border border-purple-200">
                      📌 {typeof q.topicId === 'object' ? q.topicId.name : 'টপিক'}
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${DIFFICULTIES.find((d) => d.value === q.difficulty)?.color || 'bg-amber-50 text-amber-600'}`}>
                    {DIFFICULTIES.find((d) => d.value === q.difficulty)?.label}
                  </span>
                  <span className="text-xs text-neutral-500 font-semibold bg-neutral-100 px-2 py-0.5 rounded">{q.marks} নম্বর</span>
                  {q.type === 'MCQ' && q.negativeMarks > 0 && (
                    <span className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 px-2 py-0.5 rounded ml-1.5">নেগেটিভ মার্ক: -{q.negativeMarks}</span>
                  )}
                </div>

                {/* Stimulus Section if present */}
                {q.stimulus && (
                  <div className="mb-3 bg-[#F9FAF9] border-l-4 border-primary-500 p-3 rounded-lg text-sm text-neutral-700 leading-relaxed font-serif">
                    <span className="font-bold block text-neutral-800 mb-1">উদ্দীপক:</span>
                    <MathRenderer text={q.stimulus} />
                    {q.stimulusImage && (
                      <div className="mt-2">
                        <img src={q.stimulusImage} alt="উদ্দীপক চিত্র" className="max-h-48 object-contain rounded border border-neutral-200 bg-white" />
                      </div>
                    )}
                  </div>
                )}

                {/* Question text */}
                <div className="text-sm sm:text-base text-neutral-800 font-medium leading-relaxed">
                  <MathRenderer text={q.questionText} />
                </div>

                {/* Question Image (Not stimulus image) */}
                {q.questionImage && (
                  <div className="mt-2">
                    <img src={q.questionImage} alt="প্রশ্ন চিত্র" className="max-h-32 object-contain rounded border border-neutral-200 bg-white" />
                  </div>
                )}

                {/* MCQ options preview */}
                {q.type === 'MCQ' && q.options?.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`text-sm px-3 py-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          opt.isCorrect
                            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800 font-medium shadow-sm'
                            : 'bg-neutral-50/50 border-neutral-200 text-neutral-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-neutral-400">{String.fromCharCode(2453 + oi)})</span>
                          <MathRenderer text={opt.text} />
                        </div>
                        {opt.isCorrect && <HiOutlineCheck className="h-4 w-4 text-emerald-600 shrink-0" />}
                      </div>
                    ))}
                  </div>
                )}

                {/* CQ sub-parts preview */}
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

                {/* Short Answer expectedAnswer preview */}
                {(q.type === 'OTHER' || q.type === 'SHORT') && q.expectedAnswer && (
                  <div className="mt-3 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-150">
                    <span className="font-semibold text-neutral-700 block mb-1">নমুনা উত্তর / মূল্যায়ন নির্দেশিকা:</span>
                    <MathRenderer text={q.expectedAnswer} />
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-3 text-xs text-neutral-500 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <span className="font-medium text-neutral-600">ব্যাখ্যা:</span> <MathRenderer text={q.explanation} />
                  </div>
                )}

                {/* Hierarchy breadcrumb */}
                <p className="text-xs text-neutral-400 mt-3 flex items-center gap-1.5">
                  <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] font-semibold text-neutral-500">
                    {q.classId?.name || 'Unknown Class'} ({q.versionId?.name || 'Unknown Version'})
                  </span>
                  <span>→</span>
                  <span className="font-medium text-neutral-500">{q.subjectId?.name || 'Unknown Subject'}</span>
                  <span>→</span>
                  <span className="text-neutral-400">{q.chapterId?.name || 'Unknown Chapter'}</span>
                </p>

                {/* Source Badges */}
                {((q.sources && q.sources.length > 0) || q.bookReference) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {q.bookReference && (
                      <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        📖 বই: {q.bookReference}
                      </span>
                    )}
                    {q.sources?.map((src, idx) => (
                      <span
                        key={`src-${idx}`}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          src === 'Inspired'
                            ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-xs'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {src === 'Inspired' ? '💡 Inspired (যাচাইযোগ্য)' : `🏷️ ${src}`}
                      </span>
                    ))}
                  </div>
                )}

                {/* Board / School / University Info Badges */}
                {((q.boardInfo && q.boardInfo.length > 0) || (q.topSchool && q.topSchool.length > 0) || (q.university && q.university.length > 0)) && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {q.boardInfo?.map((bi, idx) => (
                      <span key={`board-${idx}`} className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {bi.boardId?.shortForm || 'বোর্ড'} ({bi.year}) {bi.questionNo ? `[প্রশ্ন: ${bi.questionNo}]` : ''}
                      </span>
                    ))}
                    {q.topSchool?.map((ts, idx) => (
                      <span key={`school-${idx}`} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {ts.schoolId?.name || 'স্কুল'} ({ts.year}) {ts.questionNo ? `[প্রশ্ন: ${ts.questionNo}]` : ''}
                      </span>
                    ))}
                    {q.university?.map((uni, idx) => (
                      <span key={`uni-${idx}`} className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {uni.universityId?.name || 'বিশ্ববিদ্যালয়'} ({uni.year}) {uni.questionNo ? `[প্রশ্ন: ${uni.questionNo}]` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openModal(q)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600" title="সম্পাদনা">
                  <HiOutlinePencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleToggle(q._id)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600" title={q.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}>
                  {q.isActive ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                </button>
                <button onClick={() => handleDelete(q._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500" title="মুছুন">
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Pagination
        meta={pagination}
        disabled={isLoading}
        onPageChange={(page) => {
          setFilters((current) => ({ ...current, page }));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white rounded-2xl shadow-2xl px-6 py-3.5 border border-neutral-800 flex flex-wrap items-center gap-3 font-sans text-xs"
          >
            <div className="flex items-center gap-2 font-bold border-r border-neutral-700 pr-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{selectedIds.length} টি সিলেক্ট করা হয়েছে</span>
            </div>

            <button
              onClick={() => {
                setBulkUpdatePayload({ format: '', cognitiveDomain: '', difficulty: '', bookReference: '' });
                setBulkEditModalOpen(true);
              }}
              className="bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold px-3 py-1.5 rounded-lg border border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HiOutlinePencil className="h-4 w-4" />
              একসাথে আপডেট (Bulk Edit)
            </button>

            <button
              onClick={() => handleBulkToggle(true)}
              disabled={isBulkProcessing}
              className="bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-semibold px-3 py-1.5 rounded-lg border border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HiOutlineEye className="h-4 w-4" />
              সক্রিয় করুন
            </button>

            <button
              onClick={() => handleBulkToggle(false)}
              disabled={isBulkProcessing}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-semibold px-3 py-1.5 rounded-lg border border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HiOutlineEyeOff className="h-4 w-4" />
              নিষ্ক্রিয় করুন
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={isBulkProcessing}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <HiOutlineTrash className="h-4 w-4" />
              একসাথে মুছুন (Delete)
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="text-neutral-400 hover:text-white px-2 py-1 transition-all cursor-pointer ml-1"
              title="সিলেকশন বাতিল"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Edit Attributes Modal */}
      <Modal
        isOpen={bulkEditModalOpen}
        onClose={() => setBulkEditModalOpen(false)}
        title={`একসাথে ${selectedIds.length} টি প্রশ্ন আপডেট করুন`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleBulkUpdateSubmit} className="space-y-4 font-sans text-xs">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 font-medium leading-relaxed">
            💡 আপনি যে ফিল্ডগুলো পরিবর্তন করতে চান কেবল সেগুলো নির্বাচন বা পরিবর্তন করুন। খালি রাখা ফিল্ডগুলো পূর্বের মতোই অপরিবর্তিত থাকবে।
          </div>

          {/* Format / Structural Level */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Structural Level / কাঠামোগত স্তর</label>
            <select
              value={bulkUpdatePayload.format || ''}
              onChange={(e) => setBulkUpdatePayload({ ...bulkUpdatePayload, format: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium bg-white outline-none"
            >
              <option value="">(অপরিবর্তিত রাখুন)</option>
              <option value="single_correct">সাধারণ বহুনির্বাচনি</option>
              <option value="multiple_correct">বহুপদী সমাপ্তিসূচক</option>
              <option value="passage_mcq">অভিন্ন তথ্যভিত্তিক</option>
              <option value="none">প্রযোজ্য নয়</option>
            </select>
          </div>

          {/* Cognitive Level */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Cognitive Level / জ্ঞানীয় স্তর</label>
            <select
              value={bulkUpdatePayload.cognitiveDomain || ''}
              onChange={(e) => setBulkUpdatePayload({ ...bulkUpdatePayload, cognitiveDomain: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium bg-white outline-none"
            >
              <option value="">(অপরিবর্তিত রাখুন)</option>
              <option value="knowledge">জ্ঞান</option>
              <option value="comprehension">অনুধাবন</option>
              <option value="application">প্রয়োগ</option>
              <option value="higher_skills">উচ্চতর দক্ষতা</option>
            </select>
          </div>

          {/* Book Reference */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Book Reference / বই</label>
            <input
              type="text"
              value={bulkUpdatePayload.bookReference || ''}
              onChange={(e) => setBulkUpdatePayload({ ...bulkUpdatePayload, bookReference: e.target.value })}
              placeholder="যেমন: আবুল হাসান, আজমল"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">ডিফিকাল্টি</label>
            <select
              value={bulkUpdatePayload.difficulty || ''}
              onChange={(e) => setBulkUpdatePayload({ ...bulkUpdatePayload, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium bg-white outline-none"
            >
              <option value="">(অপরিবর্তিত রাখুন)</option>
              <option value="easy">সহজ</option>
              <option value="medium">মাঝারি</option>
              <option value="hard">কঠিন</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-3 border-t border-neutral-200">
            <Button type="button" variant="ghost" onClick={() => setBulkEditModalOpen(false)} disabled={isBulkProcessing} className="flex-1">
              বাতিল
            </Button>
            <Button type="submit" disabled={isBulkProcessing} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold">
              {isBulkProcessing ? 'আপডেট করা হচ্ছে...' : 'আপডেট প্রয়োগ করুন'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'প্রশ্ন সম্পাদনা' : 'নতুন প্রশ্ন'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">প্রশ্নের ধরন *</label>
            <div className="flex gap-2">
              {['MCQ', 'CQ', 'OTHER'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const defaultFormat = t === 'MCQ' ? 'single_correct' : t === 'CQ' ? 'creative_default' : 'short_answer';
                    let extra = {};
                    if (t === 'CQ') {
                      extra = {
                        subParts: [
                          { partLabel: 'ক', text: '', marks: 1, sampleAnswer: '' },
                          { partLabel: 'খ', text: '', marks: 2, sampleAnswer: '' },
                          { partLabel: 'গ', text: '', marks: 3, sampleAnswer: '' },
                          { partLabel: 'ঘ', text: '', marks: 4, sampleAnswer: '' },
                        ]
                      };
                    }
                    setForm({ ...form, type: t, format: defaultFormat, ...extra });
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.type === t || (t === 'OTHER' && form.type === 'SHORT')
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Format selector */}
          {/* Format selector */}
          {(form.type === 'MCQ' || form.type === 'OTHER' || form.type === 'SHORT') && (
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Structural Level / কাঠামোগত স্তর *</label>
              <select
                value={form.format}
                onChange={(e) => {
                  const fmt = e.target.value;
                  let updatedOpts = [...form.options];
                  if (fmt === 'true_false') {
                    updatedOpts = [
                      { text: 'সত্য', isCorrect: true, order: 1 },
                      { text: 'মিথ্যা', isCorrect: false, order: 2 }
                    ];
                  } else if (fmt === 'assertion_reason') {
                    updatedOpts = [
                      { text: 'দৃঢ়োক্তি ও যুক্তি উভয়ই সঠিক এবং যুক্তিটি দৃঢ়োক্তির সঠিক ব্যাখ্যা', isCorrect: true, order: 1 },
                      { text: 'দৃঢ়োক্তি ও যুক্তি উভয়ই সঠিক কিন্তু যুক্তিটি দৃঢ়োক্তির সঠিক ব্যাখ্যা নয়', isCorrect: false, order: 2 },
                      { text: 'দৃঢ়োক্তি সঠিক কিন্তু যুক্তিটি ভুল', isCorrect: false, order: 3 },
                      { text: 'দৃঢ়োক্তি ভুল কিন্তু যুক্তিটি সঠিক', isCorrect: false, order: 4 }
                    ];
                  }
                  setForm({ ...form, format: fmt, options: updatedOpts });
                }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                required
              >
                {form.type === 'MCQ' ? (
                  <>
                    <option value="single_correct">সাধারণ বহুনির্বাচনি</option>
                    <option value="multiple_correct">বহুপদী সমাপ্তিসূচক</option>
                    <option value="passage_mcq">অভিন্ন তথ্যভিত্তিক</option>
                    <option value="none">প্রযোজ্য নয়</option>
                  </>
                ) : (
                  <>
                    <option value="short_answer">সংক্ষিপ্ত উত্তর (Short Answer)</option>
                    <option value="other_format">অন্যান্য ফরম্যাট</option>
                    <option value="none">প্রযোজ্য নয়</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Hierarchy cascade selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">ক্লাস *</label>
              <select value={selClass} onChange={(e) => { setSelClass(e.target.value); setSelVersion(''); setSelSubject(''); setForm({ ...form, chapterId: '', topicId: '' }); }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">বাছুন</option>
                {tree.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">ভার্সন *</label>
              <select value={selVersion} onChange={(e) => { setSelVersion(e.target.value); setSelSubject(''); setForm({ ...form, chapterId: '', topicId: '' }); }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">বাছুন</option>
                {versions.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">বিষয় *</label>
              <select value={selSubject} onChange={(e) => { setSelSubject(e.target.value); setForm({ ...form, chapterId: '', topicId: '' }); }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">বাছুন</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">অধ্যায় *</label>
              <select value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value, topicId: '' })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">বাছুন</option>
                {chapters.map((ch) => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">টপিক / পাঠ (ঐচ্ছিক)</label>
              <select value={form.topicId || ''} onChange={(e) => setForm({ ...form, topicId: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-neutral-100 disabled:opacity-60" disabled={!form.chapterId}>
                <option value="">সব টপিক / বাছুন</option>
                {topics.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* Stimulus + Stimulus Image (for CQ and passage_mcq) */}
          {(form.type === 'CQ' || form.format === 'passage_mcq') && (
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700">উদ্দীপক / অনুচ্ছেদ (Stimulus)</h3>
              <MathInput
                label="উদ্দীপক টেক্সট"
                value={form.stimulus}
                onChange={(val) => setForm({ ...form, stimulus: val })}
                rows={3}
                placeholder="উদ্দীপক বা অনুচ্ছেদটি লিখুন..."
              />
              <ImageUpload
                value={form.stimulusImage}
                onChange={(url) => setForm({ ...form, stimulusImage: url })}
                sourceType="question"
                sourceField="stimulusImage"
              />
            </div>
          )}

          {/* Question text */}
          <MathInput
            label="প্রশ্ন টেক্সট"
            value={form.questionText}
            onChange={(val) => setForm({ ...form, questionText: val })}
            rows={3}
            placeholder="প্রশ্ন লিখুন..."
            required
          />

          {/* Question image upload */}
          <ImageUpload
            value={form.questionImage || ''}
            onChange={(url) => setForm({ ...form, questionImage: url })}
            sourceType="question"
            sourceField="questionImage"
            label="প্রশ্নের ছবি/চিত্র (ঐচ্ছিক)"
          />

          {/* Cognitive Level & Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Cognitive Level / জ্ঞানীয় স্তর *</label>
              <select value={form.cognitiveDomain} onChange={(e) => setForm({ ...form, cognitiveDomain: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                {COGNITIVE_DOMAINS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">নম্বর (Marks)</label>
              <input type="number" value={form.type === 'CQ' ? form.subParts.reduce((acc, p) => acc + (Number(p.marks) || 0), 0) : form.marks}
                onChange={(e) => setForm({ ...form, marks: e.target.value })}
                disabled={form.type === 'CQ'}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-neutral-50 disabled:opacity-85" min="0" step="any" />
            </div>
          </div>

          {/* Advanced Details Toggle Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl text-xs transition-all border border-neutral-300 shadow-xs"
            >
              <span>{showAdvanced ? '⚙️ বিস্তারিত/অ্যাডভান্সড অপশনসমূহ লুকান' : '⚙️ বিস্তারিত/অ্যাডভান্সড অপশনসমূহ (বই রেফারেন্স, উৎস, বোর্ড, নেগেটিভ মার্কস, ব্যাখ্যা...)'}</span>
              <span className="text-sm font-bold">{showAdvanced ? '▲' : '▼'}</span>
            </button>
          </div>

          {/* Collapsible Advanced Options Section */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-dashed border-neutral-300 animate-fadeIn">
              {/* Secondary Details: Book Reference, Difficulty, Negative Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Book Reference / বই</label>
                  <input
                    type="text"
                    value={form.bookReference || ''}
                    onChange={(e) => setForm({ ...form, bookReference: e.target.value })}
                    placeholder="যেমন: আবুল হাসান, আজমল"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">ডিফিকাল্টি (Difficulty)</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500">
                    {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                {form.type === 'MCQ' && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">নেগেটিভ মার্কস</label>
                    <input type="number" value={form.negativeMarks ?? 0}
                      onChange={(e) => setForm({ ...form, negativeMarks: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500" min="0" step="any" />
                  </div>
                )}
              </div>

          {/* MCQ Options */}
          {form.type === 'MCQ' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">বিকল্প সমূহ *</label>
              <div className="space-y-2">
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button type="button" onClick={() => updateOption(idx, 'isCorrect')}
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        opt.isCorrect ? 'bg-emerald-500 text-white ring-2 ring-emerald-200' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                      }`}
                      disabled={form.format === 'true_false'}
                    >
                      {opt.isCorrect ? <HiOutlineCheck className="h-4 w-4" /> : String.fromCharCode(2453 + idx)}
                    </button>
                    <MathInput
                      value={opt.text}
                      onChange={(val) => updateOption(idx, 'text', val)}
                      rows={1}
                      placeholder={`বিকল্প ${String.fromCharCode(2453 + idx)}`}
                      required
                      disabled={form.format === 'true_false'}
                      className="flex-1"
                    />
                    <ImageUpload
                      value={opt.image || ''}
                      onChange={(url) => updateOption(idx, 'image', url)}
                      sourceType="question"
                      sourceField={`options.${idx}.image`}
                      compact
                    />
                    {form.options.length > 2 && form.format !== 'true_false' && (
                      <button type="button" onClick={() => removeOption(idx)} className="p-1.5 text-neutral-400 hover:text-red-500">
                        <HiOutlineX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {form.format !== 'true_false' && (
                  <button type="button" onClick={addOption} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    + আরো বিকল্প যোগ করুন
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CQ Stimulus + Sub-parts */}
          {form.type === 'CQ' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700">উপ-প্রশ্ন সমূহ *</label>
                <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-1 rounded-full">
                  মোট নম্বর: {form.subParts.reduce((acc, p) => acc + (Number(p.marks) || 0), 0)} (স্বয়ংক্রিয়)
                </span>
              </div>
              <div className="space-y-3">
                {form.subParts.map((sp, idx) => (
                  <div key={idx} className="bg-neutral-50 rounded-lg p-3 space-y-2 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-600">{sp.partLabel})</span>
                      {form.subParts.length > 1 && (
                        <button type="button" onClick={() => removeSubPart(idx)} className="text-xs text-red-400 hover:text-red-600">মুছুন</button>
                      )}
                    </div>
                    <MathInput
                      value={sp.text}
                      onChange={(val) => updateSubPart(idx, 'text', val)}
                      rows={1}
                      placeholder={`উপ-প্রশ্ন লিখুন... (যেমন: ${sp.partLabel === 'ক' ? 'জ্ঞানমূলক' : sp.partLabel === 'খ' ? 'অনুধাবনমূলক' : sp.partLabel === 'গ' ? 'প্রয়োগমূলক' : 'উচ্চতর দক্ষতা'})`}
                      required
                    />
                    <div className="flex gap-2">
                      <input type="number" value={sp.marks} onChange={(e) => updateSubPart(idx, 'marks', e.target.value)}
                        className="w-20 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="নম্বর" min="0" required />
                      <MathInput
                        value={sp.sampleAnswer || ''}
                        onChange={(val) => updateSubPart(idx, 'sampleAnswer', val)}
                        rows={1}
                        placeholder="নমুনা উত্তর / মূল্যায়ন নির্দেশিকা (ঐচ্ছিক)"
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addSubPart} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  + আরো উপ-প্রশ্ন
                </button>
              </div>
            </div>
          )}

          {/* Other/Short Question expectedAnswer fields */}
          {(form.type === 'OTHER' || form.type === 'SHORT') && (
            <div className="space-y-4">
              <MathInput
                label="নমুনা উত্তর / মূল্যায়ন নির্দেশিকা (ঐচ্ছিক)"
                value={form.expectedAnswer || ''}
                onChange={(val) => setForm({ ...form, expectedAnswer: val })}
                rows={2}
                placeholder="সঠিক উত্তর বা মূল্যায়ন নির্দেশিকা লিখুন..."
              />
            </div>
          )}

          {/* Sources Section */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">উৎস (Source)</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {Array.from(new Set([...availableSources, ...(form.sources || [])])).map((srcVal) => (
                  <label key={srcVal} className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.sources?.includes(srcVal)}
                      onChange={() => toggleSource(srcVal)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    {srcVal === 'Inspired' ? (
                      <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs">
                        💡 Inspired (অনুপ্রেরণা/যাচাইযোগ্য)
                      </span>
                    ) : (
                      srcVal === 'Board' ? 'বোর্ড (Board)' :
                      srcVal === 'Admission' ? 'ভর্তি পরীক্ষা (Admission)' :
                      srcVal === 'Top School/College' ? 'শীর্ষ স্কুল/কলেজ (Top School/College)' :
                      srcVal === 'Main Book' ? 'মূল বই (Main Book)' :
                      srcVal === 'Onusiloni' ? 'অনুশীলনী (Onusiloni)' : srcVal
                    )}
                  </label>
                ))}
              </div>

              {/* Inline Add Custom Source Tag */}
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-neutral-200">
                <input
                  type="text"
                  placeholder="নতুন উৎস যোগ করুন (যেমন: CU A-Unit, Model Test)..."
                  value={inlineSourceInput}
                  onChange={(e) => setInlineSourceInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInlineSource(); } }}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500 flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddInlineSource}
                  className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                >
                  + যোগ করুন
                </button>
              </div>
            </div>

            {/* Board Sub-form */}
            {form.sources?.includes('Board') && (
              <div className="border-t border-neutral-200 pt-3 space-y-2">
                <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">বোর্ড তথ্য (Board Info)</span>
                
                {form.boardInfo?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.boardInfo.map((bi, idx) => (
                      <span key={idx} className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded text-xs flex items-center gap-1.5 font-medium">
                        {bi.boardId?.shortForm} ({bi.year}) {bi.questionNo ? `[প্রশ্ন: ${bi.questionNo}]` : ''}
                        <button type="button" onClick={() => removeBoardInfo(idx)} className="text-sky-400 hover:text-sky-600 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="বোর্ড (যেমন: ঢা.বোঃ)"
                    value={newBoard.shortForm}
                    onChange={(e) => setNewBoard({ ...newBoard, shortForm: e.target.value })}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="বছর (যেমন: ১৬)"
                    value={newBoard.year}
                    onChange={(e) => setNewBoard({ ...newBoard, year: e.target.value })}
                    className="w-20 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="প্রশ্ন নং (ঐচ্ছিক)"
                    value={newBoard.questionNo}
                    onChange={(e) => setNewBoard({ ...newBoard, questionNo: e.target.value })}
                    className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addBoardInfo}
                    className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
                  >
                    যোগ করুন
                  </button>
                </div>
              </div>
            )}

            {/* Admission Sub-form */}
            {form.sources?.includes('Admission') && (
              <div className="border-t border-neutral-200 pt-3 space-y-2">
                <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">ভর্তি পরীক্ষা তথ্য (Admission Info)</span>
                
                {form.university?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.university.map((uni, idx) => (
                      <span key={idx} className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-xs flex items-center gap-1.5 font-medium">
                        {uni.universityId?.name} ({uni.year}) {uni.questionNo ? `[ইউনিট/প্রশ্ন: ${uni.questionNo}]` : ''}
                        <button type="button" onClick={() => removeAdmissionInfo(idx)} className="text-purple-400 hover:text-purple-600 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="প্রতিষ্ঠান (যেমন: DU)"
                    value={newAdmission.name}
                    onChange={(e) => setNewAdmission({ ...newAdmission, name: e.target.value })}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="বছর (যেমন: ১২)"
                    value={newAdmission.year}
                    onChange={(e) => setNewAdmission({ ...newAdmission, year: e.target.value })}
                    className="w-20 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="ইউনিট/প্রশ্ন নং (ঐচ্ছিক)"
                    value={newAdmission.questionNo}
                    onChange={(e) => setNewAdmission({ ...newAdmission, questionNo: e.target.value })}
                    className="w-32 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addAdmissionInfo}
                    className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
                  >
                    যোগ করুন
                  </button>
                </div>
              </div>
            )}

            {/* Top School/College Sub-form */}
            {form.sources?.includes('Top School/College') && (
              <div className="border-t border-neutral-200 pt-3 space-y-2">
                <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">শীর্ষ স্কুল/কলেজ তথ্য (School/College Info)</span>
                
                {form.topSchool?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.topSchool.map((ts, idx) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs flex items-center gap-1.5 font-medium">
                        {ts.schoolId?.name} ({ts.year}) {ts.questionNo ? `[প্রশ্ন: ${ts.questionNo}]` : ''}
                        <button type="button" onClick={() => removeSchoolInfo(idx)} className="text-emerald-400 hover:text-emerald-600 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="স্কুল/কলেজ নাম (যেমন: রাজউক)"
                    value={newSchool.name}
                    onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="বছর (যেমন: ২৩)"
                    value={newSchool.year}
                    onChange={(e) => setNewSchool({ ...newSchool, year: e.target.value })}
                    className="w-20 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="প্রশ্ন নং (ঐচ্ছিক)"
                    value={newSchool.questionNo}
                    onChange={(e) => setNewSchool({ ...newSchool, questionNo: e.target.value })}
                    className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addSchoolInfo}
                    className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
                  >
                    যোগ করুন
                  </button>
                </div>
              </div>
            )}
          </div>

              {/* Explanation */}
              <MathInput
                label="ব্যাখ্যা (ঐচ্ছিক)"
                value={form.explanation}
                onChange={(val) => setForm({ ...form, explanation: val })}
                rows={2}
                placeholder="সঠিক উত্তরের ব্যাখ্যা..."
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">বাতিল</Button>
            <Button type="submit" className="flex-1">{editItem ? 'আপডেট করুন' : 'তৈরি করুন'}</Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal isOpen={importModalOpen} onClose={() => { setImportModalOpen(false); setImportJson(''); setImportError(''); }} title="প্রশ্ন বাল্ক ইমপোর্ট (Bulk Import)" maxWidth="max-w-2xl">
        <form onSubmit={handleBulkImport} className="space-y-4 font-sans">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-700 leading-relaxed">
            <span className="font-bold block mb-1">নির্দেশনাবলী:</span>
            ১. প্রথমে প্রশ্নগুলো কোন অধ্যায়ে যুক্ত হবে তা নির্বাচন করুন।<br />
            ২. নিচে প্রশ্নোত্তর সম্বলিত JSON অবজেক্ট বা অ্যারে পেস্ট করুন। JSON-এ `question` (প্রশ্ন), `type` (mcq/cq) এবং `options` (অপশনগুলোর অ্যারে) থাকা আবশ্যক। MCQ-এর ক্ষেত্রে `mcqAns` (০-ভিত্তিক সঠিক উত্তরের সূচক) প্রদান করুন।
          </div>

          {/* Template Copy Section */}
          <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-600">টেমপ্লেট কপি করুন:</span>
              <button
                type="button"
                onClick={() => handleCopyTemplate(activeTemplateTab)}
                className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-semibold px-2.5 py-1 bg-white border border-neutral-200 rounded-lg hover:shadow-sm transition-all"
                title="টেমপ্লেট কোড কপি করুন"
              >
                <HiOutlineClipboardCopy className="h-3.5 w-3.5" />
                কপি করুন
              </button>
            </div>
            
            <div className="flex gap-1 border-b border-neutral-200 pb-1.5">
              {[
                { id: 'mcq', label: 'বহুনির্বাচনী (MCQ)' },
                { id: 'cq', label: 'সৃজনশীল (CQ)' },
                { id: 'short', label: 'সংক্ষিপ্ত / অন্যান্য' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTemplateTab(tab.id)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                    activeTemplateTab === tab.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative rounded-lg overflow-hidden border border-neutral-200">
              <pre className="text-[10px] leading-relaxed font-mono bg-neutral-900 text-neutral-200 p-3 overflow-x-auto max-h-[140px] select-all">
                {JSON.stringify(IMPORT_TEMPLATES[activeTemplateTab], null, 2)}
              </pre>
            </div>
          </div>

          {/* Chapter Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">ক্লাস নির্বাচন করুন *</label>
              <select value={impClass} onChange={(e) => { setImpClass(e.target.value); setImpVersion(''); setImpSubject(''); setImpChapter(''); }}
                className="w-full px-3 py-2 border border-neutral-350 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary-500 outline-none" required>
                <option value="">ক্লাস সিলেক্ট করুন</option>
                {tree.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">ভার্সন নির্বাচন করুন *</label>
              <select value={impVersion} onChange={(e) => { setImpVersion(e.target.value); setImpSubject(''); setImpChapter(''); }}
                className="w-full px-3 py-2 border border-neutral-350 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary-500 outline-none" disabled={!impClass} required>
                <option value="">ভার্সন সিলেক্ট করুন</option>
                {impVersions.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">বিষয় নির্বাচন করুন *</label>
              <select value={impSubject} onChange={(e) => { setImpSubject(e.target.value); setImpChapter(''); setImpTopic(''); }}
                className="w-full px-3 py-2 border border-neutral-350 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary-500 outline-none" disabled={!impVersion} required>
                <option value="">বিষয় সিলেক্ট করুন</option>
                {impSubjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">অধ্যায় নির্বাচন করুন *</label>
              <select value={impChapter} onChange={(e) => { setImpChapter(e.target.value); setImpTopic(''); }}
                className="w-full px-3 py-2 border border-neutral-350 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary-500 outline-none" disabled={!impSubject} required>
                <option value="">অধ্যায় সিলেক্ট করুন</option>
                {impChapters.map((ch) => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">টপিক / পাঠ (ঐচ্ছিক)</label>
              <select value={impTopic} onChange={(e) => setImpTopic(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-350 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary-500 outline-none" disabled={!impChapter}>
                <option value="">সব টপিক</option>
                {impTopics.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* JSON Textarea */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">JSON কোড পেস্ট করুন *</label>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='[ { "question": "উূভল ঔঈঋ গঙ ঘূ?", "type": "mcq", "options": ["ওম", "কুলম্ব", "জুল", "ফ্যারাড"], "mcqAns": 1 } ]'
              rows={8}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary-500 outline-none resize-y"
              required
            />
          </div>

          {importError && (
            <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 p-2.5 rounded-lg">{importError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button type="button" variant="ghost" onClick={() => { setImportModalOpen(false); setImportJson(''); setImportError(''); }} disabled={isImporting}>
              বাতিল
            </Button>
            <Button type="submit" disabled={isImporting}>
              {isImporting ? 'ইমপোর্ট করা হচ্ছে...' : 'ইমপোর্ট সম্পন্ন করুন'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Excel Upload & Live Preview Modal */}
      <Modal
        isOpen={excelModalOpen}
        onClose={() => {
          setExcelModalOpen(false);
          setExcelFile(null);
          setExcelParsedResult(null);
          setExcelError('');
        }}
        title="Excel ফাইল থেকে প্রশ্ন বাল্ক আপলোড (Excel Upload & Live Preview)"
        maxWidth="max-w-5xl"
      >
        <div className="space-y-5 font-sans">
          {/* Instructions & Template Download Banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
            <div>
              <span className="font-bold block mb-1 text-sm text-emerald-800">
                Excel আপলোড গাইডলাইন:
              </span>
              ১. Bangla Excel ফাইল (`.xlsx`) আপলোড করুন। (উদা: HSC-Sample-2.xlsx)<br />
              ২. কলামসমূহ: `প্রশ্ন`, `অপশন ক`, `অপশন খ`, `অপশন গ`, `অপশন ঘ`, `সঠিক উত্তর`, `বিষয়`, `অধ্যায়`, `টপিক`, `Structural Level`, `Cognitive Level`, `Book Reference`, `Source` ইত্যাদি।<br />
              ৩. বিষয়, অধ্যায় এবং টপিকের নাম স্বয়ংক্রিয়ভাবে ডাটাবেজ থেকে রেজোলিউশন করে দেখানো হবে।
            </div>
            <a
              href="/templates/HSC-Sample-2.xlsx"
              download="HSC-Sample-2.xlsx"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shrink-0 shadow-sm transition-all text-xs"
            >
              <HiOutlineDownload className="h-4 w-4" />
              স্যাম্পল Excel ডাউনলোড
            </a>
          </div>

          {/* File Picker & Action Bar */}
          <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Excel ফাইল নির্বাচন করুন (.xlsx / .xls)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setExcelFile(file);
                    handleParseExcelFile(file);
                  }
                }}
                className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-neutral-300 rounded-lg bg-white p-1"
              />
              {excelFile && (
                <Button
                  onClick={() => handleParseExcelFile()}
                  disabled={isParsingExcel}
                  size="sm"
                  className="shrink-0 bg-primary-600 text-white"
                >
                  {isParsingExcel ? 'পার্স করা হচ্ছে...' : 'পুনরায় পার্স করুন'}
                </Button>
              )}
            </div>
          </div>

          {excelError && (
            <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 p-3 rounded-lg">
              {excelError}
            </p>
          )}

          {/* Parsed Results Banner & Live Preview */}
          {excelParsedResult && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-xs">
                  <span className="text-xs text-neutral-500 block">মোট প্রশ্ন</span>
                  <span className="text-lg font-bold text-neutral-800">
                    {excelParsedResult.totalParsed}টি
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-xs">
                  <span className="text-xs text-emerald-600 block font-medium">সঠিক (Valid)</span>
                  <span className="text-lg font-bold text-emerald-700">
                    {excelParsedResult.validCount}টি
                  </span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl shadow-xs">
                  <span className="text-xs text-amber-600 block font-medium">সতর্কতা (Warning)</span>
                  <span className="text-lg font-bold text-amber-700">
                    {excelParsedResult.warningCount}টি
                  </span>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl shadow-xs">
                  <span className="text-xs text-rose-600 block font-medium">ত্রুটিপূর্ণ (Invalid)</span>
                  <span className="text-lg font-bold text-rose-700">
                    {excelParsedResult.invalidCount}টি
                  </span>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-xs bg-white">
                <div className="p-3 bg-neutral-100/70 border-b border-neutral-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    পার্সকৃত প্রশ্নের সরাসরি প্রিভিউ ({excelParsedResult.questions?.length}টি)
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    এডিট বাটনে ক্লিক করে প্রশ্নের তথ্য পরিবর্তন করতে পারবেন
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 sticky top-0 font-semibold">
                      <tr>
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3 min-w-[220px]">প্রশ্ন ও অপশন</th>
                        <th className="p-3 min-w-[180px]">বিষয়, অধ্যায় ও টপিক (Actual Names)</th>
                        <th className="p-3 min-w-[170px] text-center">ফরম্যাট, ডোমেইন ও রেফারেন্স</th>
                        <th className="p-3 w-24 text-center">স্ট্যাটাস</th>
                        <th className="p-3 w-20 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {excelParsedResult.questions?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="p-3 text-center text-neutral-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="p-3 space-y-1">
                            <div className="font-medium text-neutral-900 leading-snug">
                              <MathRenderer text={item.questionText} />
                            </div>
                            {item.type === 'MCQ' && (
                              <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                                {item.options?.map((opt, oIdx) => (
                                  <span
                                    key={oIdx}
                                    className={`px-1.5 py-0.5 rounded border ${
                                      opt.isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                                        : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                                    }`}
                                  >
                                    {['ক', 'খ', 'গ', 'ঘ'][oIdx] || oIdx + 1}. {opt.text}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.type === 'CQ' && (
                              <div className="space-y-0.5 text-[11px] pt-1 text-neutral-600">
                                {item.subParts?.map((sp, spIdx) => (
                                  <div key={spIdx} className="truncate">
                                    <span className="font-bold text-neutral-800">{sp.partLabel}.</span> {sp.text} ({sp.marks} নম্বর)
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3 space-y-1">
                            <div className="flex flex-wrap gap-1">
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                {item.subjectName || item.subjectRaw || 'বিষয় নেই'}
                              </span>
                              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                {item.chapterName || item.chapterRaw || 'অধ্যায় নেই'}
                              </span>
                              {item.topicName && (
                                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[11px]">
                                  {item.topicName}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center space-y-1">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${TYPE_COLORS[item.type]}`}>
                                {item.type}
                              </span>
                              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                {item.structuralLevelRaw || FORMAT_LABELS[item.format] || item.format}
                              </span>
                            </div>
                            <div>
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                🧠 {item.cognitiveLevelRaw || COGNITIVE_DOMAINS.find(d => d.value === item.cognitiveDomain)?.label || item.cognitiveDomain}
                              </span>
                            </div>
                            {item.bookReference && (
                              <div>
                                <span className="bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded text-[10px] font-bold inline-block max-w-[150px] truncate" title={item.bookReference}>
                                  📖 {item.bookReference}
                                </span>
                              </div>
                            )}
                            {item.sources?.length > 0 && (
                              <div className="flex flex-wrap justify-center gap-1">
                                {item.sources.map((src, sIdx) => (
                                  <span key={sIdx} className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${src === 'Inspired' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>
                                    {src === 'Inspired' ? '💡 Inspired' : src}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {item.status === 'valid' && (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <HiOutlineCheckCircle className="h-3 w-3" /> Valid
                              </span>
                            )}
                            {item.status === 'warning' && (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold" title={item.warnings?.join(', ')}>
                                <HiOutlineExclamationCircle className="h-3 w-3" /> Warning
                              </span>
                            )}
                            {item.status === 'invalid' && (
                              <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px] font-bold" title={item.errors?.join(', ')}>
                                <HiOutlineX className="h-3 w-3" /> Invalid
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditParsedItem(idx)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="এডিট করুন"
                            >
                              <HiOutlinePencilAlt className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParsedItem(idx)}
                              className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                              title="মুছে ফেলুন"
                            >
                              <HiOutlineTrash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setExcelModalOpen(false);
                setExcelFile(null);
                setExcelParsedResult(null);
                setExcelError('');
              }}
              disabled={isImportingExcel}
            >
              বাতিল
            </Button>

            {excelParsedResult && (
              <Button
                type="button"
                onClick={handleConfirmExcelImport}
                disabled={isImportingExcel || excelParsedResult.validCount + excelParsedResult.warningCount === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
              >
                {isImportingExcel
                  ? 'ইমপোর্ট করা হচ্ছে...'
                  : `নিশ্চিত করুন এবং ${excelParsedResult.validCount + excelParsedResult.warningCount}টি প্রশ্ন ইমপোর্ট করুন`}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Item Edit Sub-Modal (For Excel Preview Items) */}
      {editingExcelItem && (
        <Modal
          isOpen={!!editingExcelItem}
          onClose={() => setEditingExcelItem(null)}
          title="প্রিভিউ প্রশ্নের তথ্য সংশোধন"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 font-sans text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">প্রশ্ন *</label>
              <textarea
                value={editingExcelItem.questionText || ''}
                onChange={(e) => setEditingExcelItem({ ...editingExcelItem, questionText: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {editingExcelItem.type === 'MCQ' && editingExcelItem.options && (
              <div className="space-y-2">
                <label className="block font-semibold text-neutral-700">অপশন ও সঠিক উত্তর *</label>
                {editingExcelItem.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="editingCorrectOpt"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const opts = editingExcelItem.options.map((o, i) => ({ ...o, isCorrect: i === oIdx }));
                        setEditingExcelItem({ ...editingExcelItem, options: opts, mcqAns: oIdx });
                      }}
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const opts = [...editingExcelItem.options];
                        opts[oIdx].text = e.target.value;
                        setEditingExcelItem({ ...editingExcelItem, options: opts });
                      }}
                      className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Structural Level / ফরম্যাট</label>
                <select
                  value={editingExcelItem.format || 'single_correct'}
                  onChange={(e) => setEditingExcelItem({ ...editingExcelItem, format: e.target.value })}
                  className="w-full px-2.5 py-2 border border-neutral-300 rounded-lg bg-white outline-none text-xs font-medium"
                >
                  <option value="single_correct">সাধারণ বহুনির্বাচনি</option>
                  <option value="multiple_correct">বহুপদী সমাপ্তিসূচক</option>
                  <option value="passage_mcq">অভিন্ন তথ্যভিত্তিক</option>
                  <option value="none">প্রযোজ্য নয়</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Cognitive Level / জ্ঞানীয় স্তর</label>
                <select
                  value={editingExcelItem.cognitiveDomain}
                  onChange={(e) => setEditingExcelItem({ ...editingExcelItem, cognitiveDomain: e.target.value })}
                  className="w-full px-2.5 py-2 border border-neutral-300 rounded-lg bg-white outline-none text-xs font-medium"
                >
                  {COGNITIVE_DOMAINS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Book Reference / বই</label>
                <input
                  type="text"
                  value={editingExcelItem.bookReference || ''}
                  onChange={(e) => setEditingExcelItem({ ...editingExcelItem, bookReference: e.target.value })}
                  placeholder="যেমন: আবুল হাসান"
                  className="w-full px-2.5 py-2 border border-neutral-300 rounded-lg outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">ব্যাখ্যা</label>
              <textarea
                value={editingExcelItem.explanation || ''}
                onChange={(e) => setEditingExcelItem({ ...editingExcelItem, explanation: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button variant="ghost" onClick={() => setEditingExcelItem(null)}>বাতিল</Button>
              <Button onClick={handleSaveEditedParsedItem}>সংরক্ষণ করুন</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
