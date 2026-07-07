'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCog, HiOutlineDocumentText, HiOutlineGlobe,
} from 'react-icons/hi';
import Link from 'next/link';

const settingsTabs = [
  { id: 'general', label: 'সাধারণ', icon: HiOutlineCog },
  { id: 'pages', label: 'পেজ ব্যবস্থাপনা', icon: HiOutlineDocumentText },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">সেটিংস</h1>
        <p className="text-sm text-neutral-500 mt-1">প্ল্যাটফর্মের সেটিংস পরিচালনা</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-neutral-200 p-1 mb-6 overflow-x-auto">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-neutral-200 p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">সাধারণ সেটিংস</h2>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">প্ল্যাটফর্ম নাম</label>
              <input
                type="text"
                defaultValue="প্রশ্ন"
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                disabled
              />
              <p className="text-xs text-neutral-400 mt-1">ভবিষ্যতে সক্রিয় হবে</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">প্ল্যাটফর্ম বিবরণ</label>
              <textarea
                defaultValue="বাংলাদেশি শিক্ষকদের জন্য প্রশ্ন ব্যাংক ও OMR প্ল্যাটফর্ম"
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                rows={3}
                disabled
              />
              <p className="text-xs text-neutral-400 mt-1">ভবিষ্যতে সক্রিয় হবে</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-primary-50 rounded-lg">
            <h3 className="text-sm font-semibold text-primary-700 mb-2">দ্রুত লিঙ্ক</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link href="/admin/pages" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 bg-white rounded-lg px-3 py-2 border border-primary-100 hover:border-primary-200 transition-colors">
                <HiOutlineDocumentText className="h-4 w-4" />
                পেজ ব্যবস্থাপনা
              </Link>
              <Link href="/admin/packages" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 bg-white rounded-lg px-3 py-2 border border-primary-100 hover:border-primary-200 transition-colors">
                <HiOutlineGlobe className="h-4 w-4" />
                প্যাকেজ ব্যবস্থাপনা
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'pages' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-neutral-200 p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">পেজ ব্যবস্থাপনা</h2>
              <p className="text-sm text-neutral-500 mt-0.5">প্রাইভেসি পলিসি, শর্তাবলী ইত্যাদি পেজ তৈরি করুন</p>
            </div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-6 text-center">
            <HiOutlineDocumentText className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 mb-3">ডায়নামিক পেজ তৈরি ও সম্পাদনা করতে পেজ ম্যানেজমেন্টে যান</p>
            <Link href="/admin/pages">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                <HiOutlineDocumentText className="h-4 w-4" />
                পেজ ম্যানেজমেন্ট
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
