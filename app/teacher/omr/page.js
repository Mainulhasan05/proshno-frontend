'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineCog,
} from 'react-icons/hi';

export default function TeacherOMRPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">OMR শিট</h1>
        <p className="text-sm text-neutral-500 mt-1">প্রশ্ন সেট থেকে OMR শিট তৈরি করুন</p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            icon: HiOutlineClipboardList,
            title: 'প্রশ্ন সেট নির্বাচন',
            desc: 'আপনার তৈরি প্রশ্ন সেট থেকে OMR শিট জেনারেট করুন',
            gradient: 'from-indigo-500 to-purple-500',
          },
          {
            icon: HiOutlineCog,
            title: 'কাস্টমাইজেশন',
            desc: 'প্রতিষ্ঠানের নাম, লোগো, পরীক্ষার শিরোনাম যোগ করুন',
            gradient: 'from-emerald-500 to-teal-500',
          },
          {
            icon: HiOutlineDocumentText,
            title: 'PDF ডাউনলোড',
            desc: 'A4 সাইজে প্রিন্ট-রেডি PDF ডাউনলোড করুন',
            gradient: 'from-amber-500 to-orange-500',
          },
        ].map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl border border-neutral-200 p-6"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 mb-1">{feature.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Coming soon notice */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-200 rounded-2xl p-8 text-center"
      >
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
          <HiOutlineDocumentText className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">OMR শিট জেনারেটর</h2>
        <p className="text-sm text-neutral-600 mb-4 max-w-md mx-auto">
          OMR শিট জেনারেটর শীঘ্রই আসছে। প্রথমে প্রশ্ন সেট তৈরি করুন, তারপর এখান থেকে OMR শিট জেনারেট করতে পারবেন।
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/teacher/question-sets">
            <button className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
              প্রশ্ন সেট তৈরি করুন
            </button>
          </Link>
        </div>

        <div className="mt-6 flex justify-center gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            MCQ সাপোর্ট
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            A4 সাইজ
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            শীঘ্রই আসছে
          </div>
        </div>
      </motion.div>
    </div>
  );
}
