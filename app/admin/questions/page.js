'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchQuestions, createQuestion, updateQuestion, toggleQuestionActive, deleteQuestion } from '@/store/slices/questionSlice';
import { fetchTree } from '@/store/slices/hierarchySlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineFilter,
  HiOutlineCheck, HiOutlineX,
} from 'react-icons/hi';

const COGNITIVE_DOMAINS = [
  { value: 'knowledge', label: 'জ্ঞান', color: 'bg-blue-100 text-blue-700' },
  { value: 'comprehension', label: 'অনুধাবন', color: 'bg-green-100 text-green-700' },
  { value: 'application', label: 'প্রয়োগ', color: 'bg-amber-100 text-amber-700' },
  { value: 'higher_skills', label: 'উচ্চতর দক্ষতা', color: 'bg-purple-100 text-purple-700' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'সহজ', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'medium', label: 'মধ্যম', color: 'bg-amber-100 text-amber-700' },
  { value: 'hard', label: 'কঠিন', color: 'bg-red-100 text-red-700' },
];

const TYPE_LABELS = { MCQ: 'বহুনির্বাচনী', CQ: 'সৃজনশীল', SHORT: 'সংক্ষিপ্ত' };
const TYPE_COLORS = {
  MCQ: 'bg-indigo-100 text-indigo-700',
  CQ: 'bg-rose-100 text-rose-700',
  SHORT: 'bg-teal-100 text-teal-700',
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

  // Form
  const [form, setForm] = useState({
    type: 'MCQ',
    questionText: '',
    cognitiveDomain: 'knowledge',
    difficulty: 'medium',
    marks: 1,
    explanation: '',
    chapterId: '',
    options: [
      { text: '', isCorrect: true, order: 1 },
      { text: '', isCorrect: false, order: 2 },
      { text: '', isCorrect: false, order: 3 },
      { text: '', isCorrect: false, order: 4 },
    ],
    stimulus: '',
    subParts: [{ partLabel: 'ক', text: '', marks: 2, sampleAnswer: '' }],
  });

  // Selected hierarchy for chapter picker
  const [selClass, setSelClass] = useState('');
  const [selVersion, setSelVersion] = useState('');
  const [selSubject, setSelSubject] = useState('');

  useEffect(() => {
    dispatch(fetchTree());
    dispatch(fetchQuestions(filters));
  }, [dispatch, filters]);

  const versions = tree.find((c) => c._id === selClass)?.versions || [];
  const subjects = versions.find((v) => v._id === selVersion)?.subjects || [];
  const chapters = subjects.find((s) => s._id === selSubject)?.chapters || [];

  const resetForm = () => {
    setForm({
      type: 'MCQ', questionText: '', cognitiveDomain: 'knowledge', difficulty: 'medium',
      marks: 1, explanation: '', chapterId: '',
      options: [
        { text: '', isCorrect: true, order: 1 }, { text: '', isCorrect: false, order: 2 },
        { text: '', isCorrect: false, order: 3 }, { text: '', isCorrect: false, order: 4 },
      ],
      stimulus: '', subParts: [{ partLabel: 'ক', text: '', marks: 2, sampleAnswer: '' }],
    });
    setSelClass(''); setSelVersion(''); setSelSubject('');
  };

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({
        type: item.type,
        questionText: item.questionText,
        cognitiveDomain: item.cognitiveDomain,
        difficulty: item.difficulty,
        marks: item.marks,
        explanation: item.explanation || '',
        chapterId: item.chapterId?._id || item.chapterId,
        options: item.options?.length > 0 ? item.options : [
          { text: '', isCorrect: true, order: 1 }, { text: '', isCorrect: false, order: 2 },
          { text: '', isCorrect: false, order: 3 }, { text: '', isCorrect: false, order: 4 },
        ],
        stimulus: item.stimulus || '',
        subParts: item.subParts?.length > 0 ? item.subParts : [{ partLabel: 'ক', text: '', marks: 2, sampleAnswer: '' }],
      });
      // Set hierarchy selectors
      setSelClass(item.classId?._id || '');
      setSelVersion(item.versionId?._id || '');
      setSelSubject(item.subjectId?._id || '');
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
      opts.forEach((o, i) => { o.isCorrect = i === idx; });
    } else {
      opts[idx] = { ...opts[idx], [field]: value };
    }
    setForm({ ...form, options: opts });
  };

  // Sub-part helpers
  const PART_LABELS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];
  const addSubPart = () => {
    const next = PART_LABELS[form.subParts.length] || `${form.subParts.length + 1}`;
    setForm({ ...form, subParts: [...form.subParts, { partLabel: next, text: '', marks: 2, sampleAnswer: '' }] });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        type: form.type,
        questionText: form.questionText,
        cognitiveDomain: form.cognitiveDomain,
        difficulty: form.difficulty,
        marks: Number(form.marks),
        explanation: form.explanation || undefined,
        chapterId: form.chapterId,
      };

      if (form.type === 'MCQ') {
        body.options = form.options.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, order: i + 1 }));
      }
      if (form.type === 'CQ') {
        body.stimulus = form.stimulus;
        body.subParts = form.subParts.map((p) => ({
          partLabel: p.partLabel, text: p.text, marks: Number(p.marks), sampleAnswer: p.sampleAnswer || undefined,
        }));
      }

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
          <Button size="sm" onClick={() => openModal()}>
            <HiOutlinePlus className="h-4 w-4" />
            নতুন প্রশ্ন
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white rounded-xl border border-neutral-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <select value={filters.type || ''} onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm">
                <option value="">সব ধরন</option>
                <option value="MCQ">বহুনির্বাচনী (MCQ)</option>
                <option value="CQ">সৃজনশীল (CQ)</option>
                <option value="SHORT">সংক্ষিপ্ত</option>
              </select>
              <select value={filters.cognitiveDomain || ''} onChange={(e) => setFilters({ ...filters, cognitiveDomain: e.target.value || undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm">
                <option value="">সব ডোমেইন</option>
                {COGNITIVE_DOMAINS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <select value={filters.difficulty || ''} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value || undefined })}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm">
                <option value="">সব মাত্রা</option>
                {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <Button variant="ghost" size="sm" onClick={() => setFilters({})}>রিসেট</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      {questions.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          কোনো প্রশ্ন নেই। "নতুন প্রশ্ন" বাটনে ক্লিক করুন।
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q, i) => (
          <motion.div
            key={q._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className={`bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-sm transition-all ${!q.isActive ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[q.type]}`}>
                    {TYPE_LABELS[q.type]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${COGNITIVE_DOMAINS.find((d) => d.value === q.cognitiveDomain)?.color || ''}`}>
                    {COGNITIVE_DOMAINS.find((d) => d.value === q.cognitiveDomain)?.label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTIES.find((d) => d.value === q.difficulty)?.color || ''}`}>
                    {DIFFICULTIES.find((d) => d.value === q.difficulty)?.label}
                  </span>
                  <span className="text-xs text-neutral-400">{q.marks} নম্বর</span>
                </div>

                {/* Question text */}
                <p className="text-sm text-neutral-800 font-medium leading-relaxed">{q.questionText}</p>

                {/* MCQ options preview */}
                {q.type === 'MCQ' && q.options?.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`text-xs px-2 py-1 rounded ${opt.isCorrect ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-neutral-500'}`}>
                        {String.fromCharCode(2453 + oi)}) {opt.text}
                        {opt.isCorrect && <HiOutlineCheck className="inline h-3 w-3 ml-1" />}
                      </div>
                    ))}
                  </div>
                )}

                {/* CQ sub-parts preview */}
                {q.type === 'CQ' && q.subParts?.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {q.subParts.map((sp, si) => (
                      <p key={si} className="text-xs text-neutral-500">
                        {sp.partLabel}) {sp.text} ({sp.marks} নম্বর)
                      </p>
                    ))}
                  </div>
                )}

                {/* Hierarchy breadcrumb */}
                <p className="text-xs text-neutral-400 mt-2">
                  {q.classId?.name} → {q.subjectId?.name} → {q.chapterId?.name}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openModal(q)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                  <HiOutlinePencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleToggle(q._id)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                  {q.isActive ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                </button>
                <button onClick={() => handleDelete(q._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500">
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'প্রশ্ন সম্পাদনা' : 'নতুন প্রশ্ন'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">প্রশ্নের ধরন *</label>
            <div className="flex gap-2">
              {['MCQ', 'CQ', 'SHORT'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.type === t
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Hierarchy cascade selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">ক্লাস *</label>
              <select value={selClass} onChange={(e) => { setSelClass(e.target.value); setSelVersion(''); setSelSubject(''); setForm({ ...form, chapterId: '' }); }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">বাছুন</option>
                {tree.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">ভার্সন *</label>
              <select value={selVersion} onChange={(e) => { setSelVersion(e.target.value); setSelSubject(''); setForm({ ...form, chapterId: '' }); }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">বাছুন</option>
                {versions.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">বিষয় *</label>
              <select value={selSubject} onChange={(e) => { setSelSubject(e.target.value); setForm({ ...form, chapterId: '' }); }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">বাছুন</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">অধ্যায় *</label>
              <select value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">বাছুন</option>
                {chapters.map((ch) => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
              </select>
            </div>
          </div>

          {/* Question text */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">প্রশ্ন *</label>
            <textarea value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              rows={3} placeholder="প্রশ্ন লিখুন..." required />
          </div>

          {/* Cognitive Domain + Difficulty + Marks */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">জ্ঞানমূলক স্তর *</label>
              <select value={form.cognitiveDomain} onChange={(e) => setForm({ ...form, cognitiveDomain: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                {COGNITIVE_DOMAINS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">কঠিনতা</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">নম্বর</label>
              <input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" min="0" />
            </div>
          </div>

          {/* MCQ Options */}
          {form.type === 'MCQ' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">বিকল্প *</label>
              <div className="space-y-2">
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button type="button" onClick={() => updateOption(idx, 'isCorrect', true)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        opt.isCorrect ? 'bg-emerald-500 text-white ring-2 ring-emerald-200' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                      }`}>
                      {opt.isCorrect ? <HiOutlineCheck className="h-4 w-4" /> : String.fromCharCode(2453 + idx)}
                    </button>
                    <input type="text" value={opt.text} onChange={(e) => updateOption(idx, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder={`বিকল্প ${String.fromCharCode(2453 + idx)}`} required />
                    {form.options.length > 2 && (
                      <button type="button" onClick={() => removeOption(idx)} className="p-1.5 text-neutral-400 hover:text-red-500">
                        <HiOutlineX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addOption} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  + আরো বিকল্প
                </button>
              </div>
            </div>
          )}

          {/* CQ Stimulus + Sub-parts */}
          {form.type === 'CQ' && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">উদ্দীপক</label>
                <textarea value={form.stimulus} onChange={(e) => setForm({ ...form, stimulus: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  rows={3} placeholder="উদ্দীপক / প্যাসেজ লিখুন..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">উপ-প্রশ্ন *</label>
                <div className="space-y-3">
                  {form.subParts.map((sp, idx) => (
                    <div key={idx} className="bg-neutral-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-neutral-600">{sp.partLabel})</span>
                        {form.subParts.length > 1 && (
                          <button type="button" onClick={() => removeSubPart(idx)} className="text-xs text-red-400 hover:text-red-600">মুছুন</button>
                        )}
                      </div>
                      <input type="text" value={sp.text} onChange={(e) => updateSubPart(idx, 'text', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="উপ-প্রশ্ন লিখুন..." required />
                      <div className="flex gap-2">
                        <input type="number" value={sp.marks} onChange={(e) => updateSubPart(idx, 'marks', e.target.value)}
                          className="w-20 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="নম্বর" min="0" required />
                        <input type="text" value={sp.sampleAnswer || ''} onChange={(e) => updateSubPart(idx, 'sampleAnswer', e.target.value)}
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="নমুনা উত্তর (ঐচ্ছিক)" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addSubPart} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    + আরো উপ-প্রশ্ন
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">ব্যাখ্যা (ঐচ্ছিক)</label>
            <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              rows={2} placeholder="সঠিক উত্তরের ব্যাখ্যা..." />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">বাতিল</Button>
            <Button type="submit" className="flex-1">{editItem ? 'আপডেট করুন' : 'তৈরি করুন'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
