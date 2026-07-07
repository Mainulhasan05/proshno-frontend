'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchPurchases, updatePurchaseStatus } from '@/store/slices/adminSlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  HiOutlineShoppingCart, HiOutlineCheck, HiOutlineX,
  HiOutlineClock, HiOutlineExclamation,
} from 'react-icons/hi';

const statusConfig = {
  pending: { label: 'অপেক্ষমান', color: 'bg-amber-50 text-amber-600', icon: HiOutlineClock },
  completed: { label: 'সম্পন্ন', color: 'bg-success-50 text-success-600', icon: HiOutlineCheck },
  failed: { label: 'ব্যর্থ', color: 'bg-red-50 text-red-600', icon: HiOutlineX },
  refunded: { label: 'ফেরত', color: 'bg-violet-50 text-violet-600', icon: HiOutlineExclamation },
  expired: { label: 'মেয়াদোত্তীর্ণ', color: 'bg-neutral-100 text-neutral-500', icon: HiOutlineClock },
};

export default function PurchasesPage() {
  const dispatch = useDispatch();
  const { purchases = [], isLoading } = useSelector((state) => state.admin);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchPurchases(params));
  }, [dispatch, statusFilter]);

  const openStatusModal = (purchase) => {
    setSelectedPurchase(purchase);
    setNewStatus('');
    setAdminNote(purchase.adminNote || '');
    setModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) return toast.error('স্ট্যাটাস নির্বাচন করুন');
    try {
      await dispatch(updatePurchaseStatus({
        id: selectedPurchase._id,
        body: { status: newStatus, adminNote },
      })).unwrap();
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
      setModalOpen(false);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      dispatch(fetchPurchases(params));
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatAmount = (n) => `৳${Number(n || 0).toLocaleString('bn-BD')}`;

  const getAvailableTransitions = (status) => {
    const transitions = {
      pending: ['completed', 'failed'],
      completed: ['refunded'],
      failed: ['pending'],
      refunded: [],
      expired: [],
    };
    return transitions[status] || [];
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">ক্রয় ব্যবস্থাপনা</h1>
          <p className="text-sm text-neutral-500 mt-1">শিক্ষকদের ক্রয় তালিকা ও অনুমোদন</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !statusFilter ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          সকল
        </button>
        {Object.entries(statusConfig).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === key ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Purchases List */}
      {purchases.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          কোনো ক্রয় পাওয়া যায়নি
        </div>
      )}

      <div className="space-y-3">
        {purchases.map((purchase, i) => {
          const sc = statusConfig[purchase.status] || statusConfig.pending;
          const StatusIcon = sc.icon;
          const transitions = getAvailableTransitions(purchase.status);

          return (
            <motion.div
              key={purchase._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${sc.color}`}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-neutral-800 text-sm">
                        {purchase.teacherId?.name || 'শিক্ষক'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {purchase.teacherId?.email || ''} • {purchase.packageId?.name || 'প্যাকেজ'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-neutral-400">
                      <span>মূল্য: {formatAmount(purchase.finalAmount)}</span>
                      <span>পদ্ধতি: {purchase.paymentMethod || '—'}</span>
                      <span>তারিখ: {formatDate(purchase.createdAt)}</span>
                    </div>
                    {purchase.adminNote && (
                      <p className="text-xs text-neutral-500 mt-1.5 italic bg-neutral-50 px-2 py-1 rounded">
                        নোট: {purchase.adminNote}
                      </p>
                    )}
                  </div>
                </div>

                {transitions.length > 0 && (
                  <Button size="sm" variant="outline" onClick={() => openStatusModal(purchase)} className="shrink-0">
                    স্ট্যাটাস পরিবর্তন
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Status Update Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="ক্রয় স্ট্যাটাস পরিবর্তন">
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          {selectedPurchase && (
            <div className="bg-neutral-50 rounded-lg p-3 text-sm">
              <p className="text-neutral-700 font-medium">{selectedPurchase.teacherId?.name}</p>
              <p className="text-neutral-500 text-xs mt-0.5">{selectedPurchase.packageId?.name} — {formatAmount(selectedPurchase.finalAmount)}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">নতুন স্ট্যাটাস *</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm outline-none"
              required
            >
              <option value="">নির্বাচন করুন...</option>
              {selectedPurchase && getAvailableTransitions(selectedPurchase.status).map((s) => (
                <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">অ্যাডমিন নোট</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              rows={2}
              placeholder="নোট (ঐচ্ছিক)..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">বাতিল</Button>
            <Button type="submit" className="flex-1">আপডেট করুন</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
