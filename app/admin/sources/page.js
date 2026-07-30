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
  HiOutlineAcademicCap,
  HiOutlineLibrary,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';

export default function QuestionSourcesPage() {
  const [activeTab, setActiveTab] = useState('tags'); // 'tags' | 'boards' | 'admission' | 'schools'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    nameBn: '',
    shortForm: '',
    code: '',
    description: '',
    type: 'university',
    district: '',
    order: 0,
    isActive: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/question-sources';
      if (activeTab === 'boards') endpoint = '/institutions/boards';
      else if (activeTab === 'admission') endpoint = '/institutions/admission-orgs';
      else if (activeTab === 'schools') endpoint = '/institutions/top-schools';

      const res = await apiClient.get(endpoint);
      setItems(res.data || []);
    } catch (err) {
      toast.error('Failed to load institution data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
    setSearch('');
  }, [loadData, activeTab]);

  // 1-Click Copy ID Handler
  const handleCopyId = (id, label, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    toast.success(`${label || 'ID'} copied to clipboard!`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      name: '',
      nameBn: '',
      shortForm: '',
      code: '',
      description: '',
      type: 'university',
      district: '',
      order: items.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item, e) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setForm({
      name: item.name || '',
      nameBn: item.nameBn || '',
      shortForm: item.shortForm || '',
      code: item.code || '',
      description: item.description || '',
      type: item.type || 'university',
      district: item.district || '',
      order: item.order || 0,
      isActive: item.isActive !== false,
    });
    setShowModal(true);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.error('English Name is required');
    }
    if (activeTab === 'boards' && !form.shortForm.trim()) {
      return toast.error('Short Form (e.g., ঢা.বো.) is required');
    }

    try {
      setSaving(true);
      let endpoint = '/question-sources';
      if (activeTab === 'boards') endpoint = '/institutions/boards';
      else if (activeTab === 'admission') endpoint = '/institutions/admission-orgs';
      else if (activeTab === 'schools') endpoint = '/institutions/top-schools';

      if (editingItem) {
        await apiClient.put(`${endpoint}/${editingItem._id}`, form);
        toast.success('Updated successfully');
      } else {
        await apiClient.post(endpoint, form);
        toast.success('Created successfully');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err?.error?.message || err?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (item, e) => {
    if (e) e.stopPropagation();
    try {
      let endpoint = `/question-sources/${item._id}`;
      if (activeTab === 'boards') endpoint = `/institutions/boards/${item._id}`;
      else if (activeTab === 'admission') endpoint = `/institutions/admission-orgs/${item._id}`;
      else if (activeTab === 'schools') endpoint = `/institutions/top-schools/${item._id}`;

      await apiClient.put(endpoint, { isActive: !item.isActive });
      toast.success(`Marked as ${!item.isActive ? 'Active' : 'Inactive'}`);
      loadData();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  // Delete
  const handleDelete = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      let endpoint = `/question-sources/${id}`;
      if (activeTab === 'boards') endpoint = `/institutions/boards/${id}`;
      else if (activeTab === 'admission') endpoint = `/institutions/admission-orgs/${id}`;
      else if (activeTab === 'schools') endpoint = `/institutions/top-schools/${id}`;

      await apiClient.delete(endpoint);
      toast.success('Deleted successfully');
      loadData();
    } catch (err) {
      toast.error(err?.error?.message || 'Delete failed');
    }
  };

  // Filtered list
  const filteredItems = items.filter((item) => {
    const s = search.toLowerCase().trim();
    const matchesSearch =
      !s ||
      item.name?.toLowerCase().includes(s) ||
      item.nameBn?.toLowerCase().includes(s) ||
      item.shortForm?.toLowerCase().includes(s) ||
      item.code?.toLowerCase().includes(s);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.isActive) ||
      (statusFilter === 'inactive' && !item.isActive);

    return matchesSearch && matchesStatus;
  });

  const totalQuestions = items.reduce((acc, curr) => acc + (curr.questionCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm mb-1">
            <HiOutlineTag className="w-5 h-5" />
            <span>Question Taxonomy & Hierarchy</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Sources & Institution Management</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage question source tags, education boards, admission universities, and top school listings with 1-click Copy ID.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="shadow-md">
          <HiOutlinePlus className="w-5 h-5 mr-1.5" />
          {activeTab === 'tags' && 'Add Source Tag'}
          {activeTab === 'boards' && 'Add Education Board'}
          {activeTab === 'admission' && 'Add Admission Org'}
          {activeTab === 'schools' && 'Add Top School/College'}
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 bg-white px-4 rounded-xl shadow-sm gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tags')}
          className={clsx(
            'flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === 'tags'
              ? 'border-primary-600 text-primary-600 bg-primary-50/50 rounded-t-lg'
              : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          )}
        >
          <HiOutlineTag className="w-4 h-4" />
          <span>Source Tags</span>
        </button>

        <button
          onClick={() => setActiveTab('boards')}
          className={clsx(
            'flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === 'boards'
              ? 'border-primary-600 text-primary-600 bg-primary-50/50 rounded-t-lg'
              : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          )}
        >
          <HiOutlineLibrary className="w-4 h-4" />
          <span>Education Boards (বোর্ড)</span>
        </button>

        <button
          onClick={() => setActiveTab('admission')}
          className={clsx(
            'flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === 'admission'
              ? 'border-primary-600 text-primary-600 bg-primary-50/50 rounded-t-lg'
              : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          )}
        >
          <HiOutlineAcademicCap className="w-4 h-4" />
          <span>Admission Universities (ভর্তি পরীক্ষা)</span>
        </button>

        <button
          onClick={() => setActiveTab('schools')}
          className={clsx(
            'flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === 'schools'
              ? 'border-primary-600 text-primary-600 bg-primary-50/50 rounded-t-lg'
              : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          )}
        >
          <HiOutlineOfficeBuilding className="w-4 h-4" />
          <span>Top Schools & Colleges</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Entries</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{items.length}</p>
          </div>
          <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
            <HiOutlineTag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Active Entities</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {items.filter((i) => i.isActive).length}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <HiOutlineCheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Linked Questions</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{totalQuestions}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <HiOutlineAcademicCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search name, code, shortform..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-neutral-50">
            <button
              onClick={() => setViewMode('table')}
              className={clsx('p-2 text-sm transition-colors', viewMode === 'table' ? 'bg-white text-primary-600 shadow-xs font-semibold' : 'text-neutral-500')}
            >
              <HiOutlineViewList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={clsx('p-2 text-sm transition-colors', viewMode === 'grid' ? 'bg-white text-primary-600 shadow-xs font-semibold' : 'text-neutral-500')}
            >
              <HiOutlineViewGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content List */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-neutral-200 text-center text-neutral-500">
          Loading entities...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-neutral-200 text-center text-neutral-500">
          No records found.
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Name & Bengali Label</th>
                <th className="py-3.5 px-4">Short Form / Code</th>
                <th className="py-3.5 px-4">Object ID (Click to Copy)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Questions</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-neutral-900">{item.name}</div>
                    {item.nameBn && <div className="text-xs text-neutral-500">{item.nameBn}</div>}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 font-semibold">
                      {item.shortForm || item.code}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={(e) => handleCopyId(item._id, item.name, e)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-neutral-100 hover:bg-primary-50 text-neutral-700 hover:text-primary-700 rounded-md border border-neutral-200 transition-colors"
                      title="Click to copy ID"
                    >
                      {copiedId === item._id ? (
                        <>
                          <HiOutlineClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <HiOutlineClipboardCopy className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{item._id}</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => handleToggleActive(item, e)}
                      className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
                        item.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      )}
                    >
                      {item.isActive ? <HiOutlineCheckCircle className="w-3.5 h-3.5" /> : <HiOutlineXCircle className="w-3.5 h-3.5" />}
                      <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-center font-semibold text-neutral-700">
                    {item.questionCount || 0}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={(e) => handleOpenEdit(item, e)}
                      className="p-1.5 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item._id, item.name, e)}
                      className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item._id} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-neutral-900">{item.name}</h3>
                    {item.nameBn && <p className="text-xs text-neutral-500 mt-0.5">{item.nameBn}</p>}
                  </div>
                  <span className={clsx('px-2 py-0.5 text-xs font-medium rounded-full', item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600')}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-mono bg-neutral-100 border border-neutral-200 text-neutral-700 px-2 py-0.5 rounded font-semibold">
                    {item.shortForm || item.code}
                  </span>
                  <span className="text-xs text-neutral-500">{item.questionCount || 0} questions</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <button
                  onClick={(e) => handleCopyId(item._id, item.name, e)}
                  className="inline-flex items-center gap-1 text-xs font-mono text-neutral-600 hover:text-primary-600"
                >
                  <HiOutlineClipboardCopy className="w-3.5 h-3.5" />
                  <span>Copy ID</span>
                </button>

                <div className="space-x-1">
                  <button onClick={(e) => handleOpenEdit(item, e)} className="p-1 text-neutral-500 hover:text-primary-600">
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => handleDelete(item._id, item.name, e)} className="p-1 text-neutral-500 hover:text-red-600">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                <h3 className="font-bold text-neutral-900">
                  {editingItem ? 'Edit Entity' : 'Create New Entity'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    English Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka Board / Dhaka University"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Bengali Name</label>
                  <input
                    type="text"
                    placeholder="e.g. ঢাকা বোর্ড / ঢাকা বিশ্ববিদ্যালয়"
                    value={form.nameBn}
                    onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Short Form</label>
                    <input
                      type="text"
                      placeholder="e.g. ঢা.বো. / DU / MGCC"
                      value={form.shortForm}
                      onChange={(e) => setForm({ ...form, shortForm: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Code / Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. dhaka_board / du"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {activeTab === 'admission' && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Institution Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="university">General University</option>
                      <option value="medical">Medical College</option>
                      <option value="engineering">Engineering University</option>
                      <option value="other">Other Institution</option>
                    </select>
                  </div>
                )}

                {activeTab === 'schools' && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">District / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Dhaka, Mymensingh, Tangail"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-xs font-medium text-neutral-700">Active Entity</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Entity'}
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
