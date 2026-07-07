'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchOMRTemplates, createOMRTemplate, updateOMRTemplate,
  toggleOMRTemplateActive, deleteOMRTemplate,
} from '@/store/slices/adminSlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineDocumentText,
  HiOutlineTemplate,
} from 'react-icons/hi';

export default function OMRTemplatesPage() {
  const dispatch = useDispatch();
  const { omrTemplates = [], isLoading } = useSelector((state) => state.admin);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '',
    layout: { columns: 2, questionsPerColumn: 25, optionsPerQuestion: 4, bubbleShape: 'circle' },
    showLogo: true, showInstitutionName: true, pageSize: 'A4',
  });

  useEffect(() => {
    dispatch(fetchOMRTemplates());
  }, [dispatch]);

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        layout: item.layout || { columns: 2, questionsPerColumn: 25, optionsPerQuestion: 4, bubbleShape: 'circle' },
        showLogo: item.showLogo !== false,
        showInstitutionName: item.showInstitutionName !== false,
        pageSize: item.pageSize || 'A4',
      });
    } else {
      setFormData({
        name: '', description: '',
        layout: { columns: 2, questionsPerColumn: 25, optionsPerQuestion: 4, bubbleShape: 'circle' },
        showLogo: true, showInstitutionName: true, pageSize: 'A4',
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await dispatch(updateOMRTemplate({ id: editItem._id, body: formData })).unwrap();
        toast.success('OMR টেমপ্লেট আপডেট হয়েছে');
      } else {
        await dispatch(createOMRTemplate(formData)).unwrap();
        toast.success('OMR টেমপ্লেট তৈরি হয়েছে');
      }
      dispatch(fetchOMRTemplates());
      closeModal();
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleOMRTemplateActive(id)).unwrap();
      dispatch(fetchOMRTemplates());
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
    } catch (err) { toast.error(err || 'ত্রুটি'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;
    try {
      await dispatch(deleteOMRTemplate(id)).unwrap();
      dispatch(fetchOMRTemplates());
      toast.success('মুছে ফেলা হয়েছে');
    } catch (err) { toast.error(err || 'মুছে ফেলা যায়নি'); }
  };

  const totalQuestions = (layout) => (layout?.columns || 2) * (layout?.questionsPerColumn || 25);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">OMR টেমপ্লেট</h1>
          <p className="text-sm text-neutral-500 mt-1">OMR শিটের টেমপ্লেট তৈরি ও পরিচালনা</p>
        </div>
        <Button onClick={() => openModal()} size="sm">
          <HiOutlinePlus className="h-4 w-4" />
          নতুন টেমপ্লেট
        </Button>
      </div>

      {omrTemplates.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          কোনো OMR টেমপ্লেট নেই। &quot;নতুন টেমপ্লেট&quot; বাটনে ক্লিক করুন।
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {omrTemplates.map((tpl, i) => (
          <motion.div
            key={tpl._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow ${!tpl.isActive ? 'opacity-60' : ''}`}
          >
            {/* Preview Area */}
            <div className="p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 border-b border-neutral-200">
              <div className="flex items-center justify-center h-24">
                <div className="flex gap-3">
                  {Array.from({ length: Math.min(tpl.layout?.columns || 2, 3) }).map((_, ci) => (
                    <div key={ci} className="space-y-1">
                      {Array.from({ length: 4 }).map((_, ri) => (
                        <div key={ri} className="flex gap-1">
                          <span className="text-[8px] text-neutral-400 w-3 text-right">{ci * 4 + ri + 1}</span>
                          {Array.from({ length: Math.min(tpl.layout?.optionsPerQuestion || 4, 5) }).map((_, oi) => (
                            <div key={oi} className={`h-3 w-3 border border-neutral-300 ${
                              tpl.layout?.bubbleShape === 'square' ? 'rounded-sm' : 'rounded-full'
                            }`} />
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-neutral-800 text-sm line-clamp-1">{tpl.name}</h3>
                {!tpl.isActive && (
                  <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full shrink-0 ml-2">নিষ্ক্রিয়</span>
                )}
              </div>
              {tpl.description && (
                <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{tpl.description}</p>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-neutral-50 rounded-lg px-2.5 py-1.5 text-center">
                  <p className="text-lg font-bold text-neutral-800">{totalQuestions(tpl.layout)}</p>
                  <p className="text-[10px] text-neutral-500">প্রশ্ন</p>
                </div>
                <div className="bg-neutral-50 rounded-lg px-2.5 py-1.5 text-center">
                  <p className="text-lg font-bold text-neutral-800">{tpl.layout?.optionsPerQuestion || 4}</p>
                  <p className="text-[10px] text-neutral-500">অপশন</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tpl.pageSize || 'A4'}</span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tpl.layout?.columns || 2} কলাম</span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tpl.layout?.bubbleShape === 'square' ? 'বর্গ' : 'বৃত্ত'}</span>
              </div>
            </div>

            <div className="border-t border-neutral-100 px-4 py-3 flex items-center justify-end gap-1.5">
              <button onClick={() => openModal(tpl)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                <HiOutlinePencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleToggle(tpl._id)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                {tpl.isActive ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
              </button>
              <button onClick={() => handleDelete(tpl._id, tpl.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500">
                <HiOutlineTrash className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'টেমপ্লেট সম্পাদনা' : 'নতুন OMR টেমপ্লেট'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">নাম *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="যেমন: ৫০ প্রশ্নের MCQ" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">বিবরণ</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              rows={2} />
          </div>

          <div className="border border-neutral-200 rounded-lg p-3">
            <label className="block text-sm font-medium text-neutral-700 mb-2">লেআউট কনফিগারেশন</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">কলাম সংখ্যা</label>
                <input type="number" value={formData.layout.columns}
                  onChange={(e) => setFormData({ ...formData, layout: { ...formData.layout, columns: Number(e.target.value) } })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none" min="1" max="4" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">প্রতি কলামে প্রশ্ন</label>
                <input type="number" value={formData.layout.questionsPerColumn}
                  onChange={(e) => setFormData({ ...formData, layout: { ...formData.layout, questionsPerColumn: Number(e.target.value) } })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none" min="1" max="100" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">অপশন সংখ্যা</label>
                <input type="number" value={formData.layout.optionsPerQuestion}
                  onChange={(e) => setFormData({ ...formData, layout: { ...formData.layout, optionsPerQuestion: Number(e.target.value) } })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none" min="2" max="6" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">বাবল আকৃতি</label>
                <select value={formData.layout.bubbleShape}
                  onChange={(e) => setFormData({ ...formData, layout: { ...formData.layout, bubbleShape: e.target.value } })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none">
                  <option value="circle">বৃত্ত</option>
                  <option value="square">বর্গ</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">পেজ সাইজ</label>
              <select value={formData.pageSize}
                onChange={(e) => setFormData({ ...formData, pageSize: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none">
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer pt-4">
              <input type="checkbox" checked={formData.showLogo}
                onChange={(e) => setFormData({ ...formData, showLogo: e.target.checked })}
                className="rounded border-neutral-300" />
              লোগো
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer pt-4">
              <input type="checkbox" checked={formData.showInstitutionName}
                onChange={(e) => setFormData({ ...formData, showInstitutionName: e.target.checked })}
                className="rounded border-neutral-300" />
              প্রতিষ্ঠান
            </label>
          </div>

          {/* Summary */}
          <div className="bg-primary-50 rounded-lg p-3 text-sm text-primary-700">
            মোট প্রশ্ন: <strong>{formData.layout.columns * formData.layout.questionsPerColumn}</strong> |
            অপশন: <strong>{formData.layout.optionsPerQuestion}</strong> |
            সাইজ: <strong>{formData.pageSize}</strong>
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
