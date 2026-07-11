'use client';

import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

export default function Pagination({ meta, onPageChange, disabled = false }) {
  if (!meta || meta.totalPages <= 1) return null;

  const page = Number(meta.page) || 1;
  const totalPages = Number(meta.totalPages) || 1;
  const end = Math.min(totalPages, Math.max(3, page + 1));
  const pages = [];

  for (let current = Math.max(1, end - 2); current <= end; current += 1) pages.push(current);

  return (
    <nav aria-label="পৃষ্ঠা পরিবর্তন" className="mt-6 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-xs text-neutral-500 sm:text-left">
        মোট <span className="font-bold text-neutral-700">{meta.total}</span>টি ফলাফল · পৃষ্ঠা {page}/{totalPages}
      </p>
      <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1} aria-label="আগের পৃষ্ঠা" className="flex h-11 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40">
          <HiOutlineChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center justify-center gap-1">
          {pages.map((item) => (
            <button key={item} type="button" onClick={() => onPageChange(item)} disabled={disabled} aria-current={item === page ? 'page' : undefined} className={['h-10 min-w-10 rounded-xl px-2 text-sm font-bold transition-colors', item === page ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'].join(' ')}>
              {item}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages} aria-label="পরের পৃষ্ঠা" className="flex h-11 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40">
          <HiOutlineChevronRight className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}