'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchPackages, createPackage, updatePackage, togglePackageActive, deletePackage,
} from '@/store/slices/adminSlice';
import { fetchClasses, fetchVersions, fetchSubjects } from '@/store/slices/hierarchySlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineCube,
  HiOutlineCurrencyBangladeshi,
} from 'react-icons/hi';

export default function PackagesPage() {
  const dispatch = useDispatch();
  const { packages = [], pagination = {}, isLoading } = useSelector((state) => state.admin);
  const { classes = [], versions = [], subjects = [] } = useSelector((state) => state.hierarchy || {});

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', discountPrice: '', validityDays: '', items: [],
  });
  const [newItem, setNewItem] = useState({ itemType: 'class', classId: '', versionId: '', subjectId: '' });

  useEffect(() => {
    dispatch(fetchPackages({ page }));
    dispatch(fetchClasses());
  }, [dispatch, page]);

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        discountPrice: item.discountPrice || '',
        validityDays: item.validityDays || '',
        items: item.items || [],
      });
    } else {
      setFormData({ name: '', description: '', price: '', discountPrice: '', validityDays: '', items: [] });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleClassChange = (classId) => {
    setNewItem({ ...newItem, classId, versionId: '', subjectId: '' });
    if (classId) dispatch(fetchVersions({ classId }));
  };

  const handleVersionChange = (versionId) => {
    setNewItem({ ...newItem, versionId, subjectId: '' });
    if (versionId) dispatch(fetchSubjects({ versionId }));
  };

  const addItem = () => {
    if (!newItem.classId) return toast.error('ক্লাস নির্বাচন করুন');
    setFormData({ ...formData, items: [...formData.items, { ...newItem }] });
    setNewItem({ itemType: 'class', classId: '', versionId: '', subjectId: '' });
  };

  const removeItem = (idx) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        validityDays: formData.validityDays ? Number(formData.validityDays) : null,
        items: formData.items,
      };
      if (editItem) {
        await dispatch(updatePackage({ id: editItem._id, body })).unwrap();
        toast.success('প্যাকেজ আপডেট হয়েছে');
      } else {
        await dispatch(createPackage(body)).unwrap();
        toast.success('প্যাকেজ তৈরি হয়েছে');
      }
      dispatch(fetchPackages());
      closeModal();
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(togglePackageActive(id)).unwrap();
      dispatch(fetchPackages());
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
    } catch (err) { toast.error(err || 'ত্রুটি'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;
    try {
      await dispatch(deletePackage(id)).unwrap();
      dispatch(fetchPackages());
      toast.success('মুছে ফেলা হয়েছে');
    } catch (err) { toast.error(err || 'মুছে ফেলা যায়নি'); }
  };

  const getItemLabel = (item) => {
    const classObj = typeof item.classId === 'object' ? item.classId : classes.find((c) => c._id === item.classId);
    const versionObj = typeof item.versionId === 'object' ? item.versionId : versions.find((v) => v._id === item.versionId);
    const subjectObj = typeof item.subjectId === 'object' ? item.subjectId : subjects.find((s) => s._id === item.subjectId);

    const cls = classObj?.name || item.classId || '';
    const ver = versionObj?.name || '';
    const sub = subjectObj?.name || '';

    if (item.itemType === 'subject' && sub) return `${sub} (${cls})`;
    return `${cls}${ver ? ` — ${ver}` : ''}`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">প্যাকেজ ব্যবস্থাপনা</h1>
          <p className="text-sm text-neutral-500 mt-1">প্যাকেজ তৈরি ও পরিচালনা করুন</p>
        </div>
        <Button onClick={() => openModal()} size="sm">
          <HiOutlinePlus className="h-4 w-4" />
          নতুন প্যাকেজ
        </Button>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          কোনো প্যাকেজ নেই। &quot;নতুন প্যাকেজ&quot; বাটনে ক্লিক করুন।
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg, i) => (
          <motion.div
            key={pkg._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow ${!pkg.isActive ? 'opacity-60' : ''}`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <HiOutlineCube className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  {!pkg.isActive && (
                    <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">নিষ্ক্রিয়</span>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-neutral-800 text-base mb-1 line-clamp-1">{pkg.name}</h3>
              {pkg.description && (
                <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{pkg.description}</p>
              )}

              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineCurrencyBangladeshi className="h-4 w-4 text-neutral-400" />
                <span className="text-lg font-bold text-primary-600">৳{pkg.discountPrice || pkg.price}</span>
                {pkg.discountPrice && pkg.discountPrice < pkg.price && (
                  <span className="text-sm text-neutral-400 line-through">৳{pkg.price}</span>
                )}
              </div>

              {/* Validity */}
              <p className="text-xs text-neutral-500 mb-3">
                মেয়াদ: {pkg.validityDays ? `${pkg.validityDays} দিন` : 'আজীবন'}
              </p>

              {/* Items */}
              {pkg.items && pkg.items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {pkg.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                      {getItemLabel(item)}
                    </span>
                  ))}
                  {pkg.items.length > 3 && (
                    <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                      +{pkg.items.length - 3} আরো
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-neutral-100 px-5 py-3 flex items-center justify-end gap-1.5">
              <button onClick={() => openModal(pkg)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                <HiOutlinePencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleToggle(pkg._id)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                {pkg.isActive ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
              </button>
              <button onClick={() => handleDelete(pkg._id, pkg.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500">
                <HiOutlineTrash className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Pagination
        meta={pagination.packages}
        disabled={isLoading}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'প্যাকেজ সম্পাদনা' : 'নতুন প্যাকেজ'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">নাম *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="যেমন: নবম শ্রেণি সম্পূর্ণ" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">বিবরণ</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              rows={2} placeholder="প্যাকেজের বিবরণ..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">মূল্য (৳) *</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">ছাড়ের মূল্য (৳)</label>
              <input type="number" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                min="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">মেয়াদ (দিন)</label>
            <input type="number" value={formData.validityDays} onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              min="1" placeholder="খালি রাখলে আজীবন" />
          </div>

          {/* Package Items */}
          <div className="border border-neutral-200 rounded-lg p-3">
            <label className="block text-sm font-medium text-neutral-700 mb-2">প্যাকেজ আইটেম</label>
            {formData.items.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2 text-sm">
                    <span className="text-neutral-700">
                      <span className="text-xs font-medium text-primary-600 mr-1.5">{item.itemType === 'class' ? 'ক্লাস' : 'বিষয়'}</span>
                      {getItemLabel(item)}
                    </span>
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                      <HiOutlineTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <select value={newItem.itemType} onChange={(e) => setNewItem({ ...newItem, itemType: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none">
                <option value="class">ক্লাস</option>
                <option value="subject">বিষয়</option>
              </select>
              <select value={newItem.classId} onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none">
                <option value="">ক্লাস নির্বাচন...</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {newItem.classId && (
                <select value={newItem.versionId} onChange={(e) => handleVersionChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none">
                  <option value="">ভার্সন নির্বাচন (ঐচ্ছিক)...</option>
                  {versions.filter((v) => (v.classId?._id || v.classId) === newItem.classId).map((v) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              )}
              {newItem.itemType === 'subject' && newItem.versionId && (
                <select value={newItem.subjectId} onChange={(e) => setNewItem({ ...newItem, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none">
                  <option value="">বিষয় নির্বাচন...</option>
                  {subjects.filter((s) => (s.versionId?._id || s.versionId) === newItem.versionId).map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              )}
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
                <HiOutlinePlus className="h-3.5 w-3.5" />
                আইটেম যোগ করুন
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">বাতিল</Button>
            <Button type="submit" className="flex-1">{editItem ? 'আপডেট করুন' : 'তৈরি করুন'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
