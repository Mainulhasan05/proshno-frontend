'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchAvailablePackages, createPurchase } from '@/store/slices/teacherSlice';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  HiOutlineCube,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineTag,
  HiOutlineShoppingCart,
} from 'react-icons/hi';

export default function TeacherPackagesPage() {
  const dispatch = useDispatch();
  const { packages, isLoading } = useSelector((state) => state.teacher);
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchAvailablePackages());
  }, [dispatch]);

  // Auto-open checkout modal if packageId is passed via redirect
  useEffect(() => {
    if (typeof window !== 'undefined' && packages.length > 0 && !purchaseModal) {
      const params = new URLSearchParams(window.location.search);
      const pkgId = params.get('packageId');
      if (pkgId) {
        const targetPkg = packages.find(p => p._id === pkgId);
        if (targetPkg && !targetPkg.isPurchased && !targetPkg.isPending) {
          setPurchaseModal(targetPkg);
        }
      }
    }
  }, [packages, purchaseModal]);

  const handlePurchase = async (paymentMethod = 'manual') => {
    if (!purchaseModal) return;
    setPurchasing(true);
    try {
      await dispatch(createPurchase({ packageId: purchaseModal._id, paymentMethod })).unwrap();
      setSuccessMsg('ক্রয় অনুরোধ সফল! অ্যাডমিন যাচাই করলে অ্যাক্সেস পাবেন।');
      setPurchaseModal(null);
      dispatch(fetchAvailablePackages());
    } catch (err) {
      alert(err || 'ক্রয় ব্যর্থ হয়েছে');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">প্যাকেজ ব্রাউজ</h1>
        <p className="text-sm text-neutral-500 mt-1">আপনার প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন</p>
      </div>

      {/* Success message */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2"
        >
          <HiOutlineCheck className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-emerald-500 hover:text-emerald-700">✕</button>
        </motion.div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <HiOutlineCube className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">কোনো প্যাকেজ পাওয়া যায়নি</p>
          <p className="text-sm mt-1">অ্যাডমিন প্যাকেজ তৈরি করলে এখানে দেখাবে</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Header gradient */}
              <div className="h-2 bg-gradient-to-r from-primary-500 to-indigo-500" />

              <div className="p-6">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                  {pkg.isPurchased && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                      <HiOutlineCheck className="h-3.5 w-3.5" /> কেনা হয়েছে
                    </span>
                  )}
                  {pkg.isPending && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                      <HiOutlineClock className="h-3.5 w-3.5" /> অপেক্ষমান
                    </span>
                  )}
                  {pkg.discountPrice != null && pkg.discountPrice < pkg.price && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-medium">
                      <HiOutlineTag className="h-3.5 w-3.5" />
                      {Math.round(((pkg.price - pkg.discountPrice) / pkg.price) * 100)}% ছাড়
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-neutral-800 mb-2">{pkg.name}</h3>
                {pkg.description && (
                  <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{pkg.description}</p>
                )}

                {/* Items */}
                <div className="mb-4 space-y-1.5">
                  {pkg.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-neutral-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                      <span>
                        {item.classId?.name || 'ক্লাস'}
                        {item.versionId?.name ? ` — ${item.versionId.name}` : ''}
                        {item.subjectId?.name ? ` (${item.subjectId.name})` : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex items-end gap-2 mb-4">
                  {pkg.discountPrice != null && pkg.discountPrice < pkg.price ? (
                    <>
                      <span className="text-2xl font-bold text-neutral-800">৳{pkg.discountPrice}</span>
                      <span className="text-sm text-neutral-400 line-through mb-0.5">৳{pkg.price}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-neutral-800">৳{pkg.price}</span>
                  )}
                  {pkg.validityDays && (
                    <span className="text-xs text-neutral-400 mb-1">/ {pkg.validityDays} দিন</span>
                  )}
                </div>

                {/* Action */}
                {pkg.isPurchased ? (
                  <Button variant="secondary" size="md" disabled className="w-full">
                    ইতোমধ্যে কেনা হয়েছে
                  </Button>
                ) : pkg.isPending ? (
                  <Button variant="outline" size="md" disabled className="w-full">
                    অনুমোদনের অপেক্ষায়
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    icon={HiOutlineShoppingCart}
                    className="w-full"
                    onClick={() => setPurchaseModal(pkg)}
                  >
                    প্যাকেজ কিনুন
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Purchase Modal */}
      <Modal
        isOpen={!!purchaseModal}
        onClose={() => setPurchaseModal(null)}
        title="প্যাকেজ কিনুন"
      >
        {purchaseModal && (
          <div>
            <div className="mb-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <h3 className="font-semibold text-neutral-800">{purchaseModal.name}</h3>
              <p className="text-sm text-neutral-500 mt-1">
                মূল্য: <span className="font-bold text-neutral-800">৳{purchaseModal.discountPrice ?? purchaseModal.price}</span>
                {purchaseModal.discountPrice != null && purchaseModal.discountPrice < purchaseModal.price && (
                  <span className="text-xs text-neutral-400 line-through ml-2">৳{purchaseModal.price}</span>
                )}
              </p>
            </div>

            <p className="text-sm text-neutral-600 mb-4">
              পেমেন্ট পদ্ধতি নির্বাচন করুন। পেমেন্ট সম্পন্ন হলে অ্যাডমিন যাচাই করে আপনার অ্যাক্সেস চালু করবেন।
            </p>

            <div className="space-y-2 mb-6">
              {[
                { method: 'bkash', label: 'বিকাশ', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
                { method: 'nagad', label: 'নগদ', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
                { method: 'manual', label: 'ম্যানুয়াল পেমেন্ট', color: 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100' },
              ].map((opt) => (
                <button
                  key={opt.method}
                  onClick={() => handlePurchase(opt.method)}
                  disabled={purchasing}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium text-neutral-700 transition-colors ${opt.color} disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Button variant="ghost" size="sm" onClick={() => setPurchaseModal(null)} className="w-full">
              বাতিল
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
