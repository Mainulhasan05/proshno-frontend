'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchClasses, createClass, updateClass, toggleClassActive, deleteClass,
  fetchVersions, createVersion, updateVersion, toggleVersionActive, deleteVersion,
} from '@/store/slices/hierarchySlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineChevronRight,
  HiOutlineAcademicCap, HiOutlineCollection,
} from 'react-icons/hi';
import Link from 'next/link';

export default function ClassesPage() {
  const dispatch = useDispatch();
  const { classes = [], versions = [], isLoading = false } = useSelector((state) => state.hierarchy || {});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'class' | 'version'
  const [editItem, setEditItem] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);

  // Form states
  const [formData, setFormData] = useState({});

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  // Load versions when a class is expanded
  useEffect(() => {
    if (expandedClass) {
      dispatch(fetchVersions({ classId: expandedClass }));
    }
  }, [expandedClass, dispatch]);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    if (item) {
      setFormData({ name: item.name, nameEn: item.nameEn || '', order: item.order || 0, classId: item.classId?._id || item.classId || '' });
    } else {
      setFormData({ name: '', nameEn: '', order: 0, classId: expandedClass || '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'class') {
        const body = { name: formData.name, nameEn: formData.nameEn, order: Number(formData.order) || 0 };
        if (editItem) {
          await dispatch(updateClass({ id: editItem._id, body })).unwrap();
          toast.success('ক্লাস আপডেট হয়েছে');
        } else {
          await dispatch(createClass(body)).unwrap();
          toast.success('ক্লাস তৈরি হয়েছে');
        }
        dispatch(fetchClasses());
      } else if (modalType === 'version') {
        const body = { name: formData.name, classId: formData.classId || expandedClass };
        if (editItem) {
          await dispatch(updateVersion({ id: editItem._id, body })).unwrap();
          toast.success('ভার্সন আপডেট হয়েছে');
        } else {
          await dispatch(createVersion(body)).unwrap();
          toast.success('ভার্সন তৈরি হয়েছে');
        }
        dispatch(fetchVersions({ classId: expandedClass }));
      }
      closeModal();
    } catch (err) {
      toast.error(err || 'কিছু একটা ত্রুটি হয়েছে');
    }
  };

  const handleToggle = async (type, id) => {
    try {
      if (type === 'class') {
        await dispatch(toggleClassActive(id)).unwrap();
        dispatch(fetchClasses());
        if (expandedClass) dispatch(fetchVersions({ classId: expandedClass }));
      } else {
        await dispatch(toggleVersionActive(id)).unwrap();
        dispatch(fetchVersions({ classId: expandedClass }));
      }
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleDelete = async (type, id, name) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;
    try {
      if (type === 'class') {
        await dispatch(deleteClass(id)).unwrap();
        dispatch(fetchClasses());
        if (expandedClass === id) setExpandedClass(null);
      } else {
        await dispatch(deleteVersion(id)).unwrap();
        dispatch(fetchVersions({ classId: expandedClass }));
      }
      toast.success('মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err || 'মুছে ফেলা যায়নি');
    }
  };

  const classVersions = versions.filter((v) => {
    const cId = v.classId?._id || v.classId;
    return cId === expandedClass;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">ক্লাস ও ভার্সন</h1>
          <p className="text-sm text-neutral-500 mt-1">কন্টেন্ট হায়ারার্কি ব্যবস্থাপনা</p>
        </div>
        <Button onClick={() => openModal('class')} size="sm">
          <HiOutlinePlus className="h-4 w-4" />
          নতুন ক্লাস
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Classes List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">ক্লাস তালিকা</h2>
          {classes.length === 0 && !isLoading && (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-400 text-sm">
              কোনো ক্লাস নেই। উপরে "নতুন ক্লাস" বাটনে ক্লিক করুন।
            </div>
          )}
          {classes.map((cls, i) => (
            <motion.div
              key={cls._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white rounded-xl border transition-all cursor-pointer ${
                expandedClass === cls._id
                  ? 'border-primary-300 ring-2 ring-primary-100'
                  : 'border-neutral-200 hover:border-neutral-300'
              } ${!cls.isActive ? 'opacity-60' : ''}`}
            >
              <div
                className="flex items-center justify-between p-4"
                onClick={() => setExpandedClass(expandedClass === cls._id ? null : cls._id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    cls.isActive ? 'bg-primary-50 text-primary-600' : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    <HiOutlineAcademicCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 text-sm">{cls.name}</p>
                    {cls.nameEn && <p className="text-xs text-neutral-400">{cls.nameEn}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {!cls.isActive && (
                    <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">নিষ্ক্রিয়</span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); openModal('class', cls); }} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                    <HiOutlinePencil className="h-4 w-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleToggle('class', cls._id); }} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                    {cls.isActive ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete('class', cls._id, cls.name); }} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500">
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                  <HiOutlineChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${expandedClass === cls._id ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Versions Panel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
              {expandedClass ? `ভার্সন — ${classes.find((c) => c._id === expandedClass)?.name || ''}` : 'ভার্সন'}
            </h2>
            {expandedClass && (
              <Button size="xs" variant="ghost" onClick={() => openModal('version')}>
                <HiOutlinePlus className="h-3.5 w-3.5" />
                নতুন ভার্সন
              </Button>
            )}
          </div>

          {!expandedClass && (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-400 text-sm">
              বাম দিক থেকে একটি ক্লাস নির্বাচন করুন
            </div>
          )}

          {expandedClass && classVersions.length === 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-400 text-sm">
              এই ক্লাসে কোনো ভার্সন নেই
            </div>
          )}

          <div className="space-y-3">
            {classVersions.map((ver, i) => (
              <motion.div
                key={ver._id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-xl border border-neutral-200 p-4 ${!ver.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      ver.isActive ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      <HiOutlineCollection className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-800 text-sm">{ver.name}</p>
                      {!ver.isActive && <span className="text-xs text-neutral-400">নিষ্ক্রিয়</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/subjects?classId=${expandedClass}&versionId=${ver._id}`} className="p-1.5 rounded-lg hover:bg-neutral-100 text-primary-500 hover:text-primary-600" title="বিষয় দেখুন">
                      <HiOutlineChevronRight className="h-4 w-4" />
                    </Link>
                    <button onClick={() => openModal('version', ver)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                      <HiOutlinePencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleToggle('version', ver._id)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                      {ver.isActive ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleDelete('version', ver._id, ver.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500">
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? `${modalType === 'class' ? 'ক্লাস' : 'ভার্সন'} সম্পাদনা` : `নতুন ${modalType === 'class' ? 'ক্লাস' : 'ভার্সন'}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">নাম (বাংলা) *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder={modalType === 'class' ? 'যেমন: ষষ্ঠ শ্রেণি' : 'যেমন: বাংলা মাধ্যম'}
              required
            />
          </div>

          {modalType === 'class' && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">নাম (ইংরেজি)</label>
                <input
                  type="text"
                  value={formData.nameEn || ''}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g., Class 6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">ক্রম</label>
                <input
                  type="number"
                  value={formData.order ?? 0}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  min="0"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">
              বাতিল
            </Button>
            <Button type="submit" className="flex-1">
              {editItem ? 'আপডেট করুন' : 'তৈরি করুন'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
