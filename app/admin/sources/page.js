'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import apiClient from '@/store/api/apiClient';
import Button from '@/components/ui/Button';
import {
  HiOutlineTag,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineClipboardCopy,
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineX,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineQuestionMarkCircle,
  HiOutlineSparkles,
  HiOutlineBookOpen,
} from 'react-icons/hi';

export default function QuestionSourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [form, setForm] = useState({
    name: '',
    nameBn: '',
    code: '',
    description: '',
    order: 0,
    isActive: true,
  });

  const loadSources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/question-sources');
      setSources(res.data || []);
    } catch (err) {
      toast.error('Failed to load question sources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  // 1-Click Copy ID Handler
  const handleCopyId = (id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    toast.success('Source ID copied to clipboard!');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingSource(null);
    setForm({
      name: '',
      nameBn: '',
      code: '',
      description: '',
      order: sources.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (source, e) => {
    if (e) e.stopPropagation();
    setEditingSource(source);
    setForm({
      name: source.name || '',
      nameBn: source.nameBn || '',
      code: source.code || '',
      description: source.description || '',
      order: source.order || 0,
      isActive: source.isActive !== false,
    });
    setShowModal(true);
  };

  // Submit Create / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('English Source Name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingSource) {
        await apiClient.put(`/question-sources/${editingSource._id}`, form);
        toast.success('Source updated successfully!');
      } else {
        await apiClient.post('/question-sources', form);
        toast.success('New source created successfully!');
      }
      setShowModal(false);
      loadSources();
    } catch (err) {
      toast.error(err?.error?.message || err?.response?.data?.message || 'Failed to save source');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleActive = async (source, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await apiClient.patch(`/question-sources/${source._id}/toggle`);
      toast.success(res.message || 'Status updated');
      loadSources();
    } catch (err) {
      toast.error(err?.error?.message || 'Failed to update status');
    }
  };

  // Delete Source
  const handleDelete = async (source, e) => {
    if (e) e.stopPropagation();
    if (source.questionCount > 0) {
      alert(`Cannot delete: ${source.questionCount} question(s) are using this source. Update or remove references first.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete source "${source.name}"?`)) return;

    setDeletingId(source._id);
    try {
      await apiClient.delete(`/question-sources/${source._id}`);
      toast.success('Source deleted successfully!');
      loadSources();
    } catch (err) {
      toast.error(err?.error?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered Sources
  const filteredSources = sources.filter((src) => {
    const matchesSearch =
      search === '' ||
      src.name.toLowerCase().includes(search.toLowerCase()) ||
      (src.nameBn && src.nameBn.toLowerCase().includes(search.toLowerCase())) ||
      src.code.toLowerCase().includes(search.toLowerCase()) ||
      src._id.includes(search);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && src.isActive) ||
      (statusFilter === 'inactive' && !src.isActive);

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalSources = sources.length;
  const activeSources = sources.filter((s) => s.isActive).length;
  const defaultSourcesCount = sources.filter((s) => s.isDefault).length;
  const totalQuestionsLinked = sources.reduce((acc, curr) => acc + (curr.questionCount || 0), 0);

  return (
    <div className="mx-auto max-w-[1400px] pb-10">
      
      {/* ── Page Header ─────────────────────────────────────────── */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
              <HiOutlineTag className="h-4.5 w-4.5 text-white" />
            </span>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-indigo-600">Platform Taxonomy</p>
          </div>
          <h1 className="text-[1.65rem] font-extrabold text-neutral-900 leading-tight">Question Sources (প্রশ্ন উৎস)</h1>
          <p className="mt-1 text-[13px] text-neutral-500">Manage question origin tags (Admission, Board, Main Book, Inspired, etc.) and copy Source ObjectIDs</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 px-4 py-2 rounded-xl text-xs font-bold"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add New Source
          </Button>
        </div>
      </header>

      {/* ── Dashboard Stats ──────────────────────────────────────── */}
      <div className="mb-7 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={HiOutlineTag}
          label="Total Sources"
          value={loading ? '—' : totalSources}
          sub="Registered Origin Tags"
          gradient="from-blue-500 to-indigo-500"
        />
        <StatCard
          icon={HiOutlineCheckCircle}
          label="Active Sources"
          value={loading ? '—' : activeSources}
          sub={`${totalSources - activeSources} Inactive`}
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={HiOutlineSparkles}
          label="Default System Sources"
          value={loading ? '—' : defaultSourcesCount}
          sub="Core Platform Defaults"
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={HiOutlineQuestionMarkCircle}
          label="Linked Questions"
          value={loading ? '—' : totalQuestionsLinked}
          sub="Total Tag References"
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────── */}
      <div className="mb-6 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiOutlineSearch className="h-4 w-4 text-neutral-400" />
          </span>
          <input
            type="text"
            placeholder="Search source name, code, or ObjectID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold border border-neutral-200 rounded-xl focus:outline-none text-neutral-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* View Switcher */}
          <div className="flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={clsx(
                'p-1.5 rounded-md transition-all duration-150',
                viewMode === 'table' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
              )}
              title="Table view"
            >
              <HiOutlineViewList className="h-4 w-4" />
            </button>
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
          </div>
        </div>
      </div>

      {/* ── Main Source Table / Grid ──────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white border border-neutral-100" />
          ))}
        </div>
      ) : filteredSources.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <HiOutlineTag className="h-7 w-7" />
          </div>
          <p className="mt-4 text-base font-bold text-neutral-800">No question sources found</p>
          <p className="mt-1 text-xs text-neutral-400">Try adjusting your search criteria or create a new source.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50/75 border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3.5 px-4">Source ID (ObjectID)</th>
                <th className="py-3.5 px-4">English Name</th>
                <th className="py-3.5 px-4">Bengali Label</th>
                <th className="py-3.5 px-4">Code Slug</th>
                <th className="py-3.5 px-4">Linked Questions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredSources.map((src) => {
                const isCopied = copiedId === src._id;

                return (
                  <tr key={src._id} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Copy ID Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-neutral-100 text-neutral-700 px-2 py-1 rounded border border-neutral-200 select-all">
                          {src._id}
                        </code>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(src._id, e)}
                          className={clsx(
                            'p-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1',
                            isCopied ? 'bg-emerald-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          )}
                          title="Copy Source ObjectID"
                        >
                          {isCopied ? <HiOutlineClipboardCheck className="h-4 w-4" /> : <HiOutlineClipboardCopy className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>

                    {/* Names */}
                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {src.name}
                      {src.isDefault && (
                        <span className="ml-2 text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700">
                      {src.nameBn || '—'}
                    </td>

                    {/* Code */}
                    <td className="py-3.5 px-4 text-xs font-mono text-neutral-500">
                      {src.code}
                    </td>

                    {/* Questions count */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-full text-xs">
                        <HiOutlineBookOpen className="h-3.5 w-3.5 text-indigo-500" />
                        {src.questionCount} question{src.questionCount !== 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={(e) => handleToggleActive(src, e)}
                        className={clsx(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider transition-all',
                          src.isActive
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 hover:bg-rose-100'
                        )}
                      >
                        {src.isActive ? <HiOutlineCheckCircle className="h-3 w-3" /> : <HiOutlineXCircle className="h-3 w-3" />}
                        {src.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(src, e)}
                          className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Source"
                        >
                          <HiOutlinePencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(src, e)}
                          disabled={deletingId === src._id || src.questionCount > 0}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors',
                            src.questionCount > 0
                              ? 'text-neutral-300 cursor-not-allowed'
                              : 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50'
                          )}
                          title={src.questionCount > 0 ? 'Cannot delete: referenced by questions' : 'Delete Source'}
                        >
                          {deletingId === src._id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent block" />
                          ) : (
                            <HiOutlineTrash className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // Grid View
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSources.map((src) => {
            const isCopied = copiedId === src._id;

            return (
              <div
                key={src._id}
                className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-extrabold text-neutral-900 text-base flex items-center gap-2">
                        {src.name}
                        {src.isDefault && (
                          <span className="text-[9px] font-extrabold uppercase bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                            Default
                          </span>
                        )}
                      </h3>
                      {src.nameBn && <p className="text-xs font-semibold text-neutral-500 mt-0.5">{src.nameBn}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleActive(src, e)}
                      className={clsx(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shrink-0',
                        src.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                      )}
                    >
                      {src.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {src.description && (
                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{src.description}</p>
                  )}

                  {/* 1-Click Copy ID Box */}
                  <div className="mt-4 bg-neutral-50 border border-neutral-200/70 rounded-xl p-2 flex items-center justify-between gap-2">
                    <code className="text-[11px] font-mono text-neutral-600 truncate pl-1 select-all">{src._id}</code>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(src._id, e)}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1',
                        isCopied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      )}
                    >
                      {isCopied ? <HiOutlineClipboardCheck className="h-3.5 w-3.5" /> : <HiOutlineClipboardCopy className="h-3.5 w-3.5" />}
                      {isCopied ? 'Copied' : 'Copy ID'}
                    </button>
                  </div>
                </div>

                {/* Footer Info & Actions */}
                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-500 flex items-center gap-1">
                    <HiOutlineBookOpen className="h-4 w-4 text-indigo-500" />
                    {src.questionCount} Questions
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(src, e)}
                      className="p-1.5 text-neutral-400 hover:text-indigo-600 rounded-lg hover:bg-neutral-50"
                    >
                      <HiOutlinePencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(src, e)}
                      disabled={src.questionCount > 0}
                      className={clsx(
                        'p-1.5 rounded-lg',
                        src.questionCount > 0 ? 'text-neutral-300' : 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50'
                      )}
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => !saving && setShowModal(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl p-6 border border-neutral-100 z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <HiOutlineTag className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-900">
                      {editingSource ? 'Edit Question Source' : 'Create Question Source'}
                    </h3>
                    <p className="text-xs text-neutral-400">Configure origin tag for questions and platform filtering</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <HiOutlineX className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* English Name */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Source Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Admission, Model Test 2026"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                </div>

                {/* Bengali Label */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Bengali Display Label (বাংলা লেবেল)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ভর্তি পরীক্ষা (Admission)"
                    value={form.nameBn}
                    onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                </div>

                {/* Code Slug */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Code Identifier (Slug)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty (e.g. model_test_2026)"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Description / Usage Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional description of this question source..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Order & Active Checkbox */}
                <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Sort Priority Order
                    </label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none font-bold"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      Active Source
                    </label>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <HiOutlineTag className="h-4 w-4" />
                        {editingSource ? 'Update Source' : 'Create Source'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
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
