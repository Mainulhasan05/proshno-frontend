'use client';

import { useCallback, useEffect, useState } from 'react';
import { 
  HiOutlineClipboardCheck, 
  HiOutlineRefresh, 
  HiOutlineUserGroup, 
  HiOutlineShieldCheck,
  HiOutlineDeviceMobile,
  HiOutlineGlobeAlt
} from 'react-icons/hi';
import apiClient from '@/store/api/apiClient';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';

const methodStyle = { 
  POST: 'bg-emerald-50 text-emerald-700 border border-emerald-100', 
  PUT: 'bg-sky-50 text-sky-700 border border-sky-100', 
  PATCH: 'bg-amber-50 text-amber-700 border border-amber-100', 
  DELETE: 'bg-rose-50 text-rose-700 border border-rose-100' 
};

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'teacher'
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const endpoint = activeTab === 'admin' ? '/admin-audit' : '/admin-audit/teachers';
      const response = await apiClient.get(endpoint, { 
        params: { page, method: method || undefined } 
      });
      setLogs(response.data); 
      setMeta(response.meta); 
      setStatus('success');
    } catch (err) { 
      console.error(err);
      setStatus('error'); 
    }
  }, [page, method, activeTab]);

  useEffect(() => { 
    load(); 
  }, [load]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setMethod('');
    setLogs([]);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b pb-5 border-neutral-200">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Audit & Security</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl text-neutral-800">কার্যক্রম ও লগ ট্র্যাকিং</h1>
          <p className="mt-1 text-sm text-neutral-500">অ্যাডমিন ও শিক্ষকদের কার্যক্রম, ব্যবহারের ডিভাইস ও আইপি অ্যাড্রেস লগ</p>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <select 
            value={method} 
            onChange={(e) => { setMethod(e.target.value); setPage(1); }} 
            className="min-h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">সব ধরন</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
          <Button variant="outline" onClick={load}>
            <HiOutlineRefresh className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-px">
        <button
          onClick={() => handleTabChange('admin')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'admin'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <HiOutlineShieldCheck className="h-4 w-4" />
          অ্যাডমিন কার্যক্রম
        </button>
        <button
          onClick={() => handleTabChange('teacher')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'teacher'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <HiOutlineUserGroup className="h-4 w-4" />
          শিক্ষক কার্যক্রম
        </button>
      </div>

      {/* Error State */}
      {status === 'error' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          কার্যক্রম লগ লোড করা যায়নি। <button onClick={load} className="font-bold underline">আবার চেষ্টা করুন</button>
        </div>
      )}

      {/* Loading Shimmer */}
      {status === 'loading' && !logs.length && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-white border border-neutral-200" />
          ))}
        </div>
      )}

      {/* Logs Table / List */}
      {status !== 'error' && (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {logs.length ? (
            <div className="divide-y divide-neutral-100">
              {logs.map((log) => (
                <div key={log._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:px-5 hover:bg-neutral-50/50 transition-colors">
                  
                  {/* Action Icon */}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    <HiOutlineClipboardCheck className="h-5 w-5" />
                  </span>

                  {/* Log details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    
                    {/* User and method badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="text-sm text-neutral-800">
                        {activeTab === 'admin' 
                          ? (log.adminId?.name || 'Super Admin') 
                          : (log.teacherId?.name || 'শিক্ষক (Teacher)')
                        }
                      </b>
                      
                      {activeTab === 'teacher' && log.teacherId?.institutionName && (
                        <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                          {log.teacherId.institutionName}
                        </span>
                      )}

                      <span className={['rounded px-2 py-0.5 text-[10px] font-bold uppercase', methodStyle[log.method] || 'bg-neutral-100'].join(' ')}>
                        {log.method}
                      </span>
                      <span className="text-[10px] text-neutral-400">HTTP {log.statusCode}</span>
                    </div>

                    {/* Human friendly action for teachers */}
                    {activeTab === 'teacher' && log.action && (
                      <p className="text-sm font-semibold text-neutral-700">{log.action}</p>
                    )}

                    {/* Path code */}
                    <code className="block truncate text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded font-mono border border-neutral-100 max-w-max">
                      {log.path}
                    </code>

                    {/* Device & IP Info */}
                    {activeTab === 'teacher' && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1">
                          <HiOutlineDeviceMobile className="h-3.5 w-3.5 text-neutral-400" />
                          ডিভাইস: {log.device || 'Unknown Device'}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineGlobeAlt className="h-3.5 w-3.5 text-neutral-400" />
                          আইপি: {log.ip || 'Unknown IP'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <time className="text-[10px] leading-4 text-neutral-400 whitespace-nowrap self-start sm:self-center mt-1 sm:mt-0">
                    {new Date(log.createdAt).toLocaleString('bn-BD')}
                  </time>

                </div>
              ))}
            </div>
          ) : (
            status === 'success' && (
              <div className="p-12 text-center text-sm text-neutral-400">
                কোনো কার্যক্রম রেকর্ড পাওয়া যায়নি
              </div>
            )
          )}
        </div>
      )}

      {/* Pagination */}
      <Pagination 
        meta={meta} 
        disabled={status === 'loading'} 
        onPageChange={(value) => { 
          setPage(value); 
          window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }} 
      />

    </div>
  );
}