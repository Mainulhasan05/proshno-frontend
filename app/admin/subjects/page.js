'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
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
  HiOutlineBookOpen, HiOutlineArrowLeft,
} from 'react-icons/hi';

export default function SubjectsPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const versionId = searchParams.get('versionId');

  const { subjects = [], classes = [], versions = [], isLoading = false } = useSelector((state) => state.hierarchy || {});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchVersions({}));
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (versionId) params.versionId = versionId;
    else if (classId) params.classId = classId;
    dispatch(fetchSubjects(params));
  }, [dispatch, classId, versionId]);

  const currentClass = classes.find((c) => c._id === classId);
  const currentVersion = versions.find((v) => v._id === versionId);

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      setFormData({
        name: item.name,
        code: item.code || '',
        versionId: item.versionId?._id || item.versionId || versionId || '',
      });
    } else {
      setFormData({ name: '', code: '', versionId: versionId || '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      if (versionId) params.versionId = versionId;
      else if (classId) params.classId = classId;
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
      if (versionId) params.versionId = versionId;
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
      if (versionId) params.versionId = versionId;
      dispatch(fetchSubjects(params));
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
        {currentClass && <><span>/</span><span>{currentClass.name}</span></>}
        {currentVersion && <><span>/</span><span className="text-neutral-800 font-medium">{currentVersion.name}</span></>}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">বিষয়</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {currentVersion ? `${currentClass?.name} — ${currentVersion.name}` : 'সব বিষয়'}
          </p>
        </div>
        <Button onClick={() => openModal()} size="sm">
          <HiOutlinePlus className="h-4 w-4" />
          নতুন বিষয়
        </Button>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          কোনো বিষয় নেই।
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
            {sub.code && <span className="inline-block mt-2 text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">{sub.code}</span>}
            {!sub.isActive && <span className="inline-block mt-2 ml-1 text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full">নিষ্ক্রিয়</span>}
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'বিষয় সম্পাদনা' : 'নতুন বিষয়'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">নাম *</label>
            <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="যেমন: গণিত" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">কোড</label>
            <input type="text" value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="e.g., MATH" />
          </div>
          {!versionId && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">ভার্সন *</label>
              <select value={formData.versionId || ''} onChange={(e) => setFormData({ ...formData, versionId: e.target.value })}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" required>
                <option value="">ভার্সন বাছুন</option>
                {versions.map((v) => (
                  <option key={v._id} value={v._id}>{v.classId?.name || ''} — {v.name}</option>
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
