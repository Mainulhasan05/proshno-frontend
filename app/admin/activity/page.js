'use client';

import { useCallback, useEffect, useState } from 'react';
import { HiOutlineClipboardCheck, HiOutlineRefresh } from 'react-icons/hi';
import apiClient from '@/store/api/apiClient';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';

const methodStyle = { POST: 'bg-emerald-50 text-emerald-700', PUT: 'bg-sky-50 text-sky-700', PATCH: 'bg-amber-50 text-amber-700', DELETE: 'bg-rose-50 text-rose-700' };

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await apiClient.get('/admin-audit', { params: { page, method: method || undefined } });
      setLogs(response.data); setMeta(response.meta); setStatus('success');
    } catch { setStatus('error'); }
  }, [page, method]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-widest text-primary-600">Security trail</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">অ্যাডমিন কার্যক্রম</h1><p className="mt-1 text-sm text-neutral-500">অ্যাডমিন পরিবর্তনের সময়, পথ ও ফলাফল</p></div>
        <div className="flex gap-2"><select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }} className="min-h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm"><option value="">সব ধরন</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select><Button variant="outline" onClick={load}><HiOutlineRefresh className="h-4 w-4" /></Button></div>
      </div>
      {status === 'error' && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">কার্যক্রম লোড করা যায়নি। <button onClick={load} className="font-bold underline">আবার চেষ্টা করুন</button></div>}
      {status === 'loading' && !logs.length && <div className="space-y-3">{[1,2,3,4].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-white" />)}</div>}
      {status !== 'error' && <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {logs.length ? <div className="divide-y divide-neutral-100">{logs.map((log) => <div key={log._id} className="flex min-h-[76px] items-center gap-3 px-4 py-3 sm:px-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600"><HiOutlineClipboardCheck className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><b className="truncate text-sm">{log.adminId?.name || 'Admin'}</b><span className={['rounded px-2 py-0.5 text-[10px] font-bold', methodStyle[log.method] || 'bg-neutral-100'].join(' ')}>{log.method}</span><span className="text-[10px] text-neutral-400">HTTP {log.statusCode}</span></span><code className="mt-1 block truncate text-xs text-neutral-500">{log.path}</code></span><time className="hidden text-right text-[10px] leading-4 text-neutral-400 sm:block">{new Date(log.createdAt).toLocaleString('bn-BD')}</time></div>)}</div> : status === 'success' && <p className="p-12 text-center text-sm text-neutral-400">কোনো কার্যক্রম পাওয়া যায়নি</p>}
      </div>}
      <Pagination meta={meta} disabled={status === 'loading'} onPageChange={(value) => { setPage(value); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
    </div>
  );
}