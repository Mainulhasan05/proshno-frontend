'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchChapters, createChapter, updateChapter, toggleChapterActive, deleteChapter,
  fetchSubjects,
} from '@/store/slices/hierarchySlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineClipboardList,
  HiOutlineArrowLeft,
} from 'react-icons/hi';

export default function ChaptersPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');

  const { chapters = [], subjects = [], isLoading = false } = useSelector((state) => state.hierarchy || {});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  const currentSubject = subjects.find((s) => s._id === subjectId);

  useEffect(() => {
    dispatch(fetchSubjects({}));
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (subjectId) params.subjectId = subjectId;
    dispatch(fetchChapters(params));
  }, [dispatch, subjectId]);

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      setFormData({ name: item.name, nameEn: item.nameEn || '', order: item.order || 0, subjectId: item.subjectId?._id || item.subjectId || subjectId || '' });
    } else {
      setFormData({ name: '', nameEn: '', order: 0, subjectId: subjectId || '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { name: formData.name, nameEn: formData.nameEn, order: Number(formData.order) || 0, subjectId: formData.subjectId };
      if (editItem) {
        await dispatch(updateChapter({ id: editItem._id, body })).unwrap();
        toast.success('অধ্যায় আপডেট হয়েছে');
      } else {
        await dispatch(createChapter(body)).unwrap();
        toast.success('অধ্যায় তৈরি হয়েছে');
      }
      dispatch(fetchChapters(subjectId ? { subjectId } : {}));
      closeModal();
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleChapterActive(id)).unwrap();
      dispatch(fetchChapters(subjectId ? { subjectId } : {}));
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;
    try {
      await dispatch(deleteChapter(id)).unwrap();
      dispatch(fetchChapters(subjectId ? { subjectId } : {}));
      toast.success('মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err || 'মুছে ফেলা যায়নি');
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
        <Link href="/admin/classes" className="hover:text-primary-600 flex items-center gap-1">
          <HiOutlineArrowLeft className="h-4 w-4" />
          ক্লাস
        </Link>
        <span>/</span>
        <Link href={`/admin/subjects${currentSubject ? `?versionId=${currentSubject.versionId?._id || currentSubject.versionId}` : ''}`} className="hover:text-primary-600">
          বিষয়
        </Link>
        {currentSubject && <><span>/</span><span className="text-neutral-800 font-medium">{currentSubject.name}</span></>}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">অধ্যায়</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {currentSubject ? currentSubject.name : 'সব অধ্যায়'}
          </p>
        </div>
        <Button onClick={() => openModal()} size="sm">
          <HiOutlinePlus className="h-4 w-4" />
          নতুন অধ্যায়
        </Button>
      </div>

      {/* Chapters List */}
      {chapters.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          কোনো অধ্যায় নেই।
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
                  <div className="flex items-center gap-2 mt-0.5">
                    {ch.nameEn && <span className="text-xs text-neutral-400">{ch.nameEn}</span>}
                    {!ch.isActive && <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full">নিষ্ক্রিয়</span>}
                  </div>
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

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'অধ্যায় সম্পাদনা' : 'নতুন অধ্যায়'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">নাম (বাংলা) *</label>
            <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="যেমন: সংখ্যা ও গণনা" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">নাম (ইংরেজি)</label>
            <input type="text" value={formData.nameEn || ''} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="e.g., Numbers and Counting" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">ক্রম</label>
            <input type="number" value={formData.order ?? 0} onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              min="0" />
          </div>
          {!subjectId && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">বিষয় *</label>
              <select value={formData.subjectId || ''} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" required>
                <option value="">বিষয় বাছুন</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
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
