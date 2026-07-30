'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import apiClient from '@/store/api/apiClient';
import {
  HiOutlinePhotograph,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineCloudUpload,
  HiOutlineClipboardCopy,
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineFolder,
  HiOutlineFolderOpen,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';

/**
 * GalleryPicker — Modal to browse and pick images from the Media Gallery.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSelect: (url: string) => void — called when user picks an image
 * - subjectId: string — pre-filter by subject (optional)
 * - chapterId: string — pre-filter by chapter (optional)
 * - sourceType: string — source type for uploads made within this picker
 */
export default function GalleryPicker({
  isOpen,
  onClose,
  onSelect,
  subjectId: initialSubjectId = '',
  chapterId: initialChapterId = '',
  sourceType = 'question',
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [folderTree, setFolderTree] = useState({ tree: [], uncategorizedCount: 0 });
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [showUncategorized, setShowUncategorized] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState(null);

  // Upload within picker
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      setSelectedSubjectId(initialSubjectId);
      setSelectedChapterId(initialChapterId);
      setShowUncategorized(false);
      setPage(1);
      setSearch('');
    }
  }, [isOpen, initialSubjectId, initialChapterId]);

  // Load folder tree
  useEffect(() => {
    if (!isOpen) return;
    apiClient.get('/media/folders').then((res) => {
      if (res.data) setFolderTree(res.data);
    }).catch(() => {});
  }, [isOpen]);

  // Load files
  const loadFiles = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '20');
      params.set('sortBy', 'createdAt');
      params.set('sortOrder', 'desc');
      if (search.trim()) params.set('search', search.trim());
      if (showUncategorized) {
        params.set('uncategorized', 'true');
      } else {
        if (selectedSubjectId) params.set('subjectId', selectedSubjectId);
        if (selectedChapterId) params.set('chapterId', selectedChapterId);
      }
      const res = await apiClient.get(`/media?${params.toString()}`);
      setFiles(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch {
      toast.error('গ্যালারি লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [isOpen, page, search, selectedSubjectId, selectedChapterId, showUncategorized]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Quick upload within picker
  const handleQuickUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', JSON.stringify({
        type: sourceType,
        subjectId: selectedSubjectId || initialSubjectId || undefined,
        chapterId: selectedChapterId || initialChapterId || undefined,
      }));

      const res = await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          if (ev.total) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        },
      });

      const mediaFile = res.data?.data || res.data;
      toast.success('ছবি আপলোড সফল! নির্বাচন করুন বা আরো আপলোড করুন।');
      loadFiles();
    } catch (err) {
      toast.error(err?.error?.message || 'আপলোড ব্যর্থ');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSelect = (url) => {
    onSelect(url);
    onClose();
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL কপি হয়েছে!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFolderClick = (subId, chId = '') => {
    setSelectedSubjectId(subId);
    setSelectedChapterId(chId);
    setShowUncategorized(false);
    setPage(1);
  };

  if (!isOpen) return null;

  const activeSubject = folderTree.tree.find((s) => s._id === selectedSubjectId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-3xl overflow-hidden max-w-5xl w-full shadow-2xl border border-neutral-100 z-10 flex flex-col"
          style={{ maxHeight: '85vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <HiOutlinePhotograph className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900">গ্যালারি থেকে ছবি বাছুন</h3>
                <p className="text-xs text-neutral-400">ক্লিক করে ছবি নির্বাচন করুন • ছবি আপলোডও করতে পারবেন</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar — Folder Tree */}
            <div className="w-56 border-r border-neutral-100 bg-neutral-50/50 overflow-y-auto shrink-0 py-3 px-2 hidden md:block">
              <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest px-2 mb-2">ফোল্ডার</p>
              
              {/* All Images */}
              <button
                type="button"
                onClick={() => { setSelectedSubjectId(''); setSelectedChapterId(''); setShowUncategorized(false); setPage(1); }}
                className={clsx(
                  'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors mb-0.5',
                  !selectedSubjectId && !showUncategorized
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                <HiOutlinePhotograph className="h-3.5 w-3.5 shrink-0" />
                সব ছবি
              </button>

              {/* Subject folders */}
              {folderTree.tree.map((subject) => (
                <div key={subject._id} className="mb-0.5">
                  <button
                    type="button"
                    onClick={() => handleFolderClick(subject._id)}
                    className={clsx(
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors',
                      selectedSubjectId === subject._id && !selectedChapterId
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    )}
                  >
                    {selectedSubjectId === subject._id ? (
                      <HiOutlineFolderOpen className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                    ) : (
                      <HiOutlineFolder className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate flex-1">{subject.subjectName}</span>
                    <span className="text-[10px] text-neutral-400 font-bold">{subject.count}</span>
                  </button>

                  {/* Chapter sub-folders */}
                  {selectedSubjectId === subject._id && subject.chapters.length > 0 && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-neutral-200 pl-2">
                      {subject.chapters.map((ch) => (
                        <button
                          key={ch._id}
                          type="button"
                          onClick={() => handleFolderClick(subject._id, ch._id)}
                          className={clsx(
                            'w-full text-left px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors',
                            selectedChapterId === ch._id
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-neutral-500 hover:bg-neutral-100'
                          )}
                        >
                          <span className="truncate flex-1">{ch.chapterName}</span>
                          <span className="text-[9px] text-neutral-400 font-bold">{ch.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Uncategorized */}
              <button
                type="button"
                onClick={() => { setSelectedSubjectId(''); setSelectedChapterId(''); setShowUncategorized(true); setPage(1); }}
                className={clsx(
                  'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors mt-1',
                  showUncategorized
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-neutral-500 hover:bg-neutral-100'
                )}
              >
                <HiOutlineFolder className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1">শ্রেণীবিহীন (Uncategorized)</span>
                <span className="text-[10px] text-neutral-400 font-bold">{folderTree.uncategorizedCount}</span>
              </button>
            </div>

            {/* Right Side — Gallery Grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search + Quick Upload Bar */}
              <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-3 shrink-0">
                <div className="relative flex-1">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="ফাইল নাম দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Quick Upload */}
                <label className={clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0',
                  uploading
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                )}>
                  <HiOutlineCloudUpload className="h-4 w-4" />
                  {uploading ? `${uploadProgress}%...` : 'আপলোড'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQuickUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Active folder breadcrumb (mobile) */}
              {(selectedSubjectId || showUncategorized) && (
                <div className="px-4 py-1.5 bg-neutral-50 border-b border-neutral-100 flex items-center gap-1 text-xs text-neutral-500 shrink-0">
                  <button type="button" onClick={() => { setSelectedSubjectId(''); setSelectedChapterId(''); setShowUncategorized(false); }} className="hover:text-indigo-600 font-medium">সব ছবি</button>
                  {activeSubject && (
                    <>
                      <span className="text-neutral-300">/</span>
                      <button type="button" onClick={() => setSelectedChapterId('')} className="hover:text-indigo-600 font-medium truncate max-w-[150px]">{activeSubject.subjectName}</button>
                    </>
                  )}
                  {selectedChapterId && activeSubject && (
                    <>
                      <span className="text-neutral-300">/</span>
                      <span className="font-bold text-indigo-600 truncate max-w-[150px]">
                        {activeSubject.chapters.find((c) => c._id === selectedChapterId)?.chapterName || ''}
                      </span>
                    </>
                  )}
                  {showUncategorized && (
                    <>
                      <span className="text-neutral-300">/</span>
                      <span className="font-bold text-amber-600">শ্রেণীবিহীন</span>
                    </>
                  )}
                </div>
              )}

              {/* Image Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="aspect-square animate-pulse rounded-xl bg-neutral-100" />
                    ))}
                  </div>
                ) : files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                      <HiOutlinePhotograph className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-neutral-700">এই ফোল্ডারে কোনো ছবি নেই</p>
                    <p className="text-xs text-neutral-400 mt-1">উপরের আপলোড বাটন থেকে ছবি যোগ করুন</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {files.map((file) => {
                      const isCopied = copiedId === file._id;
                      return (
                        <div
                          key={file._id}
                          className="group relative rounded-xl border border-neutral-200/80 bg-white overflow-hidden cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200"
                        >
                          {/* Image */}
                          <div
                            onClick={() => handleSelect(file.url)}
                            className="aspect-square bg-neutral-50 flex items-center justify-center p-2 overflow-hidden"
                          >
                            <img
                              src={file.url}
                              alt={file.originalName}
                              loading="lazy"
                              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>

                          {/* Select overlay on hover */}
                          <div
                            onClick={() => handleSelect(file.url)}
                            className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center"
                          >
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <HiOutlineCheckCircle className="h-3.5 w-3.5" />
                              নির্বাচন
                            </span>
                          </div>

                          {/* Copy URL button */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleCopy(file.url, file._id); }}
                            className={clsx(
                              'absolute top-2 right-2 p-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm',
                              isCopied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white/90 text-neutral-600 hover:bg-indigo-600 hover:text-white border border-neutral-200/60'
                            )}
                            title="Copy URL"
                          >
                            {isCopied ? <HiOutlineClipboardCheck className="h-3.5 w-3.5" /> : <HiOutlineClipboardCopy className="h-3.5 w-3.5" />}
                          </button>

                          {/* Footer */}
                          <div className="px-2 py-1.5 border-t border-neutral-100">
                            <p className="text-[10px] font-bold text-neutral-700 truncate" title={file.originalName}>
                              {file.originalName}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-center gap-3 shrink-0">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <HiOutlineChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-neutral-600">
                    পৃষ্ঠা {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <HiOutlineChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
