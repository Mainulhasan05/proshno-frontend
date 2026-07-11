'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchPages, createPage, updatePage, togglePagePublish, deletePage,
} from '@/store/slices/adminSlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineGlobe, HiOutlineEyeOff, HiOutlineDocumentText,
  HiOutlineExternalLink, HiOutlineClipboardCopy,
} from 'react-icons/hi';

export default function PagesAdminPage() {
  const dispatch = useDispatch();
  const { pages = [], pagination = {}, isLoading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', content: '', metaDescription: '',
  });

  useEffect(() => {
    dispatch(fetchPages({ page }));
  }, [dispatch, page]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      setFormData({
        title: item.title,
        slug: item.slug,
        content: item.content || '',
        metaDescription: item.metaDescription || '',
      });
    } else {
      setFormData({ title: '', slug: '', content: '', metaDescription: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleTitleChange = (title) => {
    const updates = { ...formData, title };
    if (!editItem) {
      updates.slug = generateSlug(title);
    }
    setFormData(updates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await dispatch(updatePage({ id: editItem._id, body: formData })).unwrap();
        toast.success('পেজ আপডেট হয়েছে');
      } else {
        await dispatch(createPage(formData)).unwrap();
        toast.success('পেজ তৈরি হয়েছে');
      }
      dispatch(fetchPages());
      closeModal();
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await dispatch(togglePagePublish(id)).unwrap();
      dispatch(fetchPages());
      toast.success('পাবলিশ স্ট্যাটাস আপডেট হয়েছে');
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`"${title}" পেজটি মুছে ফেলতে চান?`)) return;
    try {
      await dispatch(deletePage(id)).unwrap();
      dispatch(fetchPages());
      toast.success('পেজ মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err || 'মুছে ফেলা যায়নি');
    }
  };

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/pages/${slug}`);
    toast.success('লিঙ্ক কপি হয়েছে');
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">পেজ ব্যবস্থাপনা</h1>
          <p className="text-sm text-neutral-500 mt-1">প্রাইভেসি পলিসি, শর্তাবলী ইত্যাদি ডায়নামিক পেজ</p>
        </div>
        <Button onClick={() => openModal()} size="sm">
          <HiOutlinePlus className="h-4 w-4" />
          নতুন পেজ
        </Button>
      </div>

      {/* Quick suggestions */}
      {pages.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center mb-6">
          <HiOutlineDocumentText className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm mb-4">কোনো পেজ নেই। নিচের যেকোনো একটি দিয়ে শুরু করুন:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { title: 'প্রাইভেসি পলিসি', slug: 'privacy-policy' },
              { title: 'শর্তাবলী', slug: 'terms-conditions' },
              { title: 'আমাদের সম্পর্কে', slug: 'about-us' },
              { title: 'যোগাযোগ', slug: 'contact' },
              { title: 'ফেরত নীতি', slug: 'refund-policy' },
            ].map((suggestion) => (
              <button
                key={suggestion.slug}
                onClick={() => {
                  setFormData({ title: suggestion.title, slug: suggestion.slug, content: '', metaDescription: '' });
                  setEditItem(null);
                  setModalOpen(true);
                }}
                className="px-3 py-2 bg-primary-50 text-primary-600 text-sm rounded-lg hover:bg-primary-100 transition-colors"
              >
                + {suggestion.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="space-y-3">
        {pages.map((page, i) => (
          <motion.div
            key={page._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                  page.isPublished ? 'bg-success-50 text-success-600' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {page.isPublished ? <HiOutlineGlobe className="h-5 w-5" /> : <HiOutlineEyeOff className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-neutral-800 text-sm">{page.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      page.isPublished ? 'bg-success-50 text-success-600' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {page.isPublished ? 'পাবলিশড' : 'ড্রাফট'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 font-mono">/{page.slug}</p>
                  {page.metaDescription && (
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{page.metaDescription}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    {page.isPublished ? `পাবলিশড: ${formatDate(page.publishedAt)}` : `তৈরি: ${formatDate(page.createdAt)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {page.isPublished && (
                  <>
                    <button
                      onClick={() => copyLink(page.slug)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
                      title="লিঙ্ক কপি"
                    >
                      <HiOutlineClipboardCopy className="h-4 w-4" />
                    </button>
                    <a
                      href={`/pages/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
                      title="প্রিভিউ"
                    >
                      <HiOutlineExternalLink className="h-4 w-4" />
                    </a>
                  </>
                )}
                <button onClick={() => openModal(page)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600" title="সম্পাদনা">
                  <HiOutlinePencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleTogglePublish(page._id)}
                  className={`p-1.5 rounded-lg hover:bg-neutral-100 ${
                    page.isPublished ? 'text-success-500 hover:text-success-600' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                  title={page.isPublished ? 'আনপাবলিশ' : 'পাবলিশ'}
                >
                  {page.isPublished ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineGlobe className="h-4 w-4" />}
                </button>
                <button onClick={() => handleDelete(page._id, page.title)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500" title="মুছুন">
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Pagination
        meta={pagination.pages}
        disabled={isLoading}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'পেজ সম্পাদনা' : 'নতুন পেজ'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">শিরোনাম *</label>
            <input type="text" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="যেমন: প্রাইভেসি পলিসি" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">স্লাগ (URL)</label>
            <div className="flex items-center">
              <span className="text-xs text-neutral-400 mr-1">/pages/</span>
              <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono"
                placeholder="privacy-policy" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">মেটা বিবরণ (SEO)</label>
            <input type="text" value={formData.metaDescription} onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="সার্চ ইঞ্জিনে দেখানো বিবরণ..." maxLength={300} />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">কন্টেন্ট *</label>
            <p className="text-xs text-neutral-400 mb-1.5">HTML সাপোর্টেড। &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt; ইত্যাদি ব্যবহার করতে পারেন।</p>
            <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none font-mono"
              rows={12}
              placeholder="<h2>শিরোনাম</h2>&#10;<p>এখানে আপনার কন্টেন্ট লিখুন...</p>"
              required />
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
