'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineExclamation, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'মুছে ফেলতে নিশ্চিত?',
  message = 'এই প্রক্রিয়াটি বাতিল করা যাবে না। আপনি কি নিশ্চিত?',
  confirmText = 'হ্যাঁ, মুছুন',
  cancelText = 'বাতিল',
  variant = 'danger',
  isLoading = false,
  itemDetails = null,
}) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, isLoading]);

  const iconStyles = {
    danger: {
      bg: 'bg-rose-100/80 text-rose-600 ring-8 ring-rose-50',
      icon: HiOutlineTrash,
    },
    warning: {
      bg: 'bg-amber-100/80 text-amber-600 ring-8 ring-amber-50',
      icon: HiOutlineExclamation,
    },
    primary: {
      bg: 'bg-primary-100/80 text-primary-600 ring-8 ring-primary-50',
      icon: HiOutlineExclamation,
    },
  };

  const currentIconConfig = iconStyles[variant] || iconStyles.danger;
  const IconComponent = currentIconConfig.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm"
            onClick={() => {
              if (!isLoading) onClose();
            }}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              aria-label="বন্ধ করুন"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors disabled:opacity-50"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>

            {/* Header Content */}
            <div className="flex flex-col items-center text-center">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${currentIconConfig.bg} transition-transform duration-200`}>
                <IconComponent className="h-6 w-6" />
              </div>

              <h3 id="confirm-modal-title" className="text-lg font-bold text-neutral-800 sm:text-xl">
                {title}
              </h3>

              <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-xs leading-relaxed">
                {message}
              </p>
            </div>

            {/* Optional Item Details Card */}
            {itemDetails && (
              <div className="mt-4 rounded-xl bg-neutral-50 p-3.5 border border-neutral-200/70 text-left">
                {itemDetails}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {cancelText}
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                size="md"
                onClick={onConfirm}
                loading={isLoading}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
