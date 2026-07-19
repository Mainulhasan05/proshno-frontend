'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import apiClient from '@/store/api/apiClient';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import {
  HiOutlinePhotograph,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineDatabase,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlineChartPie,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineInformationCircle,
  HiOutlineCheck,
  HiOutlineX,
} from 'react-icons/hi';

export default function MediaGalleryPage() {
  // Gallery state
  const [files, setFiles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [r2Accounts, setR2Accounts] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Filters & display configurations
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    page: 1,
    limit: 24,
    sourceType: 'all',
    orphanStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    r2AccountId: '',
    search: '',
  });

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // Detail modal

  // Loaders
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await apiClient.get('/media/stats');
      setStats(res.data);
    } catch {
      toast.error('Failed to load storage statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      const res = await apiClient.get('/r2-accounts');
      setR2Accounts(res.data || []);
    } catch {
      // Quiet fail or logged
    }
  }, []);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) queryParams.append(key, val);
      });
      const res = await apiClient.get(`/media?${queryParams.toString()}`);
      setFiles(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch {
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAccounts();
    loadStats();
  }, [loadAccounts, loadStats]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Operations
  const handleScanOrphans = async () => {
    setScanning(true);
    try {
      const res = await apiClient.post('/media/scan-orphans');
      toast.success(res.message || `Scanned! Found ${res.data.orphansFound} orphans.`);
      loadStats();
      loadFiles();
    } catch (err) {
      toast.error(err?.error?.message || 'Orphan scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this file? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/media/${id}`);
      toast.success('File deleted successfully');
      setSelectedIds(prev => prev.filter(x => x !== id));
      if (selectedFile?._id === id) setSelectedFile(null);
      loadStats();
      loadFiles();
    } catch (err) {
      toast.error(err?.error?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    const selectedFiles = files.filter(f => selectedIds.includes(f._id));
    const inUse = selectedFiles.filter(f => f.refCount > 0);
    
    if (inUse.length > 0) {
      alert(`Cannot delete: ${inUse.length} of the selected files are currently in use. Please deselect them first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} orphaned files? This action is permanent.`)) return;
    
    setBulkDeleting(true);
    try {
      let successCount = 0;
      for (const id of selectedIds) {
        try {
          await apiClient.delete(`/media/${id}`);
          successCount++;
        } catch {
          // Continue bulk deleting even if one fails
        }
      }
      toast.success(`Successfully deleted ${successCount} files`);
      setSelectedIds([]);
      loadStats();
      loadFiles();
    } catch (err) {
      toast.error('Bulk deletion encountered errors');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(files.map(f => f._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1, // Reset page on filter changes
    }));
  };

  const handlePageChange = (page) => {
    updateFilter('page', page);
  };

  // Helper formats
  const formatSize = (bytes) => {
    if (bytes === undefined || bytes === null) return '0 B';
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  // Compute status details
  const getStatus = (file) => {
    const hours = (new Date() - new Date(file.createdAt)) / (1000 * 60 * 60);
    if (file.refCount > 0) return { label: 'In Use', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' };
    if (hours < 24) return { label: 'Recent', color: 'bg-amber-50 text-amber-700 ring-amber-600/20' };
    return { label: 'Orphaned', color: 'bg-rose-50 text-rose-700 ring-rose-600/20' };
  };

  return (
    <div className="mx-auto max-w-[1400px] pb-10">
      
      {/* ── Page Header ─────────────────────────────────────────── */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
              <HiOutlinePhotograph className="h-4.5 w-4.5 text-white" />
            </span>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-indigo-600">Storage Optimization</p>
          </div>
          <h1 className="text-[1.65rem] font-extrabold text-neutral-900 leading-tight">Media Gallery</h1>
          <p className="mt-1 text-[13px] text-neutral-500">Audit question images, clean up orphaned assets, and manage R2 usage stats</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={handleScanOrphans}
            disabled={scanning || loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <HiOutlineRefresh className={clsx('h-4 w-4 text-neutral-500', scanning && 'animate-spin')} />
            {scanning ? 'Scanning...' : 'Audit References'}
          </Button>
        </div>
      </header>

      {/* ── Dashboard Stats ──────────────────────────────────────── */}
      <div className="mb-7 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={HiOutlinePhotograph}
          label="Total Uploads"
          value={statsLoading ? '—' : stats?.totalFiles ?? 0}
          sub={statsLoading ? '' : formatSize(stats?.totalSizeBytes)}
          gradient="from-blue-500 to-indigo-500"
        />
        <StatCard
          icon={HiOutlineChartPie}
          label="Optimization Saved"
          value={statsLoading ? '—' : `${(((stats?.totalOriginalSizeBytes - stats?.totalSizeBytes) / (stats?.totalOriginalSizeBytes || 1)) * 100).toFixed(0)}%`}
          sub={statsLoading ? '' : `${formatSize(stats?.compressionSavingsBytes)} Saved`}
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={HiOutlineTrash}
          label="Orphaned Files"
          value={statsLoading ? '—' : stats?.orphanCount ?? 0}
          sub={statsLoading ? '' : `${formatSize(stats?.orphanSizeBytes)} Waste`}
          gradient="from-rose-500 to-pink-500"
        />
        <StatCard
          icon={HiOutlineDatabase}
          label="R2 Connected Buckets"
          value={statsLoading ? '—' : r2Accounts.length}
          sub={statsLoading ? '' : `${r2Accounts.filter(a => a.isActive).length} Active`}
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────── */}
      <div className="mb-6 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm flex flex-col gap-4">
        
        {/* Row 1: Search & dropdowns */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search bar */}
          <div className="relative col-span-1 sm:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiOutlineSearch className="h-4 w-4 text-neutral-400" />
            </span>
            <input
              type="text"
              placeholder="Search filename..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filters.orphanStatus}
              onChange={(e) => updateFilter('orphanStatus', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="in_use">In Use</option>
              <option value="orphaned">Orphaned Only</option>
            </select>
          </div>

          {/* Source filter */}
          <div>
            <select
              value={filters.sourceType}
              onChange={(e) => updateFilter('sourceType', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Sources</option>
              <option value="question">Questions</option>
              <option value="avatar">Avatars</option>
              <option value="omr">OMR Logos</option>
            </select>
          </div>

          {/* R2 Account filter */}
          <div>
            <select
              value={filters.r2AccountId}
              onChange={(e) => updateFilter('r2AccountId', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Storage Buckets</option>
              {r2Accounts.map(acc => (
                <option key={acc._id} value={acc._id}>{acc.name} ({acc.bucketName})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Sort, View Switcher & Selection */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-100 pt-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-2.5 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none font-bold text-neutral-700"
            >
              <option value="createdAt">Upload Date</option>
              <option value="sizeBytes">File Size</option>
              <option value="originalName">File Name</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilter('sortOrder', e.target.value)}
              className="px-2.5 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none font-bold text-neutral-700"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Selection status */}
            {files.length > 0 && (
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-neutral-500 select-none">
                <input
                  type="checkbox"
                  checked={selectedIds.length === files.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                Select All
              </label>
            )}

            {/* View Switcher */}
            <div className="flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-1.5 rounded-md transition-all duration-150',
                  viewMode === 'grid' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                )}
                title="Grid view"
              >
                <HiOutlineViewGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-1.5 rounded-md transition-all duration-150',
                  viewMode === 'list' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                )}
                title="List view"
              >
                <HiOutlineViewList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Gallery Workspace ───────────────────────────────── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-white border border-neutral-100" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400">
            <HiOutlinePhotograph className="h-7 w-7" />
          </div>
          <p className="mt-4 text-base font-bold text-neutral-700">No media assets found</p>
          <p className="mt-1 text-xs text-neutral-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {files.map((file) => {
            const isSelected = selectedIds.includes(file._id);
            const status = getStatus(file);
            return (
              <div
                key={file._id}
                onClick={() => setSelectedFile(file)}
                className={clsx(
                  'group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer select-none',
                  isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-neutral-200/80 hover:border-neutral-350'
                )}
              >
                {/* Checkbox overlay */}
                <div 
                  className={clsx(
                    'absolute top-3 left-3 z-10 h-5 w-5 rounded-md border flex items-center justify-center transition-all bg-white/90 backdrop-blur-sm',
                    isSelected ? 'bg-indigo-650 border-indigo-650 text-white' : 'border-neutral-300 opacity-0 group-hover:opacity-100'
                  )}
                  onClick={(e) => toggleSelect(file._id, e)}
                >
                  {isSelected && <HiOutlineCheck className="h-3.5 w-3.5 text-indigo-600 font-bold" />}
                </div>

                {/* Image Container */}
                <div className="relative h-32 w-full bg-neutral-50 flex items-center justify-center overflow-hidden border-b border-neutral-100">
                  <img
                    src={file.url}
                    alt={file.originalName}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ring-1 ring-inset', status.color)}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3">
                  <p className="text-xs font-bold text-neutral-800 truncate" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400 font-medium">
                    <span>{formatSize(file.sizeBytes)}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Inline Quick Delete Hover */}
                {status.label === 'Orphaned' && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(file._id, e)}
                    disabled={deletingId === file._id}
                    className="absolute bottom-2.5 right-2.5 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-rose-200/50"
                  >
                    {deletingId === file._id ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-600 border-t-transparent block" />
                    ) : (
                      <HiOutlineTrash className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50/75 border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === files.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-3.5 px-4">Preview</th>
                <th className="py-3.5 px-4">Filename</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Storage Savings</th>
                <th className="py-3.5 px-4">Upload Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {files.map((file) => {
                const isSelected = selectedIds.includes(file._id);
                const status = getStatus(file);
                const savingsPercent = Math.max(0, Math.round(((file.originalSizeBytes - file.sizeBytes) / (file.originalSizeBytes || 1)) * 100));

                return (
                  <tr
                    key={file._id}
                    onClick={() => setSelectedFile(file)}
                    className={clsx(
                      'hover:bg-neutral-50/50 cursor-pointer transition-colors',
                      isSelected && 'bg-indigo-50/10'
                    )}
                  >
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(file._id)}
                        className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                        <img src={file.url} alt="" className="h-full w-full object-contain" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-800 truncate max-w-[200px]" title={file.originalName}>
                      {file.originalName}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-neutral-500 capitalize">
                      {file.source?.type || 'Question'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-800 font-bold">{formatSize(file.sizeBytes)}</span>
                        <span className="text-neutral-400">({formatSize(file.originalSizeBytes)})</span>
                        <span className="text-emerald-600 font-bold">-{savingsPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-neutral-400">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ring-1 ring-inset', status.color)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedFile(file)}
                          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600"
                          title="Details"
                        >
                          <HiOutlineEye className="h-4 w-4" />
                        </button>
                        {status.label === 'Orphaned' ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(file._id)}
                            disabled={deletingId === file._id}
                            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            title="Delete"
                          >
                            {deletingId === file._id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent block" />
                            ) : (
                              <HiOutlineTrash className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <div className="w-8 h-8" /> // spacing spacer
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* ── Floating Action Bar (Bulk Ops) ────────────────────────── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900 text-white rounded-2xl px-6 py-4 flex items-center gap-6 shadow-2xl min-w-[340px] md:min-w-[480px] border border-neutral-800"
          >
            <div className="text-sm font-semibold flex-1">
              Selected <span className="text-indigo-400 font-black">{selectedIds.length}</span> file{selectedIds.length !== 1 ? 's' : ''}
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3.5 py-2 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
              >
                Clear Selection
              </button>

              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-black rounded-xl transition-all shadow-md shadow-rose-900/10 disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <HiOutlineTrash className="h-4 w-4" />
                )}
                Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Detail Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedFile && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Backdrop click close */}
            <div className="absolute inset-0" onClick={() => setSelectedFile(null)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col md:flex-row min-h-[480px] border border-neutral-100 z-10"
            >
              {/* Image Preview Panel */}
              <div className="md:w-1/2 bg-neutral-900 flex items-center justify-center p-6 relative border-r border-neutral-100 min-h-[300px]">
                <img src={selectedFile.url} alt="" className="max-h-[400px] max-w-full object-contain rounded-lg shadow-lg" />
                <a
                  href={selectedFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-4 right-4 bg-black/50 text-white rounded-lg p-2 hover:bg-black/75 transition-colors border border-neutral-800 flex items-center justify-center"
                  title="Open full size"
                >
                  <HiOutlineLink className="h-4 w-4" />
                </a>
              </div>

              {/* Info Details Panel */}
              <div className="md:w-1/2 p-6 flex flex-col justify-between">
                <div>
                  {/* Header Title */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-neutral-900 leading-tight truncate" title={selectedFile.originalName}>
                        {selectedFile.originalName}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 truncate font-mono bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100 inline-block">{selectedFile.key}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <HiOutlineX className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Badges / Status */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-1 ring-inset', getStatus(selectedFile).color)}>
                      {getStatus(selectedFile).label}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 ring-1 ring-indigo-650/10 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                      {selectedFile.source?.type || 'Question'}
                    </span>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-neutral-100 py-4 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">File Size</p>
                      <p className="text-sm font-bold text-neutral-800 mt-0.5">{formatSize(selectedFile.sizeBytes)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Original Size</p>
                      <p className="text-sm font-bold text-neutral-800 mt-0.5">{formatSize(selectedFile.originalSizeBytes)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">MIME Type</p>
                      <p className="text-sm font-semibold text-neutral-800 mt-0.5">{selectedFile.mimeType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Dimensions</p>
                      <p className="text-sm font-bold text-neutral-800 mt-0.5">{selectedFile.width} × {selectedFile.height} px</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Uploaded By</p>
                      <p className="text-sm font-semibold text-neutral-800 mt-0.5 truncate">{selectedFile.uploadedBy?.email || 'System'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Upload Date</p>
                      <p className="text-sm font-semibold text-neutral-800 mt-0.5">{new Date(selectedFile.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* References & R2 stats */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                      <HiOutlineInformationCircle className="h-4 w-4 text-neutral-400 shrink-0" />
                      <span>Used in <span className="font-bold text-neutral-800">{selectedFile.refCount}</span> document{selectedFile.refCount !== 1 ? 's' : ''}.</span>
                    </div>

                    {selectedFile.r2AccountId && (
                      <div className="bg-neutral-50/70 border border-neutral-100 rounded-2xl p-3 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HiOutlineDatabase className="h-4 w-4 text-indigo-500 shrink-0" />
                          <div>
                            <p className="font-bold text-neutral-700">{selectedFile.r2AccountId.name}</p>
                            <p className="text-[10px] text-neutral-400">{selectedFile.r2AccountId.bucketName}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal footer / Delete actions */}
                <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <a
                    href={selectedFile.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100/70 px-3.5 py-2 rounded-xl transition-all"
                  >
                    Download Original
                  </a>

                  {selectedFile.refCount === 0 ? (
                    <Button
                      variant="outline"
                      className="border-rose-200 hover:bg-rose-50 text-rose-600 flex items-center gap-1.5"
                      onClick={() => handleDelete(selectedFile._id)}
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                      Delete Asset
                    </Button>
                  ) : (
                    <span className="text-xs text-neutral-400 font-medium flex items-center gap-1 italic">
                      <HiOutlineDocumentText className="h-3.5 w-3.5" /> In-use (Delete locked)
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  METRICS CARD
// ═══════════════════════════════════════════════════════════════
function StatCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</p>
          <p className="mt-1.5 text-2xl font-black text-neutral-900 leading-none">{value}</p>
          {sub && <p className="mt-1.5 text-[11px] font-medium text-neutral-400">{sub}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
          <Icon className="h-5 w-5 text-white" />
        </span>
      </div>
      <div className={`absolute -bottom-1 -right-1 h-16 w-16 rounded-full bg-gradient-to-br ${gradient} opacity-[0.04] transition-opacity group-hover:opacity-[0.08]`} />
    </div>
  );
}
