'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import {
  HiOutlineHome,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineQuestionMarkCircle,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineCog,
  HiOutlineShoppingCart,
  HiOutlineClipboardList,
  HiOutlineX,
} from 'react-icons/hi';

const adminMenu = [
  { label: 'ড্যাশবোর্ড', href: '/admin', icon: HiOutlineHome },
  { label: 'ক্লাস', href: '/admin/classes', icon: HiOutlineAcademicCap },
  { label: 'বিষয়', href: '/admin/subjects', icon: HiOutlineBookOpen },
  { label: 'অধ্যায়', href: '/admin/chapters', icon: HiOutlineClipboardList },
  { label: 'প্রশ্ন ব্যাংক', href: '/admin/questions', icon: HiOutlineQuestionMarkCircle },
  { label: 'প্যাকেজ', href: '/admin/packages', icon: HiOutlineCube },
  { label: 'শিক্ষক', href: '/admin/teachers', icon: HiOutlineUsers },
  { label: 'ক্রয় ব্যবস্থাপনা', href: '/admin/purchases', icon: HiOutlineShoppingCart },
  { label: 'OMR টেমপ্লেট', href: '/admin/omr-templates', icon: HiOutlineDocumentText },
  { label: 'পেজ ব্যবস্থাপনা', href: '/admin/pages', icon: HiOutlineDocumentText },
  { label: 'সেটিংস', href: '/admin/settings', icon: HiOutlineCog },
];

const teacherMenu = [
  { label: 'ড্যাশবোর্ড', href: '/teacher', icon: HiOutlineHome },
  { label: 'প্যাকেজ ব্রাউজ', href: '/teacher/packages', icon: HiOutlineCube },
  { label: 'আমার ক্রয়', href: '/teacher/purchases', icon: HiOutlineShoppingCart },
  { label: 'আমার কন্টেন্ট', href: '/teacher/my-content', icon: HiOutlineBookOpen },
  { label: 'প্রশ্ন সেট', href: '/teacher/question-sets', icon: HiOutlineClipboardList },
  { label: 'OMR শিট', href: '/teacher/omr', icon: HiOutlineDocumentText },
  { label: 'শিক্ষার্থী', href: '/teacher/students', icon: HiOutlineUsers },
];

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const menu = role === 'admin' ? adminMenu : teacherMenu;

  const isActive = (href) => {
    if (href === `/${role}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-out',
          'w-64 lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-200 shrink-0">
          <Link href={`/${role}`} className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">প্র</span>
            </div>
            <span className="text-base font-bold text-neutral-800">প্রশ্নপিডিয়া</span>
          </Link>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            className="lg:hidden p-1 rounded-md hover:bg-neutral-100 text-neutral-500"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) dispatch(setSidebarOpen(false));
                }}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                )}
              >
                <Icon
                  className={clsx(
                    'h-5 w-5 shrink-0',
                    active ? 'text-primary-600' : 'text-neutral-400'
                  )}
                />
                <span>{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-primary-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 shrink-0">
          <p className="text-xs text-neutral-400 text-center">
            ProshnoPedia © ২০২৬
          </p>
        </div>
      </aside>
    </>
  );
}
