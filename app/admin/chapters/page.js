'use client';

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchChapters, createChapter, updateChapter, toggleChapterActive, deleteChapter,
  fetchClasses, fetchVersions, fetchSubjects,
} from '@/store/slices/hierarchySlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff,
  HiOutlineFilter, HiOutlineX,
} from 'react-icons/hi';

export default function ChaptersPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const urlSubjectId = searchParams.get('subjectId');

  const { chapters = [], classes = [], versions = [], subjects = [], isLoading = false } = useSelector((state) => state.hierarchy || {});

  // ── Derive initial filter values from URL subjectId ──
  const initialFilters = useMemo(() => {
    if (!urlSubjectId) return { classId: '', versionId: '', subjectId: '' };
    // These will be empty until data loads, but state initializers only run once
    return { classId: '', versionId: '', subjectId: urlSubjectId };
  }, [urlSubjectId]);

  // ── Page-level cascade filters ──
  const [filterClassId, setFilterClassId] = useState(initialFilters.classId);
  const [filterVersionId, setFilterVersionId] = useState(initialFilters.versionId);
  const [filterSubjectId, setFilterSubjectId] = useState(initialFilters.subjectId);

  // ── Auto-populate class/version filter dropdowns from urlSubjectId (one-time) ──
  const [didAutoPopulate, setDidAutoPopulate] = useState(false);
  const autoPopulatedFilters = useMemo(() => {
    if (!urlSubjectId || didAutoPopulate || !subjects.length || !versions.length) return null;
    const sub = subjects.find((s) => s._id === urlSubjectId);
    if (!sub) return null;
    const vId = sub.versionId?._id || sub.versionId;
    const ver = versions.find((v) => v._id === vId);
    if (!ver) return null;
    const cId = ver.classId?._id || ver.classId;
    return { classId: cId || '', versionId: vId || '' };
  }, [urlSubjectId, subjects, versions, didAutoPopulate]);

  // Apply auto-populated values via a click-like handler (not in effect)
  if (autoPopulatedFilters && !didAutoPopulate) {
    setFilterClassId(autoPopulatedFilters.classId);
    setFilterVersionId(autoPopulatedFilters.versionId);
    setDidAutoPopulate(true);
  }

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', order: 0, subjectId: '' });
  const [modalClassId, setModalClassId] = useState('');
  const [modalVersionId, setModalVersionId] = useState('');

  // ── Load all reference data on mount ──
  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchVersions({ limit: 200 }));
    dispatch(fetchSubjects({ limit: 200 }));
  }, [dispatch]);

  // ── Derive filtered lists locally ──
  const filterVersionsList = useMemo(() => {
    if (!filterClassId) return [];
    return versions.filter((v) => (v.classId?._id || v.classId) === filterClassId);
  }, [versions, filterClassId]);

  const filterSubjectsList = useMemo(() => {
    if (!filterVersionId) return [];
    return subjects.filter((s) => (s.versionId?._id || s.versionId) === filterVersionId);
  }, [subjects, filterVersionId]);

  const modalVersionsList = useMemo(() => {
    if (!modalClassId) return [];
    return versions.filter((v) => (v.classId?._id || v.classId) === modalClassId);
  }, [versions, modalClassId]);

  const modalSubjectsList = useMemo(() => {
    if (!modalVersionId) return [];
    return subjects.filter((s) => (s.versionId?._id || s.versionId) === modalVersionId);
  }, [subjects, modalVersionId]);

  // ── Fetch chapters based on current filter ──
  useEffect(() => {
    const params = {};
    if (filterSubjectId) params.subjectId = filterSubjectId;
    dispatch(fetchChapters(params));
  }, [dispatch, filterSubjectId]);

  // ── Filter change handlers ──
  const handleFilterClassChange = (classId) => {
    setFilterClassId(classId);
    setFilterVersionId('');
    setFilterSubjectId('');
  };

  const handleFilterVersionChange = (versionId) => {
    setFilterVersionId(versionId);
    setFilterSubjectId('');
  };

  const resetFilters = () => {
    setFilterClassId('');
    setFilterVersionId('');
    setFilterSubjectId('');
  };

  // ── Modal helpers ──
  const handleModalClassChange = (classId) => {
    setModalClassId(classId);
    setModalVersionId('');
    setFormData((prev) => ({ ...prev, subjectId: '' }));
  };

  const handleModalVersionChange = (versionId) => {
    setModalVersionId(versionId);
    setFormData((prev) => ({ ...prev, subjectId: '' }));
  };

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      const itemSubjectId = item.subjectId?._id || item.subjectId || '';
      const itemSubject = subjects.find((s) => s._id === itemSubjectId);
      const itemVersionId = itemSubject ? (itemSubject.versionId?._id || itemSubject.versionId) : '';
      const itemVersion = versions.find((v) => v._id === itemVersionId);
      const itemClassId = itemVersion ? (itemVersion.classId?._id || itemVersion.classId) : '';

      setModalClassId(itemClassId);
      setModalVersionId(itemVersionId);
      setFormData({
        name: item.name,
        order: item.order || 0,
        subjectId: itemSubjectId,
      });
    } else {
      setModalClassId(filterClassId || '');
      setModalVersionId(filterVersionId || '');
      setFormData({ name: '', order: 0, subjectId: filterSubjectId || '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
    setModalClassId('');
    setModalVersionId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectId) {
      toast.error('ক্লাস, ভার্সন ও বিষয় নির্বাচন করুন');
      return;
    }
    try {
      const body = { name: formData.name, order: Number(formData.order) || 0, subjectId: formData.subjectId };
      if (editItem) {
        await dispatch(updateChapter({ id: editItem._id, body })).unwrap();
        toast.success('অধ্যায় আপডেট হয়েছে');
      } else {
        await dispatch(createChapter(body)).unwrap();
        toast.success('অধ্যায় তৈরি হয়েছে');
      }
      dispatch(fetchChapters(filterSubjectId ? { subjectId: filterSubjectId } : {}));
      closeModal();
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleChapterActive(id)).unwrap();
      dispatch(fetchChapters(filterSubjectId ? { subjectId: filterSubjectId } : {}));
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;
    try {
      await dispatch(deleteChapter(id)).unwrap();
      dispatch(fetchChapters(filterSubjectId ? { subjectId: filterSubjectId } : {}));
      toast.success('মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err || 'মুছে ফেলা যায়নি');
    }
  };

  // ── Helper: get context label for a chapter ──
  const getChapterContext = (ch) => {
    const sub = subjects.find((s) => s._id === (ch.subjectId?._id || ch.subjectId));
    if (!sub) return '';
    const ver = versions.find((v) => v._id === (sub.versionId?._id || sub.versionId));
    if (!ver) return sub.name || '';
    const cls = classes.find((c) => c._id === (ver.classId?._id || ver.classId));
    return `${cls?.name || ''} → ${ver.name || ''} → ${sub.name || ''}`;
  };

  const hasActiveFilter = filterClassId || filterVersionId || filterSubjectId;
  const selectClass = 'w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';
  const disabledClass = 'bg-neutral-50 text-neutral-400 cursor-not-allowed';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">অধ্যায় ব্যবস্থাপনা</h1>
          <p className="text-sm text-neutral-500 mt-1">ক্লাস → ভার্সন → বিষয় অনুযায়ী অধ্যায় তৈরি ও পরিচালনা</p>
        </div>
        <Button onClick={() => openModal()} size="sm">
          <HiOutlinePlus className="h-4 w-4" />
          নতুন অধ্যায়
        </Button>
      </div>

      {/* ── Cascade Filters: Class → Version → Subject ── */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
            <HiOutlineFilter className="h-4 w-4" />
            ফিল্টার করুন
          </div>
          {hasActiveFilter && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-500 transition-colors">
              <HiOutlineX className="h-3.5 w-3.5" />
              রিসেট
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">ক্লাস</label>
            <select value={filterClassId} onChange={(e) => handleFilterClassChange(e.target.value)} className={selectClass}>
              <option value="">সব ক্লাস</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">ভার্সন</label>
            <select value={filterVersionId} onChange={(e) => handleFilterVersionChange(e.target.value)}
              className={`${selectClass} ${!filterClassId ? disabledClass : ''}`} disabled={!filterClassId}>
              <option value="">সব ভার্সন</option>
              {filterVersionsList.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">বিষয়</label>
            <select value={filterSubjectId} onChange={(e) => setFilterSubjectId(e.target.value)}
              className={`${selectClass} ${!filterVersionId ? disabledClass : ''}`} disabled={!filterVersionId}>
              <option value="">সব বিষয়</option>
              {filterSubjectsList.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Chapters List ── */}
      {chapters.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          {hasActiveFilter
            ? 'এই ফিল্টারে কোনো অধ্যায় পাওয়া যায়নি।'
            : 'কোনো অধ্যায় নেই। উপরে ফিল্টার করুন অথবা নতুন অধ্যায় তৈরি করুন।'}
        </div>
      )}

      <div className="space-y-3">
        {chapters.map((ch, i) => (
          <motion.div
            key={ch._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-sm transition-all ${!ch.isActive ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  ch.isActive ? 'bg-amber-50 text-amber-600' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {ch.order || i + 1}
                </div>
                <div>
                  <p className="font-semibold text-neutral-800 text-sm">{ch.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{getChapterContext(ch)}</p>
                  {!ch.isActive && <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full">নিষ্ক্রিয়</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => openModal(ch)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                  <HiOutlinePencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleToggle(ch._id)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                  {ch.isActive ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                </button>
                <button onClick={() => handleDelete(ch._id, ch.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500">
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Create / Edit Modal with Class → Version → Subject Cascade ── */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'অধ্যায় সম্পাদনা' : 'নতুন অধ্যায়'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Select Class */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">ক্লাস *</label>
            <select value={modalClassId} onChange={(e) => handleModalClassChange(e.target.value)}
              className={`${selectClass}`} required>
              <option value="">ক্লাস নির্বাচন করুন</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {/* Step 2: Select Version */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">ভার্সন *</label>
            <select value={modalVersionId} onChange={(e) => handleModalVersionChange(e.target.value)}
              className={`${selectClass} ${!modalClassId ? disabledClass : ''}`} disabled={!modalClassId} required>
              <option value="">{modalClassId ? 'ভার্সন নির্বাচন করুন' : 'আগে ক্লাস নির্বাচন করুন'}</option>
              {modalVersionsList.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>

          {/* Step 3: Select Subject */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">বিষয় *</label>
            <select value={formData.subjectId || ''} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className={`${selectClass} ${!modalVersionId ? disabledClass : ''}`} disabled={!modalVersionId} required>
              <option value="">{modalVersionId ? 'বিষয় নির্বাচন করুন' : 'আগে ভার্সন নির্বাচন করুন'}</option>
              {modalSubjectsList.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            {modalVersionId && modalSubjectsList.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">এই ভার্সনে কোনো বিষয় নেই। আগে বিষয় পেজ থেকে বিষয় তৈরি করুন।</p>
            )}
          </div>

          {/* Step 4: Chapter Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">অধ্যায়ের নাম *</label>
            <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={selectClass} placeholder="যেমন: সংখ্যা ও গণনা" required />
          </div>

          {/* Step 5: Order */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">ক্রম</label>
            <input type="number" value={formData.order ?? 0} onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              className={selectClass} min="0" />
          </div>

          {/* Context preview */}
          {modalClassId && modalVersionId && formData.subjectId && formData.name && (
            <div className="bg-primary-50 rounded-lg p-3 text-sm text-primary-700">
              <span className="font-medium">প্রিভিউ:</span>{' '}
              {classes.find((c) => c._id === modalClassId)?.name} → {modalVersionsList.find((v) => v._id === modalVersionId)?.name} → {modalSubjectsList.find((s) => s._id === formData.subjectId)?.name} → {formData.name}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">বাতিল</Button>
            <Button type="submit" className="flex-1">{editItem ? 'আপডেট করুন' : 'তৈরি করুন'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
