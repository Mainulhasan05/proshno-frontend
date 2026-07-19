'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '@/store/api/apiClient';
import Button from '@/components/ui/Button';
import {
  HiOutlineCloud,
  HiOutlineServer,
  HiOutlineUsers,
  HiOutlineBan,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineSearch,
  HiOutlineExclamation,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineDatabase,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineCheckCircle,
  HiOutlineGlobe,
} from 'react-icons/hi';

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function StorageManagementPage() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await apiClient.get('/storage-allocations/stats');
      setStats(res.data);
    } catch { setStats(null); }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const tabs = [
    { id: 'accounts', label: 'R2 Accounts', icon: HiOutlineServer },
    { id: 'teachers', label: 'Teacher Storage', icon: HiOutlineUsers },
    { id: 'institutions', label: 'Institution Overview', icon: HiOutlineChartBar },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mx-auto max-w-[1400px]">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                <HiOutlineCloud className="h-4 w-4 text-white" />
              </span>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-indigo-600">Storage Infrastructure</p>
            </div>
            <h1 className="text-[1.65rem] font-extrabold text-neutral-900 leading-tight">Storage Management</h1>
            <p className="mt-1 text-[13px] text-neutral-500">Manage R2 accounts, teacher quotas & institutional usage analytics</p>
          </div>
        </div>
      </header>

      {/* ── Dashboard Metrics ──────────────────────────────── */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard icon={HiOutlineServer} label="R2 Accounts" value={statsLoading ? '—' : `${stats?.r2Accounts?.active ?? 0}/${stats?.r2Accounts?.total ?? 0}`} badge="Active / Total" gradient="from-blue-500 to-cyan-500" />
        <MetricCard icon={HiOutlineDatabase} label="Total Storage" value={statsLoading ? '—' : formatMB(stats?.capacity?.totalMB)} badge={statsLoading ? '' : `${stats?.capacity?.usagePercent ?? 0}% used`} gradient="from-emerald-500 to-teal-500" />
        <MetricCard icon={HiOutlineUsers} label="Teachers" value={statsLoading ? '—' : stats?.teachers?.total ?? 0} badge="With allocation" gradient="from-violet-500 to-purple-500" />
        <MetricCard icon={HiOutlineBan} label="Blocked" value={statsLoading ? '—' : stats?.teachers?.blocked ?? 0} badge="Teachers" gradient="from-rose-500 to-pink-500" />
        <DefaultLimitCard defaultLimit={stats?.defaultStorageLimitMB} loading={statsLoading} onUpdate={loadStats} />
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-neutral-200/80 bg-white p-1.5 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold transition-all duration-200 ${active ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'}`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'accounts' && <motion.div key="accounts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><R2AccountsTab onStatsChange={loadStats} /></motion.div>}
        {activeTab === 'teachers' && <motion.div key="teachers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><TeacherStorageTab onStatsChange={loadStats} /></motion.div>}
        {activeTab === 'institutions' && <motion.div key="institutions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><InstitutionSummaryTab /></motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  METRIC CARD
// ═══════════════════════════════════════════════════════════════
function MetricCard({ icon: Icon, label, value, badge, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</p>
          <p className="mt-1.5 text-2xl font-black text-neutral-900 leading-none">{value}</p>
          {badge && <p className="mt-1.5 text-[11px] font-medium text-neutral-400">{badge}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
          <Icon className="h-5 w-5 text-white" />
        </span>
      </div>
      <div className={`absolute -bottom-1 -right-1 h-16 w-16 rounded-full bg-gradient-to-br ${gradient} opacity-[0.04] transition-opacity group-hover:opacity-[0.08]`} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  DEFAULT LIMIT CARD (inline-editable)
// ═══════════════════════════════════════════════════════════════
function DefaultLimitCard({ defaultLimit, loading, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (defaultLimit !== undefined) setValue(String(defaultLimit)); }, [defaultLimit]);

  const save = async () => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return toast.error('Please enter a valid value');
    setSaving(true);
    try {
      await apiClient.patch('/storage-allocations/default-limit', { defaultStorageLimitMB: num });
      toast.success('Default limit updated');
      setEditing(false);
      onUpdate();
    } catch (err) { toast.error(err?.error?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Default Free Limit</p>
          {editing ? (
            <div className="mt-2 flex items-center gap-1.5">
              <input type="number" min="0" step="1" value={value} onChange={(e) => setValue(e.target.value)} className="w-20 rounded-lg border border-indigo-300 px-2.5 py-1.5 text-sm font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-indigo-200" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditing(false); setValue(String(defaultLimit)); } }} />
              <span className="text-xs font-semibold text-neutral-400">MB</span>
              <button onClick={save} disabled={saving} className="rounded-lg bg-indigo-600 p-1.5 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"><HiOutlineCheck className="h-3.5 w-3.5" /></button>
              <button onClick={() => { setEditing(false); setValue(String(defaultLimit)); }} className="rounded-lg bg-neutral-100 p-1.5 text-neutral-500 hover:bg-neutral-200 transition-colors"><HiOutlineX className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center gap-2">
              <p className="text-2xl font-black text-neutral-900 leading-none">{loading ? '—' : `${defaultLimit ?? 20} MB`}</p>
              <button onClick={() => setEditing(true)} className="rounded-lg p-1 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500 transition-colors"><HiOutlinePencil className="h-3.5 w-3.5" /></button>
            </div>
          )}
          <p className="mt-1.5 text-[11px] font-medium text-neutral-400">For new teachers</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
          <HiOutlineCog className="h-5 w-5 text-white" />
        </span>
      </div>
      <div className="absolute -bottom-1 -right-1 h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 opacity-[0.04] transition-opacity group-hover:opacity-[0.08]" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 1: R2 ACCOUNTS
// ═══════════════════════════════════════════════════════════════
function R2AccountsTab({ onStatsChange }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [testingId, setTestingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/r2-accounts');
      setAccounts(res.data || []);
    } catch { toast.error('Failed to load R2 accounts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const testConnection = async (id) => {
    setTestingId(id);
    try {
      const res = await apiClient.post(`/r2-accounts/${id}/test`);
      if (res.data.success) toast.success('Connection successful');
      else toast.error(`Connection failed: ${res.data.message}`);
    } catch (err) { toast.error(err?.error?.message || 'Connection test failed'); }
    finally { setTestingId(null); }
  };

  const deleteAccount = async (id, name) => {
    if (!confirm(`Delete account "${name}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/r2-accounts/${id}`);
      toast.success('Account deleted');
      load(); onStatsChange();
    } catch (err) { toast.error(err?.error?.message || 'Delete failed'); }
  };

  const recalculate = async (id) => {
    try {
      await apiClient.post(`/r2-accounts/${id}/recalculate`);
      toast.success('Usage recalculated');
      load(); onStatsChange();
    } catch (err) { toast.error(err?.error?.message || 'Recalculation failed'); }
  };

  if (loading) return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="h-60 animate-pulse rounded-2xl bg-white border border-neutral-100" />)}</div>;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Connected Accounts</h2>
          <p className="text-xs text-neutral-400">{accounts.length} account{accounts.length !== 1 ? 's' : ''} configured</p>
        </div>
        <Button onClick={() => { setEditingAccount(null); setShowModal(true); }}>
          <HiOutlinePlus className="h-4 w-4" /> Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex min-h-[35vh] items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white">
          <div className="text-center px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50">
              <HiOutlineCloud className="h-8 w-8 text-indigo-400" />
            </div>
            <p className="mt-4 text-lg font-bold text-neutral-700">No R2 Accounts</p>
            <p className="mt-1.5 text-sm text-neutral-400 max-w-xs">Connect your first Cloudflare R2 account to start managing file storage for teachers.</p>
            <Button onClick={() => { setEditingAccount(null); setShowModal(true); }} className="mt-5">
              <HiOutlinePlus className="h-4 w-4" /> Add R2 Account
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((acc) => (
            <R2AccountCard key={acc._id} account={acc} testing={testingId === acc._id} onTest={() => testConnection(acc._id)} onEdit={() => { setEditingAccount(acc); setShowModal(true); }} onDelete={() => deleteAccount(acc._id, acc.name)} onRecalculate={() => recalculate(acc._id)} />
          ))}
        </div>
      )}

      {showModal && <R2AccountModal account={editingAccount} onClose={() => { setShowModal(false); setEditingAccount(null); }} onSaved={() => { setShowModal(false); setEditingAccount(null); load(); onStatsChange(); }} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  R2 ACCOUNT CARD
// ═══════════════════════════════════════════════════════════════
function R2AccountCard({ account, testing, onTest, onEdit, onDelete, onRecalculate }) {
  const percent = account.totalCapacityMB > 0 ? Math.round((account.usedStorageMB / account.totalCapacityMB) * 100) : 0;
  const ring = percent > 80 ? 'text-rose-500' : percent > 60 ? 'text-amber-500' : 'text-emerald-500';
  const bar = percent > 80 ? 'from-rose-500 to-rose-400' : percent > 60 ? 'from-amber-500 to-amber-400' : 'from-emerald-500 to-teal-400';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all hover:shadow-lg hover:border-neutral-300/80">
      {/* Status indicator */}
      <div className="absolute right-4 top-4 z-10">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm ${account.isActive ? 'bg-emerald-50/90 text-emerald-700 ring-1 ring-emerald-200/60' : 'bg-neutral-100/90 text-neutral-500 ring-1 ring-neutral-200/60'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${account.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
          {account.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="p-6">
        {/* Name & metadata */}
        <div className="mb-5 pr-20">
          <h3 className="text-[15px] font-bold text-neutral-900">{account.name}</h3>
          <div className="mt-2 space-y-1">
            <p className="flex items-center gap-1.5 text-[11px] text-neutral-400 truncate"><HiOutlineDatabase className="h-3 w-3 shrink-0" /> {account.bucketName}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-neutral-400 truncate"><HiOutlineGlobe className="h-3 w-3 shrink-0" /> {account.endpoint}</p>
          </div>
        </div>

        {/* Gauge + stats */}
        <div className="flex items-center gap-5">
          <div className="relative h-[72px] w-[72px] shrink-0">
            <svg className="h-[72px] w-[72px] -rotate-90" viewBox="0 0 36 36">
              <path className="text-neutral-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path className={ring} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${percent}, 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-neutral-800">{percent}%</span>
          </div>
          <div>
            <p className="text-lg font-black text-neutral-800">{formatMB(account.usedStorageMB)}</p>
            <p className="text-[11px] text-neutral-400">of {formatMB(account.totalCapacityMB)}</p>
          </div>
        </div>

        {/* Usage bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-700`} style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
        <button onClick={onTest} disabled={testing} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50">
          {testing ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /> : <HiOutlineShieldCheck className="h-4 w-4" />}
          Test
        </button>
        <div className="flex gap-0.5">
          <button onClick={onRecalculate} className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600" title="Recalculate usage"><HiOutlineRefresh className="h-4 w-4" /></button>
          <button onClick={onEdit} className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600" title="Edit"><HiOutlinePencil className="h-4 w-4" /></button>
          <button onClick={onDelete} className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600" title="Delete"><HiOutlineTrash className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  R2 ACCOUNT MODAL (Create / Edit)
// ═══════════════════════════════════════════════════════════════
function R2AccountModal({ account, onClose, onSaved }) {
  const isEdit = !!account;
  const [form, setForm] = useState({
    name: account?.name || '', accountId: account?.accountId || '', accessKeyId: account?.accessKeyId || '',
    secretAccessKey: '', bucketName: account?.bucketName || '', endpoint: account?.endpoint || '',
    totalCapacityMB: account?.totalCapacityMB || 10240, isActive: account?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const testConn = async () => {
    if (isEdit && account?._id) {
      setTesting(true); setTestResult(null);
      try { const r = await apiClient.post(`/r2-accounts/${account._id}/test`); setTestResult(r.data); }
      catch { setTestResult({ success: false, message: 'Test failed' }); }
      setTesting(false);
    } else {
      setTestResult({ success: true, message: 'Connection will be verified on save' });
    }
  };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const body = { ...form };
      if (isEdit && !body.secretAccessKey) delete body.secretAccessKey;
      if (isEdit) { await apiClient.put(`/r2-accounts/${account._id}`, body); toast.success('Account updated'); }
      else { await apiClient.post('/r2-accounts', body); toast.success('Account created'); }
      onSaved();
    } catch (err) { toast.error(err?.error?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{isEdit ? 'Edit R2 Account' : 'Add R2 Account'}</h2>
            <p className="text-xs text-neutral-400 mt-0.5">{isEdit ? 'Update credentials & settings' : 'Connect a new Cloudflare R2 bucket'}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"><HiOutlineX className="h-5 w-5" /></button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-6">
          <InputField label="Account Name" required value={form.name} onChange={(v) => change('name', v)} placeholder="e.g. Primary Free Account" />

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Cloudflare Account ID" required value={form.accountId} onChange={(v) => change('accountId', v)} />
            <InputField label="Bucket Name" required value={form.bucketName} onChange={(v) => change('bucketName', v)} placeholder="proshno-uploads" />
          </div>

          <InputField label="R2 Endpoint URL" required value={form.endpoint} onChange={(v) => change('endpoint', v)} type="url" placeholder="https://<account-id>.r2.cloudflarestorage.com" />

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Access Key ID" required={!isEdit} value={form.accessKeyId} onChange={(v) => change('accessKeyId', v)} mono />
            <InputField label={isEdit ? 'Secret Key (leave blank to keep)' : 'Secret Access Key'} required={!isEdit} value={form.secretAccessKey} onChange={(v) => change('secretAccessKey', v)} type="password" mono placeholder={isEdit ? '••••••••' : ''} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <InputField label="Total Capacity (MB)" value={form.totalCapacityMB} onChange={(v) => change('totalCapacityMB', parseInt(v) || 0)} type="number" />
              <p className="mt-1 text-[10px] text-neutral-400">Free tier: 10,240 MB (10 GB)</p>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-neutral-700">Status</label>
              <label className="mt-2.5 flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={form.isActive} onChange={(e) => change('isActive', e.target.checked)} className="sr-only" />
                <span className={`relative h-[26px] w-[46px] rounded-full transition-colors duration-200 ${form.isActive ? 'bg-indigo-600' : 'bg-neutral-300'}`}>
                  <span className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.isActive ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
                </span>
                <span className="text-sm font-medium text-neutral-700">{form.isActive ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          {/* Connection test */}
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4">
            <button type="button" onClick={testConn} disabled={testing} className="flex items-center gap-2 text-[13px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors">
              {testing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /> : <HiOutlineShieldCheck className="h-4 w-4" />}
              Test Connection
            </button>
            {testResult && <p className={`mt-2 text-xs font-semibold ${testResult.success ? 'text-emerald-600' : 'text-rose-600'}`}>{testResult.success ? '✓' : '✗'} {testResult.message}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}><HiOutlineCheckCircle className="h-4 w-4" /> {isEdit ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 2: TEACHER STORAGE
// ═══════════════════════════════════════════════════════════════
function TeacherStorageTab({ onStatsChange }) {
  const [allocations, setAllocations] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBlocked, setFilterBlocked] = useState('');
  const [r2Accounts, setR2Accounts] = useState([]);
  const [filterR2, setFilterR2] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [blockModal, setBlockModal] = useState(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (search) params.search = search;
      if (filterBlocked) params.isBlocked = filterBlocked;
      if (filterR2) params.r2AccountId = filterR2;
      const res = await apiClient.get('/storage-allocations', { params });
      setAllocations(res.data || []);
      setPagination(res.meta || {});
    } catch { toast.error('Failed to load allocations'); }
    finally { setLoading(false); }
  }, [search, filterBlocked, filterR2]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { apiClient.get('/r2-accounts').then((r) => setR2Accounts(r.data || [])).catch(() => {}); }, []);

  const handleBlock = async (teacherId, reason) => {
    try { await apiClient.patch(`/storage-allocations/${teacherId}/block`, { reason }); toast.success('Teacher storage blocked'); setBlockModal(null); load(); onStatsChange(); }
    catch (err) { toast.error(err?.error?.message || 'Block failed'); }
  };
  const handleUnblock = async (teacherId) => {
    try { await apiClient.patch(`/storage-allocations/${teacherId}/unblock`); toast.success('Teacher storage unblocked'); load(); onStatsChange(); }
    catch (err) { toast.error(err?.error?.message || 'Unblock failed'); }
  };
  const handleUpdateLimit = async (teacherId, newLimit) => {
    try { await apiClient.patch(`/storage-allocations/${teacherId}/limit`, { storageLimitMB: newLimit }); toast.success('Limit updated'); setEditModal(null); load(); onStatsChange(); }
    catch (err) { toast.error(err?.error?.message || 'Update failed'); }
  };

  return (
    <div>
      {/* Filters bar */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or institution..." className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-[13px] outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100" />
        </div>
        <select value={filterBlocked} onChange={(e) => setFilterBlocked(e.target.value)} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] font-medium text-neutral-600 outline-none transition-colors focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
          <option value="">All Status</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>
        {r2Accounts.length > 0 && (
          <select value={filterR2} onChange={(e) => setFilterR2(e.target.value)} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] font-medium text-neutral-600 outline-none transition-colors focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
            <option value="">All Accounts</option>
            {r2Accounts.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-400">Teacher</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-400 hidden md:table-cell">Institution</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-400 hidden lg:table-cell">R2 Account</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-400">Usage</th>
                <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-400">Status</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-5"><div className="h-4 w-full animate-pulse rounded-lg bg-neutral-100" /></td></tr>
              )) : allocations.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-16 text-center">
                  <HiOutlineUsers className="mx-auto h-8 w-8 text-neutral-300" />
                  <p className="mt-2 text-sm font-semibold text-neutral-500">No allocations found</p>
                  <p className="text-xs text-neutral-400">Storage allocations appear when teachers register</p>
                </td></tr>
              ) : allocations.map((alloc) => (
                <TeacherRow key={alloc._id} alloc={alloc} onEditLimit={() => setEditModal(alloc)} onBlock={() => setBlockModal(alloc)} onUnblock={() => handleUnblock(alloc.teacher?._id || alloc.teacherId?._id)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => load(p)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${pagination.page === p ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}>{p}</button>
          ))}
        </div>
      )}

      {editModal && <EditLimitModal alloc={editModal} onClose={() => setEditModal(null)} onSave={handleUpdateLimit} />}
      {blockModal && <BlockTeacherModal alloc={blockModal} onClose={() => setBlockModal(null)} onBlock={handleBlock} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TEACHER TABLE ROW
// ═══════════════════════════════════════════════════════════════
function TeacherRow({ alloc, onEditLimit, onBlock, onUnblock }) {
  const teacher = alloc.teacher || alloc.teacherId || {};
  const r2 = alloc.r2Account || alloc.r2AccountId || {};
  const percent = alloc.usagePercent || 0;
  const bar = percent > 80 ? 'from-rose-500 to-rose-400' : percent > 60 ? 'from-amber-500 to-amber-400' : 'from-emerald-500 to-teal-400';

  return (
    <tr className="group transition-colors hover:bg-neutral-50/60">
      <td className="px-5 py-4">
        <p className="font-semibold text-neutral-800">{teacher.name || 'N/A'}</p>
        <p className="text-[11px] text-neutral-400">{teacher.email}</p>
      </td>
      <td className="px-5 py-4 hidden md:table-cell">
        <p className="text-neutral-600">{teacher.institutionName || <span className="text-neutral-300 italic">Not set</span>}</p>
      </td>
      <td className="px-5 py-4 hidden lg:table-cell">
        {r2.name ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 ring-1 ring-blue-200/50">
            <HiOutlineServer className="h-3 w-3" /> {r2.name}
          </span>
        ) : <span className="text-[11px] text-neutral-300">Unassigned</span>}
      </td>
      <td className="px-5 py-4">
        <div className="w-36">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-neutral-700">{(alloc.usedStorageMB || 0).toFixed(1)} MB</span>
            <span className="text-neutral-400">/ {alloc.storageLimitMB} MB</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-500`} style={{ width: `${Math.min(percent, 100)}%` }} />
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-neutral-400">{percent}%</span>
            {alloc.isCustomLimit && <span className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-bold text-amber-600 ring-1 ring-amber-200/50">Custom</span>}
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-center">
        {alloc.isBlocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200/50">
            <HiOutlineLockClosed className="h-3 w-3" /> Blocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200/50">
            <HiOutlineLockOpen className="h-3 w-3" /> Active
          </span>
        )}
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEditLimit} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600" title="Edit limit"><HiOutlinePencil className="h-4 w-4" /></button>
          {alloc.isBlocked ? (
            <button onClick={onUnblock} className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-50 hover:text-emerald-700" title="Unblock"><HiOutlineLockOpen className="h-4 w-4" /></button>
          ) : (
            <button onClick={onBlock} className="rounded-lg p-2 text-neutral-400 hover:bg-rose-50 hover:text-rose-600" title="Block"><HiOutlineBan className="h-4 w-4" /></button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EDIT LIMIT MODAL
// ═══════════════════════════════════════════════════════════════
function EditLimitModal({ alloc, onClose, onSave }) {
  const teacher = alloc.teacher || alloc.teacherId || {};
  const [limit, setLimit] = useState(alloc.storageLimitMB || 20);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (limit < 0) return toast.error('Limit cannot be negative');
    setSaving(true);
    await onSave(teacher._id, parseFloat(limit));
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-neutral-100 px-6 py-5">
          <h3 className="text-[15px] font-bold text-neutral-900">Update Storage Limit</h3>
          <p className="text-xs text-neutral-400 mt-0.5">{teacher.name} — {teacher.email}</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-2">New Limit (MB)</label>
            <input type="number" min="0" step="1" value={limit} onChange={(e) => setLimit(e.target.value)} className="modal-input" autoFocus />
            <p className="mt-1.5 text-[11px] text-neutral-400">Current usage: {(alloc.usedStorageMB || 0).toFixed(2)} MB</p>
          </div>
          <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" loading={saving}>Update</Button></div>
        </form>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  BLOCK TEACHER MODAL
// ═══════════════════════════════════════════════════════════════
function BlockTeacherModal({ alloc, onClose, onBlock }) {
  const teacher = alloc.teacher || alloc.teacherId || {};
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    await onBlock(teacher._id, reason);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-neutral-100 px-6 py-5">
          <h3 className="text-[15px] font-bold text-rose-700">Block Storage Access</h3>
          <p className="text-xs text-neutral-400 mt-0.5">{teacher.name} — {teacher.email}</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-100 p-3.5">
            <HiOutlineExclamation className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
            <p className="text-[12px] text-rose-700 leading-relaxed">This teacher will no longer be able to upload files. Existing files will remain accessible.</p>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-2">Reason (optional)</label>
            <textarea rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter the reason for blocking..." className="modal-input !h-auto py-3" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-50">
              {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <HiOutlineBan className="h-4 w-4" />}
              Block Access
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 3: INSTITUTION OVERVIEW
// ═══════════════════════════════════════════════════════════════
function InstitutionSummaryTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/storage-allocations/institutions')
      .then((r) => setData(r.data || []))
      .catch(() => toast.error('Failed to load institution data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white border border-neutral-100" />)}</div>;

  if (data.length === 0) return (
    <div className="flex min-h-[35vh] items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white">
      <div className="text-center px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50">
          <HiOutlineChartBar className="h-8 w-8 text-indigo-400" />
        </div>
        <p className="mt-4 text-lg font-bold text-neutral-700">No Institution Data</p>
        <p className="mt-1.5 text-sm text-neutral-400 max-w-xs">Institution analytics will appear as teachers with institutions register on the platform.</p>
      </div>
    </div>
  );

  const maxUsed = Math.max(...data.map((d) => d.totalUsedMB), 1);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-100 px-6 py-5">
        <h2 className="text-[15px] font-bold text-neutral-900">Usage by Institution</h2>
        <p className="text-xs text-neutral-400 mt-0.5">{data.length} institution{data.length !== 1 ? 's' : ''} tracked</p>
      </div>
      <div className="divide-y divide-neutral-100">
        {data.map((inst, idx) => {
          const bar = inst.usagePercent > 80 ? 'from-rose-500 to-rose-400' : inst.usagePercent > 50 ? 'from-amber-500 to-amber-400' : 'from-indigo-500 to-violet-500';
          return (
            <div key={idx} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-neutral-50/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black text-white shadow-sm shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[13px] font-bold text-neutral-800 truncate">{inst.institutionName}</p>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-400 shrink-0 ml-3">
                    <span className="font-medium">{inst.teacherCount} teacher{inst.teacherCount !== 1 ? 's' : ''}</span>
                    {inst.blockedCount > 0 && <span className="font-bold text-rose-500">{inst.blockedCount} blocked</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-700`} style={{ width: `${Math.max((inst.totalUsedMB / maxUsed) * 100, 3)}%` }} />
                  </div>
                  <span className="shrink-0 text-[12px] font-bold text-neutral-600 w-32 text-right">
                    {formatMB(inst.totalUsedMB)} / {formatMB(inst.totalAllocatedMB)}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${inst.usagePercent > 80 ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/50' : inst.usagePercent > 50 ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50'}`}>
                    {inst.usagePercent}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
function InputField({ label, required, value, onChange, type = 'text', placeholder, mono }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`modal-input ${mono ? 'font-mono text-xs tracking-wide' : ''}`}
      />
    </label>
  );
}

function formatMB(mb) {
  if (mb === undefined || mb === null) return '0 MB';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Number(mb).toFixed(1)} MB`;
}
