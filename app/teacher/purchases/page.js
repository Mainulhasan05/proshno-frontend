'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchMyPurchases } from '@/store/slices/teacherSlice';
import Skeleton from '@/components/ui/Skeleton';
import { HiOutlineShoppingCart } from 'react-icons/hi';

const statusConfig = {
  pending: { label: 'অপেক্ষমান', bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  completed: { label: 'সম্পন্ন', bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  failed: { label: 'ব্যর্থ', bg: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  refunded: { label: 'ফেরত', bg: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' },
  expired: { label: 'মেয়াদোত্তীর্ণ', bg: 'bg-neutral-100 text-neutral-500', dot: 'bg-neutral-400' },
};

const paymentLabels = {
  bkash: 'বিকাশ',
  nagad: 'নগদ',
  manual: 'ম্যানুয়াল',
  free: 'বিনামূল্যে',
};

export default function TeacherPurchasesPage() {
  const dispatch = useDispatch();
  const { purchases, isLoading } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(fetchMyPurchases());
  }, [dispatch]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">আমার ক্রয়</h1>
        <p className="text-sm text-neutral-500 mt-1">আপনার সকল ক্রয়ের ইতিহাস</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </div>
      ) : purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <HiOutlineShoppingCart className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">কোনো ক্রয় নেই</p>
          <p className="text-sm mt-1">প্যাকেজ কিনলে এখানে দেখাবে</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase">
            <div className="col-span-4">প্যাকেজ</div>
            <div className="col-span-2">মূল্য</div>
            <div className="col-span-2">পেমেন্ট</div>
            <div className="col-span-2">তারিখ</div>
            <div className="col-span-2">অবস্থা</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-neutral-100">
            {purchases.map((purchase, index) => {
              const sc = statusConfig[purchase.status] || statusConfig.pending;
              return (
                <motion.div
                  key={purchase._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-neutral-800">
                      {purchase.packageId?.name || 'প্যাকেজ'}
                    </p>
                    {purchase.expiresAt && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        মেয়াদ: {new Date(purchase.expiresAt).toLocaleDateString('bn-BD')}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">৳{purchase.finalAmount}</p>
                      {purchase.discountAmount > 0 && (
                        <p className="text-xs text-neutral-400 line-through">৳{purchase.amount}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-neutral-600">
                      {paymentLabels[purchase.paymentMethod] || purchase.paymentMethod}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-neutral-500">
                      {new Date(purchase.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
