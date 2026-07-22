'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  fetchTeacherClasses,
  fetchTeacherVersions,
  fetchTeacherSubjects,
  fetchTeacherChapters,
  fetchTeacherQuestions,
  clearContent,
} from '@/store/slices/teacherSlice';
import Skeleton from '@/components/ui/Skeleton';
import {
  HiOutlineBookOpen,
  HiOutlineChevronRight,
  HiOutlineAcademicCap,
  HiOutlineQuestionMarkCircle,
  HiOutlineCube,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineX,
} from 'react-icons/hi';
import MathRenderer from '@/components/shared/MathRenderer';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import apiClient from '@/store/api/apiClient';
import dynamic from 'next/dynamic';

const ImageUpload = dynamic(() => import('@/components/ui/ImageUpload'), { ssr: false });
const MathInput = dynamic(() => import('@/components/ui/MathInput'), { ssr: false });

const typeLabels = { MCQ: 'MCQ', CQ: 'সৃজনশীল', SHORT: 'সংক্ষিপ্ত' };
const typeColors = {
  MCQ: 'bg-indigo-100 text-indigo-700',
  CQ: 'bg-amber-100 text-amber-700',
  SHORT: 'bg-emerald-100 text-emerald-700',
};
const diffLabels = { easy: 'সহজ', medium: 'মাঝারি', hard: 'কঠিন' };
const diffColors = {
  easy: 'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-600',
  hard: 'bg-rose-50 text-rose-600',
};

export default function TeacherMyContentPage() {
  const dispatch = useDispatch();
  const { content, isLoading } = useSelector((state) => state.teacher);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [filters, setFilters] = useState({ type: '', difficulty: '' });

  // Modal & Create Question state
  const [modalOpen, setModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'MCQ',
    format: 'single_correct',
    questionText: '',
    cognitiveDomain: 'knowledge',
    difficulty: 'easy',
    marks: 1,
    negativeMarks: 0,
    explanation: '',
    bookReference: '',
    sources: ['Main Book'],
    options: [
      { text: '', isCorrect: true, order: 1 },
      { text: '', isCorrect: false, order: 2 },
      { text: '', isCorrect: false, order: 3 },
      { text: '', isCorrect: false, order: 4 },
    ],
    stimulus: '',
    stimulusImage: '',
    questionImage: '',
    subParts: [{ partLabel: 'ক', text: '', marks: 1, sampleAnswer: '' }],
  });

  useEffect(() => {
    dispatch(fetchTeacherClasses());
    return () => { dispatch(clearContent()); };
  }, [dispatch]);

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setSelectedVersion(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
    dispatch(clearContent());
    dispatch(fetchTeacherVersions(cls._id));
  };

  const handleVersionSelect = (ver) => {
    setSelectedVersion(ver);
    setSelectedSubject(null);
    setSelectedChapter(null);
    dispatch(fetchTeacherSubjects({ classId: selectedClass._id, versionId: ver._id }));
  };

  const handleSubjectSelect = (sub) => {
    setSelectedSubject(sub);
    setSelectedChapter(null);
    dispatch(fetchTeacherChapters(sub._id));
  };

  const handleChapterSelect = (ch) => {
    setSelectedChapter(ch);
    dispatch(fetchTeacherQuestions({
      chapterId: ch._id,
      ...(filters.type && { type: filters.type }),
      ...(filters.difficulty && { difficulty: filters.difficulty }),
    }));
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (selectedChapter) {
      dispatch(fetchTeacherQuestions({
        chapterId: selectedChapter._id,
        ...(newFilters.type && { type: newFilters.type }),
        ...(newFilters.difficulty && { difficulty: newFilters.difficulty }),
      }));
    }
  };

  // Breadcrumb
  const breadcrumbs = [
    selectedClass && { label: selectedClass.name, onClick: () => { setSelectedClass(null); setSelectedVersion(null); setSelectedSubject(null); setSelectedChapter(null); dispatch(clearContent()); dispatch(fetchTeacherClasses()); } },
    selectedVersion && { label: selectedVersion.name, onClick: () => { setSelectedVersion(null); setSelectedSubject(null); setSelectedChapter(null); handleClassSelect(selectedClass); } },
    selectedSubject && { label: selectedSubject.name || selectedSubject.nameEn, onClick: () => { setSelectedSubject(null); setSelectedChapter(null); handleVersionSelect(selectedVersion); } },
    selectedChapter && { label: selectedChapter.name || selectedChapter.nameEn },
  ].filter(Boolean);
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!selectedChapter) {
      toast.error('অধ্যায় নির্বাচন করুন');
      return;
    }
    if (!form.questionText.trim()) {
      toast.error('প্রশ্ন টেক্সট প্রদান করুন');
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        ...form,
        chapterId: selectedChapter._id,
        classId: selectedClass._id,
        versionId: selectedVersion._id,
        subjectId: selectedSubject._id,
        marks: Number(form.marks),
        negativeMarks: Number(form.negativeMarks || 0),
      };
      await apiClient.post('/questions', payload);
      toast.success('প্রশ্ন সফলভাবে তৈরি করা হয়েছে!');
      setModalOpen(false);
      dispatch(fetchTeacherQuestions({
        chapterId: selectedChapter._id,
        ...(filters.type && { type: filters.type }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
      }));
    } catch (err) {
      toast.error(err?.error?.message || 'প্রশ্ন তৈরি করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">আমার কন্টেন্ট</h1>
        <p className="text-sm text-neutral-500 mt-1">আপনার প্যাকেজ অনুযায়ী কন্টেন্ট ব্রাউজ করুন</p>
      </div>

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1.5 mb-5 flex-wrap text-sm">
          <button onClick={() => { setSelectedClass(null); setSelectedVersion(null); setSelectedSubject(null); setSelectedChapter(null); dispatch(clearContent()); dispatch(fetchTeacherClasses()); }} className="text-primary-600 hover:text-primary-700 font-medium">
            সকল ক্লাস
          </button>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <HiOutlineChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              {b.onClick ? (
                <button onClick={b.onClick} className="text-primary-600 hover:text-primary-700 font-medium">{b.label}</button>
              ) : (
                <span className="text-neutral-700 font-medium">{b.label}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Step 1: Classes */}
      {!selectedClass && (
        <ContentGrid
          items={content.classes}
          isLoading={isLoading}
          onSelect={handleClassSelect}
          icon={HiOutlineAcademicCap}
          emptyIcon={HiOutlineCube}
          emptyText="কোনো কন্টেন্ট নেই"
          emptySubtext="প্যাকেজ কিনলে কন্টেন্ট দেখাবে"
          renderLabel={(item) => item.name}
          renderSub={(item) => item.nameEn}
        />
      )}

      {/* Step 2: Versions */}
      {selectedClass && !selectedVersion && (
        <ContentGrid
          items={content.versions}
          isLoading={isLoading}
          onSelect={handleVersionSelect}
          icon={HiOutlineBookOpen}
          emptyText="কোনো ভার্সন নেই"
          renderLabel={(item) => item.name}
        />
      )}

      {/* Step 3: Subjects */}
      {selectedVersion && !selectedSubject && (
        <ContentGrid
          items={content.subjects}
          isLoading={isLoading}
          onSelect={handleSubjectSelect}
          icon={HiOutlineBookOpen}
          emptyText="কোনো বিষয় নেই"
          renderLabel={(item) => item.name}
          renderSub={(item) => item.nameEn}
        />
      )}

      {/* Step 4: Chapters */}
      {selectedSubject && !selectedChapter && (
        <ContentGrid
          items={content.chapters}
          isLoading={isLoading}
          onSelect={handleChapterSelect}
          icon={HiOutlineBookOpen}
          emptyText="কোনো অধ্যায় নেই"
          renderLabel={(item) => item.name}
          renderSub={(item) => item.nameEn}
          showOrder
        />
      )}

      {/* Step 5: Questions */}
      {selectedChapter && (
        <div>
          {/* Action Bar & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="text-sm border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
              >
                <option value="">সকল ধরন</option>
                <option value="MCQ">MCQ</option>
                <option value="CQ">সৃজনশীল</option>
                <option value="SHORT">সংক্ষিপ্ত</option>
              </select>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="text-sm border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
              >
                <option value="">সকল ডিফিকাল্টি</option>
                <option value="easy">সহজ</option>
                <option value="medium">মাঝারি</option>
                <option value="hard">কঠিন</option>
              </select>
            </div>

            <Button
              onClick={() => {
                setForm({
                  type: 'MCQ',
                  format: 'single_correct',
                  questionText: '',
                  cognitiveDomain: 'knowledge',
                  difficulty: 'easy',
                  marks: 1,
                  negativeMarks: 0,
                  explanation: '',
                  bookReference: '',
                  sources: ['Main Book'],
                  options: [
                    { text: '', isCorrect: true, order: 1 },
                    { text: '', isCorrect: false, order: 2 },
                    { text: '', isCorrect: false, order: 3 },
                    { text: '', isCorrect: false, order: 4 },
                  ],
                  stimulus: '',
                  stimulusImage: '',
                  questionImage: '',
                  subParts: [{ partLabel: 'ক', text: '', marks: 1, sampleAnswer: '' }],
                });
                setShowAdvanced(false);
                setModalOpen(true);
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <HiOutlinePlus className="h-4 w-4" />
              নতুন প্রশ্ন যোগ করুন
            </Button>
          </div>

          {/* Question List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : content.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <HiOutlineQuestionMarkCircle className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">এই অধ্যায়ে কোনো প্রশ্ন নেই</p>
            </div>
          ) : (
            <div className="space-y-4">
              {content.questions.map((q, idx) => (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[q.type] || 'bg-neutral-100 text-neutral-600'}`}>
                      {typeLabels[q.type] || q.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColors[q.difficulty] || ''}`}>
                      {diffLabels[q.difficulty] || q.difficulty}
                    </span>
                    <span className="text-xs text-neutral-400 ml-auto">{q.marks} নম্বর</span>
                  </div>

                   {q.stimulus && (
                     <div className="mb-3 bg-neutral-50 border-l-4 border-primary-500 p-3 rounded-lg text-sm text-neutral-700 leading-relaxed font-serif">
                       <span className="font-bold block text-neutral-800 mb-1">উদ্দীপক:</span>
                       <MathRenderer text={q.stimulus} />
                       {q.stimulusImage && (
                         <div className="mt-2">
                           <img src={q.stimulusImage} alt="উদ্দীপক চিত্র" className="max-h-48 object-contain rounded border border-neutral-200 bg-white" />
                         </div>
                       )}
                     </div>
                   )}

                   <div className="text-sm sm:text-base text-neutral-800 font-medium leading-relaxed">
                     <MathRenderer text={q.questionText} />
                   </div>

                   {q.questionImage && (
                     <div className="mt-2 mb-3">
                       <img src={q.questionImage} alt="প্রশ্ন চিত্র" className="max-h-32 object-contain rounded border border-neutral-200 bg-white" />
                     </div>
                   )}

                   {/* MCQ Options */}
                   {q.type === 'MCQ' && q.options?.length > 0 && (
                     <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {q.options.map((opt, oi) => (
                         <div
                           key={oi}
                           className={`text-sm px-3 py-2 rounded-lg border flex items-center justify-between gap-2 ${opt.isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-700 font-medium' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}
                         >
                           <div className="flex items-center gap-1.5">
                             <span className="font-bold text-neutral-400">{String.fromCharCode(2453 + oi)})</span>
                             <MathRenderer text={opt.text} />
                           </div>
                           {opt.image && (
                             <div className="ml-2 shrink-0">
                               <img src={opt.image} alt="" className="h-10 w-10 object-contain rounded border bg-white" />
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                   )}

                   {/* CQ Sub-parts */}
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

                   {/* Short Answer expectedAnswer */}
                   {(q.type === 'OTHER' || q.type === 'SHORT') && q.expectedAnswer && (
                     <div className="mt-3 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-150">
                       <span className="font-semibold text-neutral-700 block mb-1">নমুনা উত্তর / মূল্যায়ন নির্দেশিকা:</span>
                       <MathRenderer text={q.expectedAnswer} />
                     </div>
                   )}

                   {q.explanation && (
                     <div className="mt-3 text-xs text-neutral-500 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                       <span className="font-medium text-neutral-600">ব্যাখ্যা:</span> <MathRenderer text={q.explanation} />
                     </div>
                   )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Teacher Create Question Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`নতুন প্রশ্ন যোগ করুন (${selectedChapter?.name || ''})`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4 font-sans text-xs">
          {/* Question Type */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">প্রশ্নের ধরন *</label>
            <div className="flex gap-3">
              {[
                { value: 'MCQ', label: 'বহুনির্বাচনী (MCQ)' },
                { value: 'CQ', label: 'সৃজনশীল (CQ)' },
                { value: 'SHORT', label: 'সংক্ষিপ্ত (Short Answer)' },
              ].map((t) => (
                <label key={t.value} className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="teacherQType"
                    value={t.value}
                    checked={form.type === t.value}
                    onChange={(e) => {
                      const type = e.target.value;
                      setForm({
                        ...form,
                        type,
                        format: type === 'CQ' ? 'creative_default' : type === 'SHORT' ? 'short_answer' : 'single_correct',
                      });
                    }}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          {/* Structural Level / Format */}
          {form.type === 'MCQ' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Structural Level / কাঠামোগত স্তর *</label>
              <select
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium bg-white outline-none"
              >
                <option value="single_correct">সাধারণ বহুনির্বাচনি</option>
                <option value="multiple_correct">বহুপদী সমাপ্তিসূচক</option>
                <option value="passage_mcq">অভিন্ন তথ্যভিত্তিক</option>
                <option value="none">প্রযোজ্য নয়</option>
              </select>
            </div>
          )}

          {/* Question Text */}
          <MathInput
            label="প্রশ্ন টেক্সট *"
            value={form.questionText}
            onChange={(val) => setForm({ ...form, questionText: val })}
            rows={3}
            placeholder="প্রশ্ন লিখুন..."
            required
          />

          {/* MCQ Options */}
          {form.type === 'MCQ' && (
            <div className="space-y-2">
              <label className="block font-semibold text-neutral-700">অপশন ও সঠিক উত্তর *</label>
              {form.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const opts = form.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                      setForm({ ...form, options: opts });
                    }}
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      opt.isCorrect ? 'bg-emerald-500 text-white ring-2 ring-emerald-200' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    {opt.isCorrect ? <HiOutlineCheck className="h-3.5 w-3.5" /> : String.fromCharCode(2453 + idx)}
                  </button>
                  <MathInput
                    value={opt.text}
                    onChange={(val) => {
                      const opts = [...form.options];
                      opts[idx].text = val;
                      setForm({ ...form, options: opts });
                    }}
                    rows={1}
                    placeholder={`বিকল্প ${String.fromCharCode(2453 + idx)}`}
                    required
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Cognitive Level & Marks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Cognitive Level / জ্ঞানীয় স্তর *</label>
              <select
                value={form.cognitiveDomain}
                onChange={(e) => setForm({ ...form, cognitiveDomain: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium bg-white outline-none"
              >
                <option value="knowledge">জ্ঞান</option>
                <option value="comprehension">অনুধাবন</option>
                <option value="application">প্রয়োগ</option>
                <option value="higher_skills">উচ্চতর দক্ষতা</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">নম্বর (Marks)</label>
              <input
                type="number"
                value={form.marks}
                onChange={(e) => setForm({ ...form, marks: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white"
                min="0"
                step="any"
              />
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-lg text-xs transition-all border border-neutral-300"
            >
              <span>{showAdvanced ? '⚙️ বিস্তারিত অপশনসমূহ লুকান' : '⚙️ বিস্তারিত অপশনসমূহ (বই রেফারেন্স, ব্যাখ্যা, ডিফিকাল্টি...)'}</span>
              <span>{showAdvanced ? '▲' : '▼'}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-dashed border-neutral-300">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Book Reference / বই</label>
                  <input
                    type="text"
                    value={form.bookReference || ''}
                    onChange={(e) => setForm({ ...form, bookReference: e.target.value })}
                    placeholder="যেমন: আবুল হাসান, আজমল"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">ডিফিকাল্টি</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium bg-white outline-none"
                  >
                    <option value="easy">সহজ</option>
                    <option value="medium">মাঝারি</option>
                    <option value="hard">কঠিন</option>
                  </select>
                </div>
              </div>
              <MathInput
                label="ব্যাখ্যা (ঐচ্ছিক)"
                value={form.explanation}
                onChange={(val) => setForm({ ...form, explanation: val })}
                rows={2}
                placeholder="সঠিক উত্তরের ব্যাখ্যা..."
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-2 pt-3 border-t border-neutral-200">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={isSubmitting} className="flex-1">
              বাতিল
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white">
              {isSubmitting ? 'সংরক্ষণ করা হচ্ছে...' : 'প্রশ্ন তৈরি করুন'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Reusable content grid component for classes/versions/subjects/chapters
function ContentGrid({ items, isLoading, onSelect, icon: Icon, emptyIcon: EmptyIcon, emptyText, emptySubtext, renderLabel, renderSub, showOrder }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (!items || items.length === 0) {
    const FallbackIcon = EmptyIcon || Icon;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
        <FallbackIcon className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-lg font-medium">{emptyText}</p>
        {emptySubtext && <p className="text-sm mt-1">{emptySubtext}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <motion.button
          key={item._id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          onClick={() => onSelect(item)}
          className="text-left bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            {showOrder ? (
              <span className="text-white font-bold text-sm">{item.order}</span>
            ) : (
              <Icon className="h-5 w-5 text-white" />
            )}
          </div>
          <p className="text-sm font-semibold text-neutral-800">{renderLabel(item)}</p>
          {renderSub && <p className="text-xs text-neutral-400 mt-0.5">{renderSub(item)}</p>}
        </motion.button>
      ))}
    </div>
  );
}
