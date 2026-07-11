'use client';

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchSubjects, createSubject, updateSubject, toggleSubjectActive, deleteSubject,
  fetchClasses, fetchVersions,
} from '@/store/slices/hierarchySlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineChevronRight,
  HiOutlineBookOpen, HiOutlineFilter, HiOutlineX,
} from 'react-icons/hi';

export default function SubjectsPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const urlClassId = searchParams.get('classId');
  const urlVersionId = searchParams.get('versionId');

  const { subjects = [], classes = [], versions = [], isLoading = false } = useSelector((state) => state.hierarchy || {});

  // ── Page-level cascade filters ──
  const [filterClassId, setFilterClassId] = useState(urlClassId || '');
  const [filterVersionId, setFilterVersionId] = useState(urlVersionId || '');

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', versionId: '' });
  const [modalClassId, setModalClassId] = useState('');

  // ── Load all classes and versions on mount ──
  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchVersions({ limit: 200 }));
  }, [dispatch]);

  // ── Derive filtered versions from the full list (no extra API calls) ──
  const filterVersionsList = useMemo(() => {
    if (!filterClassId) return [];
    return versions.filter((v) => (v.classId?._id || v.classId) === filterClassId);
  }, [versions, filterClassId]);

  const modalVersionsList = useMemo(() => {
    if (!modalClassId) return [];
    return versions.filter((v) => (v.classId?._id || v.classId) === modalClassId);
  }, [versions, modalClassId]);

  // ── Fetch subjects based on current filters ──
  useEffect(() => {
    const params = {};
    if (filterVersionId) params.versionId = filterVersionId;
    else if (filterClassId) params.classId = filterClassId;
    dispatch(fetchSubjects(params));
  }, [dispatch, filterClassId, filterVersionId]);

  // ── Reset version filter when class changes ──
  const handleFilterClassChange = (classId) => {
    setFilterClassId(classId);
    setFilterVersionId('');
  };

  const resetFilters = () => {
    setFilterClassId('');
    setFilterVersionId('');
  };

  // ── Modal helpers ──
  const handleModalClassChange = (classId) => {
    setModalClassId(classId);
    setFormData((prev) => ({ ...prev, versionId: '' }));
  };

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      const itemVersionId = item.versionId?._id || item.versionId || '';
      const itemVersion = versions.find((v) => v._id === itemVersionId);
      const itemClassId = itemVersion ? (itemVersion.classId?._id || itemVersion.classId) : '';

      setModalClassId(itemClassId);
      setFormData({
        name: item.name,
        code: item.code || '',
        versionId: itemVersionId,
      });
    } else {
      setModalClassId(filterClassId || '');
      setFormData({ name: '', code: '', versionId: filterVersionId || '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
    setModalClassId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.versionId) {
      toast.error('ক্লাস ও ভার্সন নির্বাচন করুন');
      return;
    }
    try {
      const body = { name: formData.name, code: formData.code, versionId: formData.versionId };
      if (editItem) {
        await dispatch(updateSubject({ id: editItem._id, body })).unwrap();
        toast.success('বিষয় আপডেট হয়েছে');
      } else {
        await dispatch(createSubject(body)).unwrap();
        toast.success('বিষয় তৈরি হয়েছে');
      }
      const params = {};
      if (filterVersionId) params.versionId = filterVersionId;
      else if (filterClassId) params.classId = filterClassId;
      dispatch(fetchSubjects(params));
      closeModal();
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleSubjectActive(id)).unwrap();
      const params = {};
      if (filterVersionId) params.versionId = filterVersionId;
      else if (filterClassId) params.classId = filterClassId;
      dispatch(fetchSubjects(params));
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;
    try {
      await dispatch(deleteSubject(id)).unwrap();
      const params = {};
      if (filterVersionId) params.versionId = filterVersionId;
      else if (filterClassId) params.classId = filterClassId;
      dispatch(fetchSubjects(params));
      toast.success('মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err || 'মুছে ফেলা যায়নি');
    }
  };

  // ── Helper: get class/version label for a subject ──
  const getSubjectContext = (sub) => {
    const ver = versions.find((v) => v._id === (sub.versionId?._id || sub.versionId));
    if (!ver) return '';
    const cls = classes.find((c) => c._id === (ver.classId?._id || ver.classId));
    return `${cls?.name || ''} — ${ver.name || ''}`;
  };

  const hasActiveFilter = filterClassId || filterVersionId;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">বিষয় ব্যবস্থাপনা</h1>
          <p className="text-sm text-neutral-500 mt-1">ক্লাস ও ভার্সন অনুযায়ী বিষয় তৈরি ও পরিচালনা</p>
        </div>
        <Button onClick={() => openModal()} size="sm">
          <HiOutlinePlus className="h-4 w-4" />
          নতুন বিষয়
        </Button>
      </div>

      {/* ── Cascade Filters: Class → Version ── */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">ক্লাস নির্বাচন করুন</label>
            <select
              value={filterClassId}
              onChange={(e) => handleFilterClassChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">সব ক্লাস</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">ভার্সন নির্বাচন করুন</label>
            <select
              value={filterVersionId}
              onChange={(e) => setFilterVersionId(e.target.value)}
              className={`w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${!filterClassId ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed' : ''}`}
              disabled={!filterClassId}
            >
              <option value="">সব ভার্সন</option>
              {filterVersionsList.map((v) => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Subjects Grid ── */}
      {subjects.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          {hasActiveFilter ? 'এই ফিল্টারে কোনো বিষয় পাওয়া যায়নি।' : 'কোনো বিষয় নেই। উপরে ক্লাস ও ভার্সন ফিল্টার করুন অথবা নতুন বিষয় তৈরি করুন।'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub, i) => (
          <motion.div
            key={sub._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-all ${!sub.isActive ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${sub.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}>
                <HiOutlineBookOpen className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/admin/chapters?subjectId=${sub._id}`} className="p-1.5 rounded-lg hover:bg-neutral-100 text-primary-500" title="অধ্যায় দেখুন">
                  <HiOutlineChevronRight className="h-4 w-4" />
                </Link>
                <button onClick={() => openModal(sub)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                  <HiOutlinePencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleToggle(sub._id)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                  {sub.isActive ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                </button>
                <button onClick={() => handleDelete(sub._id, sub.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500">
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-neutral-800 text-sm">{sub.name}</h3>
            {/* Show class/version context */}
            <p className="text-xs text-neutral-400 mt-1">{getSubjectContext(sub)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              {sub.code && <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">{sub.code}</span>}
              {!sub.isActive && <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full">নিষ্ক্রিয়</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Create / Edit Modal with Class → Version Cascade ── */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'বিষয় সম্পাদনা' : 'নতুন বিষয়'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Select Class */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">ক্লাস *</label>
            <select
              value={modalClassId}
              onChange={(e) => handleModalClassChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            >
              <option value="">ক্লাস নির্বাচন করুন</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Version (depends on Class) */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">ভার্সন *</label>
            <select
              value={formData.versionId || ''}
              onChange={(e) => setFormData({ ...formData, versionId: e.target.value })}
              className={`w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${!modalClassId ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed' : ''}`}
              disabled={!modalClassId}
              required
            >
              <option value="">{modalClassId ? 'ভার্সন নির্বাচন করুন' : 'আগে ক্লাস নির্বাচন করুন'}</option>
              {modalVersionsList.map((v) => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
            {modalClassId && modalVersionsList.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">এই ক্লাসে কোনো ভার্সন নেই। আগে ক্লাস ও ভার্সন পেজ থেকে ভার্সন তৈরি করুন।</p>
            )}
          </div>

          {/* Step 3: Subject Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">বিষয়ের নাম *</label>
            <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="যেমন: গণিত" required />
          </div>

          {/* Optional: Subject Code */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">কোড (ঐচ্ছিক)</label>
            <input type="text" value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="যেমন: MATH" />
          </div>

          {/* Context preview */}
          {modalClassId && formData.versionId && formData.name && (
            <div className="bg-primary-50 rounded-lg p-3 text-sm text-primary-700">
              <span className="font-medium">প্রিভিউ:</span>{' '}
              {classes.find((c) => c._id === modalClassId)?.name} → {modalVersionsList.find((v) => v._id === formData.versionId)?.name} → {formData.name}
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
