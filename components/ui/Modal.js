'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={['relative flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl', maxWidth].join(' ')}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3.5 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-neutral-200 sm:hidden" />
                <h2 id="modal-title" className="truncate text-base font-bold text-neutral-800 sm:text-lg">{title}</h2>
              </div>
              <button type="button" onClick={onClose} aria-label="বন্ধ করুন" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}