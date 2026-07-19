'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  fetchTeacherClasses,
  fetchTeacherVersions,
  fetchTeacherSubjects,
  fetchTeacherChapters,
  fetchTeacherQuestions,
  createQuestionSet,
} from '@/store/slices/teacherSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import {
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineCube,
} from 'react-icons/hi';
import MathRenderer from '@/components/shared/MathRenderer';

const typeLabels = { MCQ: 'MCQ', CQ: 'সৃজনশীল', SHORT: 'সংক্ষিপ্ত' };
const typeColors = { MCQ: 'bg-indigo-100 text-indigo-700', CQ: 'bg-amber-100 text-amber-700', SHORT: 'bg-emerald-100 text-emerald-700' };

export default function CreateQuestionSetPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { content, isLoading } = useSelector((state) => state.teacher);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterIds, setSelectedChapterIds] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchTeacherClasses());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClassId) dispatch(fetchTeacherVersions(selectedClassId));
  }, [selectedClassId, dispatch]);

  useEffect(() => {
    if (selectedClassId && selectedVersionId) {
      dispatch(fetchTeacherSubjects({ classId: selectedClassId, versionId: selectedVersionId }));
    }
  }, [selectedClassId, selectedVersionId, dispatch]);

  useEffect(() => {
    if (selectedSubjectId) dispatch(fetchTeacherChapters(selectedSubjectId));
  }, [selectedSubjectId, dispatch]);

  const loadQuestions = () => {
    if (selectedChapterIds.length === 0 && !selectedSubjectId) return;
    const params = {};
    if (selectedChapterIds.length === 1) params.chapterId = selectedChapterIds[0];
    else if (selectedSubjectId) params.subjectId = selectedSubjectId;
    params.limit = 100;
    dispatch(fetchTeacherQuestions(params));
    setStep(3);
  };

  const toggleQuestion = (id) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = content.questions.map((q) => q._id);
    setSelectedQuestionIds(allIds);
  };

  const deselectAll = () => {
    setSelectedQuestionIds([]);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('প্রশ্ন সেটের নাম দিন'); return; }
    if (selectedQuestionIds.length === 0) { setError('অন্তত একটি প্রশ্ন নির্বাচন করুন'); return; }
    setSaving(true);
    setError('');
    try {
      await dispatch(createQuestionSet({
        name: name.trim(),
        description: description.trim(),
        questionIds: selectedQuestionIds,
        filterCriteria: {
          classId: selectedClassId || undefined,
          versionId: selectedVersionId || undefined,
          subjectId: selectedSubjectId || undefined,
          chapterIds: selectedChapterIds.length > 0 ? selectedChapterIds : undefined,
        },
      })).unwrap();
      router.push('/teacher/question-sets');
    } catch (err) {
      setError(err || 'তৈরি করা ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
          <HiOutlineArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">নতুন প্রশ্ন সেট</h1>
          <p className="text-sm text-neutral-500">ধাপ {step}/৩</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary-500' : 'bg-neutral-200'}`} />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>
      )}

      {/* Step 1: Name + Filters */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          {!isLoading && content.classes.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center max-w-2xl mx-auto my-8 space-y-5">
              <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <HiOutlineCube className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-800">কোনো সক্রিয় প্যাকেজ পাওয়া যায়নি</h2>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  প্রশ্ন সেট তৈরি করার জন্য আপনার কোনো সক্রিয় প্যাকেজ বা অ্যাক্সেস নেই। অনুগ্রহ করে প্রথমে একটি প্যাকেজ কিনুন অথবা আপনার পেন্ডিং পেমেন্ট অ্যাপ্রুভ হওয়ার জন্য অপেক্ষা করুন।
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="primary" onClick={() => router.push('/teacher/packages')}>
                  প্যাকেজ ব্রাউজ করুন
                </Button>
                <Button variant="outline" onClick={() => router.push('/teacher/purchases')}>
                  পেমেন্ট হিস্ট্রি দেখুন
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-neutral-800">প্রশ্ন সেটের তথ্য</h2>
                <Input label="নাম *" value={name} onChange={(e) => setName(e.target.value)} placeholder="যেমন: অধ্যায় ১ MCQ পরীক্ষা" />
                <div className="w-full">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">বিবরণ</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="ঐচ্ছিক বিবরণ..."
                    rows={3}
                    className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-neutral-800">কন্টেন্ট ফিল্টার</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">ক্লাস</label>
                    <select value={selectedClassId} onChange={(e) => { setSelectedClassId(e.target.value); setSelectedVersionId(''); setSelectedSubjectId(''); setSelectedChapterIds([]); }}
                      className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                      <option value="">নির্বাচন করুন</option>
                      {content.classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">ভার্সন</label>
                    <select value={selectedVersionId} onChange={(e) => { setSelectedVersionId(e.target.value); setSelectedSubjectId(''); setSelectedChapterIds([]); }}
                      className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" disabled={!selectedClassId}>
                      <option value="">নির্বাচন করুন</option>
                      {content.versions.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">বিষয়</label>
                    <select value={selectedSubjectId} onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedChapterIds([]); }}
                      className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" disabled={!selectedVersionId}>
                      <option value="">নির্বাচন করুন</option>
                      {content.subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">অধ্যায়</label>
                    <select value={selectedChapterIds[0] || ''} onChange={(e) => setSelectedChapterIds(e.target.value ? [e.target.value] : [])}
                      className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" disabled={!selectedSubjectId}>
                      <option value="">সকল অধ্যায়</option>
                      {content.chapters.map((ch) => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" onClick={() => { loadQuestions(); }} disabled={!selectedSubjectId}>
                  প্রশ্ন লোড করুন →
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Step 2 merged into step 3: Select Questions */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>← ফিরে যান</Button>
              <span className="text-sm text-neutral-500">
                {selectedQuestionIds.length}/{content.questions.length} নির্বাচিত
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>সব নির্বাচন</Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>সব বাদ</Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : content.questions.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <p className="text-sm">কোনো প্রশ্ন পাওয়া যায়নি</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setStep(1)}>ফিল্টার পরিবর্তন করুন</Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {content.questions.map((q, idx) => {
                  const isSelected = selectedQuestionIds.includes(q._id);
                  return (
                    <motion.div
                      key={q._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => toggleQuestion(q._id)}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${isSelected ? 'border-primary-400 bg-primary-50/30 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
                          {isSelected && <HiOutlineCheck className="h-3.5 w-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[q.type] || ''}`}>
                              {typeLabels[q.type] || q.type}
                            </span>
                            <span className="text-xs text-neutral-400">{q.marks} নম্বর</span>
                          </div>
                           <div className="text-sm text-neutral-800 line-clamp-2">
                             <MathRenderer text={q.questionText} />
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="sticky bottom-4 bg-white rounded-xl border border-neutral-200 shadow-lg p-4 flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  <span className="font-bold text-neutral-800">{selectedQuestionIds.length}</span> প্রশ্ন নির্বাচিত
                </div>
                <Button variant="primary" onClick={handleSave} loading={saving} disabled={selectedQuestionIds.length === 0 || !name.trim()}>
                  প্রশ্ন সেট তৈরি করুন
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
