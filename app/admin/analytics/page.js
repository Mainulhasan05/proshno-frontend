'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import apiClient from '@/store/api/apiClient';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import {
  HiOutlineTrendingUp,
  HiOutlineCurrencyBangladeshi,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineDownload,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineCreditCard,
  HiOutlineTag,
  HiOutlineChevronRight,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import {
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineReceiptPercent,
  HiOutlineArrowPath,
  HiOutlineChartBar,
} from 'react-icons/hi2';

const timeframeOptions = [
  { id: 'today', label: 'আজ (Today)' },
  { id: 'yesterday', label: 'গতকাল (Yesterday)' },
  { id: 'this_week', label: 'এই সপ্তাহ (This Week)' },
  { id: 'this_month', label: 'এই মাস (This Month)' },
  { id: 'last_month', label: 'গত মাস (Last Month)' },
  { id: 'this_year', label: 'এই বছর (This Year)' },
  { id: 'all_time', label: 'সর্বমোট (All Time)' },
  { id: 'custom', label: 'কাস্টম তারিখ (Custom Date)' },
];

const paymentMethodLabels = {
  bkash: 'bKash (বিকাশ)',
  nagad: 'Nagad (নগদ)',
  manual: 'Manual Bank/Cash',
  free: 'Free Complimentary',
};

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  failed: 'bg-rose-100 text-rose-800 border-rose-200',
  refunded: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusLabels = {
  pending: 'অপেক্ষমান (Pending)',
  completed: 'সম্পন্ন (Completed)',
  failed: 'ব্যর্থ (Failed)',
  refunded: 'ফেরত (Refunded)',
};

export default function AdminFinancialAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(true);

  // Filter States
  const [timeframe, setTimeframe] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Packages list for filter dropdown
  const [packages, setPackages] = useState([]);

  // Selected Transaction detail modal
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  // Fetch Packages for Filter Dropdown
  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await apiClient.get('/packages');
        setPackages(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load packages filter:', err);
      }
    }
    loadPackages();
  }, []);

  // Fetch Main Financial Analytics Data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('timeframe', timeframe);
      if (timeframe === 'custom') {
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
      }
      if (selectedPaymentMethod) params.append('paymentMethod', selectedPaymentMethod);
      if (selectedPackageId) params.append('packageId', selectedPackageId);

      const res = await apiClient.get(`/purchases/analytics?${params.toString()}`);
      setAnalytics(res.data?.data || res.data);
    } catch (err) {
      toast.error(err?.error?.message || 'ফাইন্যান্সিয়াল অ্যানালিটিক্স লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [timeframe, startDate, endDate, selectedPaymentMethod, selectedPackageId]);

  // Fetch Purchases Log
  const fetchPurchases = useCallback(async () => {
    setPurchasesLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (selectedPaymentMethod) params.append('paymentMethod', selectedPaymentMethod);
      if (selectedPackageId) params.append('packageId', selectedPackageId);
      params.append('limit', '50');

      const res = await apiClient.get(`/purchases?${params.toString()}`);
      setPurchases(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions log:', err);
    } finally {
      setPurchasesLoading(false);
    }
  }, [statusFilter, selectedPaymentMethod, selectedPackageId]);

  useEffect(() => {
    fetchAnalytics();
    fetchPurchases();
  }, [fetchAnalytics, fetchPurchases]);

  // Handle Order Status Update (Approve / Refund / Reject)
  const handleUpdateStatus = async (purchaseId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await apiClient.patch(`/purchases/${purchaseId}/status`, {
        status: newStatus,
        adminNote,
      });
      toast.success(`অর্ডার স্ট্যাটাস "${statusLabels[newStatus] || newStatus}" এ পরিবর্তিত হয়েছে!`);
      setSelectedPurchase(null);
      setAdminNote('');
      fetchAnalytics();
      fetchPurchases();
    } catch (err) {
      toast.error(err?.error?.message || 'অর্ডার আপডেট করতে ব্যর্থ হয়েছে');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Export Financial CSV Report
  const handleExportCSV = () => {
    if (!purchases || purchases.length === 0) {
      toast.error('রপ্তানি করার মতো কোনো লেনদেন ডাটা পাওয়া যায়নি');
      return;
    }

    const headers = ['Order ID', 'Teacher Name', 'Email', 'Phone', 'Package', 'Gross Price (Tk)', 'Discount (Tk)', 'Final Paid (Tk)', 'Payment Method', 'Status', 'Date'];
    const rows = purchases.map((p) => [
      p._id,
      `"${p.teacherId?.name || 'Unknown'}"`,
      p.teacherId?.email || '',
      p.teacherId?.phone || '',
      `"${p.packageId?.name || 'Package'}"`,
      p.amount || 0,
      p.discountAmount || 0,
      p.finalAmount || 0,
      p.paymentMethod || 'manual',
      p.status || 'pending',
      new Date(p.createdAt).toLocaleDateString('bn-BD'),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Proshno_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('আয় প্রতিবেদন (CSV) সফলভাবে ডাউনলোড হয়েছে!');
  };

  const kpis = analytics?.kpis || {};

  // Maximum value for time series chart scale
  const maxTrendRevenue = useMemo(() => {
    if (!analytics?.timeSeries || analytics.timeSeries.length === 0) return 100;
    return Math.max(...analytics.timeSeries.map((t) => t.revenue || 0), 100);
  }, [analytics?.timeSeries]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title & Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <HiOutlineBanknotes className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">উপার্জন ও ফাইন্যান্সিয়াল অ্যানালিটিক্স</h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                প্ল্যাটফর্মের আয়, প্যাকেজ বিক্রি, পেমেন্ট চ্যানেল ও শিক্ষক সাবস্ক্রিপশন ডাটা বিশ্লেষণ
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            className="text-xs py-2 px-3 flex items-center gap-1.5 border-neutral-300"
          >
            <HiOutlineArrowPath className={clsx('h-4 w-4', loading && 'animate-spin')} />
            রিফ্রেশ
          </Button>
          <Button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm font-semibold"
          >
            <HiOutlineDownload className="h-4 w-4" />
            আয় প্রতিবেদন ডাউনলোড (CSV)
          </Button>
        </div>
      </div>

      {/* Filter Control Toolbar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-neutral-700 font-semibold text-sm border-b border-neutral-100 pb-3">
          <HiOutlineFilter className="h-4 w-4 text-indigo-600" />
          ফিল্টার ও কাস্টম সময়সীমা নিয়ন্ত্রণ
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Timeframe Presets */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">সময়কাল (Timeframe)</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full text-xs font-medium border border-neutral-300 rounded-xl px-3 py-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {timeframeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">পেমেন্ট চ্যানেল (Channel)</label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full text-xs font-medium border border-neutral-300 rounded-xl px-3 py-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">সকল চ্যানেল (All Payment Methods)</option>
              <option value="bkash">bKash (বিকাশ)</option>
              <option value="nagad">Nagad (নগদ)</option>
              <option value="manual">Manual Bank / Cash</option>
              <option value="free">Free / Admin Issued</option>
            </select>
          </div>

          {/* Package Filter */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">প্যাকেজ (Specific Package)</label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="w-full text-xs font-medium border border-neutral-300 rounded-xl px-3 py-2.5 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">সকল প্যাকেজ (All Packages)</option>
              {packages.map((pkg) => (
                <option key={pkg._id} value={pkg._id}>
                  {pkg.name} (৳{pkg.discountPrice ?? pkg.price})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Pickers */}
          {timeframe === 'custom' && (
            <div className="sm:col-span-2 lg:col-span-1 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">শুরু</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-xl px-2.5 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">শেষ</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-xl px-2.5 py-2 bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-indigo-100">মোট গ্রস আয় (Gross Revenue)</p>
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <HiOutlineBanknotes className="h-5 w-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 bg-white/20 mb-2" />
          ) : (
            <p className="text-3xl font-extrabold tracking-tight">৳{(kpis.grossRevenue || 0).toLocaleString('bn-BD')}</p>
          )}
          <p className="text-[11px] text-indigo-200 mt-1">
            মোট সম্পন্ন বিক্রি: <span className="font-semibold">{kpis.completedOrders || 0} টি</span>
          </p>
        </motion.div>

        {/* Net Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-emerald-100">নিট সংগ্রহ (Net Revenue)</p>
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <HiOutlineArrowTrendingUp className="h-5 w-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 bg-white/20 mb-2" />
          ) : (
            <p className="text-3xl font-extrabold tracking-tight">৳{(kpis.netRevenue || 0).toLocaleString('bn-BD')}</p>
          )}
          <p className="text-[11px] text-emerald-200 mt-1">
            ফেরতকৃত অর্থ বাদে নিট ক্যাশ
          </p>
        </motion.div>

        {/* Total Discounts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-neutral-500">মোট ছাড় দেওয়া হয়েছে (Discounts)</p>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <HiOutlineReceiptPercent className="h-5 w-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <p className="text-2xl font-bold text-neutral-800">৳{(kpis.totalDiscounts || 0).toLocaleString('bn-BD')}</p>
          )}
          <p className="text-[11px] text-neutral-400 mt-1">
            আসল পণ্যের মূল্য: ৳{(kpis.originalValueTotal || 0).toLocaleString('bn-BD')}
          </p>
        </motion.div>

        {/* Average Order Value (AOV) & Conversion */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-neutral-500">গড় অর্ডার মূল্য (AOV)</p>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <HiOutlineChartBar className="h-5 w-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <p className="text-2xl font-bold text-neutral-800">৳{(kpis.averageOrderValue || 0).toLocaleString('bn-BD')}</p>
          )}
          <p className="text-[11px] text-neutral-500 mt-1">
            অর্ডার সম্পন্নতার হার: <span className="font-semibold text-emerald-600">{kpis.conversionRate || 0}%</span>
          </p>
        </motion.div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-800">অপেক্ষমান অর্ডার (Pending)</p>
            <p className="text-xl font-bold text-amber-900 mt-0.5">{kpis.pendingOrders || 0} টি</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-amber-700">সম্ভাব্য মূল্য</p>
            <p className="text-sm font-bold text-amber-900">৳{(kpis.pendingAmount || 0).toLocaleString('bn-BD')}</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-purple-800">ফেরতকৃত অর্ডার (Refunded)</p>
            <p className="text-xl font-bold text-purple-900 mt-0.5">{kpis.refundedOrders || 0} টি</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-purple-700">ফেরত মূল্যায়ণ</p>
            <p className="text-sm font-bold text-purple-900">৳{(kpis.refundedAmount || 0).toLocaleString('bn-BD')}</p>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-800">বাতিল/ব্যর্থ অর্ডার (Failed)</p>
            <p className="text-xl font-bold text-rose-900 mt-0.5">{kpis.failedOrders || 0} টি</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-rose-700">অনুপাত</p>
            <p className="text-sm font-bold text-rose-900">
              {kpis.totalOrders > 0 ? ((kpis.failedOrders / kpis.totalOrders) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-indigo-800">মোট বিক্রিত ইউনিট</p>
            <p className="text-xl font-bold text-indigo-900 mt-0.5">{kpis.completedOrders || 0} টি</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-indigo-700">মোট অর্ডার</p>
            <p className="text-sm font-bold text-indigo-900">{kpis.totalOrders || 0} টি</p>
          </div>
        </div>
      </div>

      {/* Visual Revenue Time Series Chart */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">আয়ের সময়ক্রমিক গ্রাফ (Revenue Trend)</h2>
            <p className="text-xs text-neutral-500">সময়সীমার ওপর ভিত্তি করে প্রতিদিন বা প্রতি মাসের মোট বিক্রয়</p>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : !analytics?.timeSeries || analytics.timeSeries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <HiOutlineExclamationCircle className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm">নির্বাচিত সময়সীমায় কোনো লেনদেন ডাটা পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-64 flex items-end gap-2 pt-8 pb-2 px-2 overflow-x-auto border-b border-neutral-200">
              {analytics.timeSeries.map((item, idx) => {
                const heightPercent = maxTrendRevenue > 0 ? (item.revenue / maxTrendRevenue) * 100 : 0;
                return (
                  <div key={item._id || idx} className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group relative">
                    {/* Tooltip hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-neutral-900 text-white text-[10px] rounded-lg py-1.5 px-2.5 z-20 shadow-xl whitespace-nowrap">
                      <span className="font-semibold">{item._id}</span>
                      <span>আয়: ৳{item.revenue}</span>
                      <span>অর্ডার: {item.ordersCount}টি</span>
                    </div>

                    <div className="w-full bg-neutral-100 rounded-t-lg h-full flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.02 }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-lg group-hover:from-indigo-500 group-hover:to-purple-500 transition-colors"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium rotate-45 origin-left truncate max-w-[40px]">
                      {item._id?.substring(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Package Sales Breakdown & Payment Gateways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Package Sales Leaderboard */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-800 mb-1">প্যাকেজ ভিত্তিক বিক্রয় (Package Revenue)</h2>
          <p className="text-xs text-neutral-500 mb-4">কোন প্যাকেজ থেকে সর্বোচ্চ আয় এসেছে</p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : !analytics?.packageBreakdown || analytics.packageBreakdown.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">কোনো প্যাকেজ বিক্রয় ডাটা পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-3">
              {analytics.packageBreakdown.map((pkg) => (
                <div key={pkg.packageId} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50 hover:bg-neutral-100/80 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-neutral-800 truncate max-w-[200px]">{pkg.name}</span>
                    <span className="font-bold text-indigo-600">৳{pkg.revenue.toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pkg.percentage || 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1.5">
                    <span>বিক্রি: {pkg.unitsSold}টি</span>
                    <span>মোট ছাড়: ৳{pkg.discountTotal}</span>
                    <span>শেয়ার: {pkg.percentage ? pkg.percentage.toFixed(1) : 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Channels Distribution */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-800 mb-1">পেমেন্ট গেটওয়ে বিশ্লেষণ (Channels)</h2>
          <p className="text-xs text-neutral-500 mb-4">শিক্ষকদের সবচেয়ে পছন্দের পেমেন্ট পদ্ধতি</p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : !analytics?.paymentMethods || analytics.paymentMethods.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">পেমেন্ট চ্যানেল ডাটা পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-3">
              {analytics.paymentMethods.map((pm) => {
                const label = paymentMethodLabels[pm.paymentMethod] || pm.paymentMethod;
                return (
                  <div key={pm.paymentMethod} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-neutral-800">{label}</span>
                      <span className="font-bold text-emerald-600">৳{pm.revenue.toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(pm.percentage || 0, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1.5">
                      <span>মোট অনুরোধ: {pm.ordersCount}টি</span>
                      <span>অনুমোদিত: {pm.completedCount}টি</span>
                      <span>অবদান: {pm.percentage ? pm.percentage.toFixed(1) : 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Purchasing Teachers Leaderboard */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-neutral-800 mb-1">সর্বোচ্চ ক্রয়কারী শিক্ষক (Top Customers)</h2>
        <p className="text-xs text-neutral-500 mb-4">সবচেয়ে বেশি টাকার প্যাকেজ ক্রয়কারী শীর্ষ ১০ জন শিক্ষক</p>

        {loading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : !analytics?.topTeachers || analytics.topTeachers.length === 0 ? (
          <p className="text-xs text-neutral-400 py-6 text-center">কোনো শিক্ষক ডাটা পাওয়া যায়নি</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-neutral-700">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3">শিক্ষকের নাম</th>
                  <th className="px-4 py-3">ফোন / ইমেইল</th>
                  <th className="px-4 py-3">প্রতিষ্ঠান</th>
                  <th className="px-4 py-3 text-center">মোট অর্ডার</th>
                  <th className="px-4 py-3 text-right">মোট খরচের পরিমাণ</th>
                  <th className="px-4 py-3 text-right">সর্বশেষ ক্রয়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {analytics.topTeachers.map((t, idx) => (
                  <tr key={t.teacherId || idx} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-neutral-800">{t.name || 'শিক্ষক'}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      <div>{t.phone || '—'}</div>
                      <div className="text-[10px] text-neutral-400">{t.email}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{t.institutionName || '—'}</td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-600">{t.totalOrders}টি</td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-600">৳{t.totalSpent.toLocaleString('bn-BD')}</td>
                    <td className="px-4 py-3 text-right text-neutral-400">
                      {new Date(t.lastPurchaseDate).toLocaleDateString('bn-BD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">লেনদেন ও ক্রয় আদেশ রেজিস্টার (Transactions Log)</h2>
            <p className="text-xs text-neutral-500">সাম্প্রতিক অর্ডারের বিস্তারিত তথ্য এবং অনুমোদন কন্ট্রোল</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium border border-neutral-300 rounded-xl px-3 py-2 bg-neutral-50"
            >
              <option value="">সকল স্ট্যাটাস (All Statuses)</option>
              <option value="pending">অপেক্ষমান (Pending)</option>
              <option value="completed">সম্পন্ন (Completed)</option>
              <option value="refunded">ফেরতকৃত (Refunded)</option>
              <option value="failed">ব্যর্থ (Failed)</option>
            </select>
          </div>
        </div>

        {purchasesLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : purchases.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs">কোনো ক্রয় লেনদেন রেকর্ড পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-neutral-700">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3">অর্ডার আইডি</th>
                  <th className="px-4 py-3">শিক্ষক</th>
                  <th className="px-4 py-3">প্যাকেজ</th>
                  <th className="px-4 py-3">চ্যানেল</th>
                  <th className="px-4 py-3 text-right">মূল্য</th>
                  <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-right">তারিখ</th>
                  <th className="px-4 py-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {purchases.map((p) => (
                  <tr key={p._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px] text-neutral-500">{p._id.substring(18)}</td>
                    <td className="px-4 py-3 font-medium text-neutral-800">
                      <div>{p.teacherId?.name || 'শিক্ষক'}</div>
                      <div className="text-[10px] text-neutral-400">{p.teacherId?.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-indigo-700">{p.packageId?.name || 'প্যাকেজ'}</td>
                    <td className="px-4 py-3 text-neutral-600 font-semibold uppercase">{p.paymentMethod || 'manual'}</td>
                    <td className="px-4 py-3 text-right font-bold text-neutral-800">৳{p.finalAmount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={clsx('px-2.5 py-1 rounded-full text-[10px] font-bold border', statusColors[p.status])}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400">
                      {new Date(p.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        onClick={() => {
                          setSelectedPurchase(p);
                          setAdminNote(p.adminNote || '');
                        }}
                        variant="outline"
                        className="text-[11px] py-1 px-2.5 border-neutral-300 hover:bg-neutral-100"
                      >
                        বিস্তারিত & স্ট্যাটাস
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Action Modal */}
      <Modal
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        title="অর্ডার বিস্তারিত ও স্ট্যাটাস আপডেট"
      >
        {selectedPurchase && (
          <div className="space-y-4 text-xs text-neutral-700">
            <div className="bg-neutral-50 p-4 rounded-xl space-y-2 border border-neutral-200">
              <div className="flex justify-between">
                <span className="text-neutral-500">অর্ডার আইডি:</span>
                <span className="font-mono font-bold text-neutral-800">{selectedPurchase._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">শিক্ষক:</span>
                <span className="font-semibold text-neutral-800">{selectedPurchase.teacherId?.name} ({selectedPurchase.teacherId?.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">প্যাকেজ:</span>
                <span className="font-semibold text-indigo-600">{selectedPurchase.packageId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">চূড়ান্ত পরিশোধিত মূল্য:</span>
                <span className="font-bold text-emerald-600 text-sm">৳{selectedPurchase.finalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">পেমেন্ট মেথড:</span>
                <span className="font-semibold uppercase">{selectedPurchase.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">বর্তমান স্ট্যাটাস:</span>
                <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold border', statusColors[selectedPurchase.status])}>
                  {statusLabels[selectedPurchase.status] || selectedPurchase.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">অ্যাডমিন নোট (Admin Note)</label>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="পেমেন্ট যাচাইকরণের কোনো তথ্য বা দ্রষ্টব্য থাকলে লিখুন..."
                className="w-full border border-neutral-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200 justify-end">
              {selectedPurchase.status === 'pending' && (
                <>
                  <Button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedPurchase._id, 'completed')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-4 rounded-xl"
                  >
                    অনুমোদন করুন (Approve & Issue Entitlements)
                  </Button>
                  <Button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedPurchase._id, 'failed')}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs py-2 px-4 rounded-xl"
                  >
                    বাতিল করুন (Reject)
                  </Button>
                </>
              )}

              {selectedPurchase.status === 'completed' && (
                <Button
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedPurchase._id, 'refunded')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-4 rounded-xl"
                >
                  অর্থ ফেরত দিন (Refund & Revoke Access)
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setSelectedPurchase(null)}
                className="text-xs py-2 px-4 rounded-xl"
              >
                বন্ধ করুন
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
