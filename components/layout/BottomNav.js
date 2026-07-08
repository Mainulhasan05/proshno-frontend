'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineDotsHorizontal,
} from 'react-icons/hi';
import { useState } from 'react';

// Primary 5 tabs shown in bottom nav
const primaryTabs = [
  { label: 'হোম', href: '/teacher', icon: HiOutlineHome },
  { label: 'প্যাকেজ', href: '/teacher/packages', icon: HiOutlineCube },
  { label: 'কন্টেন্ট', href: '/teacher/my-content', icon: HiOutlineBookOpen },
  { label: 'প্রশ্ন সেট', href: '/teacher/question-sets', icon: HiOutlineClipboardList },
  { label: 'আরও', href: null, icon: HiOutlineDotsHorizontal, isMore: true },
];

// "More" menu items
const moreItems = [
  { label: 'আমার ক্রয়', href: '/teacher/purchases', icon: HiOutlineCube },
  { label: 'OMR শিট', href: '/teacher/omr', icon: HiOutlineClipboardList },
  { label: 'শিক্ষার্থী', href: '/teacher/students', icon: HiOutlineUsers },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isActive = (href) => {
    if (!href) return false;
    if (href === '/teacher') return pathname === href;
    return pathname.startsWith(href);
  };

  // Check if any "more" item is active
  const moreActive = moreItems.some((item) => isActive(item.href));

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[98] bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More menu sheet */}
      {showMore && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[99] lg:hidden"
        >
          <div className="mx-3 mb-2 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100">
              <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-700 text-center">আরও অপশন</p>
            </div>
            <div className="py-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={clsx(
                      'flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors',
                      active
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    )}
                  >
                    <Icon className={clsx('h-5 w-5', active ? 'text-primary-600' : 'text-neutral-400')} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden">
        <div className="bg-white/95 backdrop-blur-lg border-t border-neutral-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
          <div
            className="flex items-stretch justify-around"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.isMore ? moreActive || showMore : isActive(tab.href);

              if (tab.isMore) {
                return (
                  <button
                    key="more"
                    onClick={() => setShowMore(!showMore)}
                    className={clsx(
                      'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[3.5rem] transition-colors relative',
                      active ? 'text-primary-600' : 'text-neutral-400'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
                    {active && (
                      <motion.div
                        layoutId="bottomnav-active"
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary-600 rounded-b-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={clsx(
                    'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[3.5rem] transition-colors relative',
                    active ? 'text-primary-600' : 'text-neutral-400'
                  )}
                >
                  <Icon className={clsx('h-5 w-5', active && 'scale-110')} />
                  <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
                  {active && (
                    <motion.div
                      layoutId="bottomnav-active"
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary-600 rounded-b-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
