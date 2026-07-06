'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiOutlineLightningBolt,
  HiOutlineDatabase,
  HiOutlineDocumentText,
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiOutlineDownload,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineX,
} from 'react-icons/hi';

const features = [
  { icon: HiOutlineLightningBolt, title: '১ ক্লিক প্রশ্ন তৈরি', desc: 'শ্রেণি, বিষয়, অধ্যায় বেছে নিন — প্রশ্ন প্রস্তুত হয়ে যাবে সঙ্গে সঙ্গে।' },
  { icon: HiOutlineDatabase, title: 'বিশাল প্রশ্নভান্ডার', desc: 'সব শ্রেণি, সব বিষয়, সব অধ্যায়ের লাখো প্রশ্ন এক জায়গায়।' },
  { icon: HiOutlineDocumentText, title: 'OMR মূল্যায়ন', desc: 'উত্তরপত্র স্ক্যান করুন, ফলাফল প্রস্তুত হয়ে যাবে সেকেন্ডের মধ্যেই।' },
  { icon: HiOutlineGlobe, title: 'অনলাইন পরীক্ষা', desc: 'লিংক শেয়ার করুন, শিক্ষার্থীরা ঘরে বসেই পরীক্ষা দিতে পারবে।' },
  { icon: HiOutlineShieldCheck, title: 'কাস্টম নিয়ম', desc: 'নিজের প্রতিষ্ঠানের নিয়ম অনুযায়ী পরীক্ষার সেটিংস সাজিয়ে নিন।' },
  { icon: HiOutlineDownload, title: 'প্রিন্ট ও PDF', desc: 'এক ক্লিকে ছাপার উপযোগী, সুন্দর ফরম্যাটের ফাইল ডাউনলোড করুন।' },
];

const problems = [
  'ঘণ্টার পর ঘণ্টা টাইপ করা',
  'বই ঘেঁটে প্রশ্ন খোঁজা',
  'ফরম্যাট ঠিক করতে মাথাব্যথা',
  'প্রিন্টের দোকানে দৌড়াদৌড়ি',
];

const solutions = [
  '১ মিনিটে প্রশ্নপত্র রেডি',
  'লাখো প্রশ্ন থেকে বেছে নিন',
  'অটোমেটিক সুন্দর ফরম্যাট',
  'সরাসরি প্রিন্ট বা PDF ডাউনলোড',
];

const steps = [
  { num: '১', title: 'শ্রেণি ও অধ্যায় বাছুন', desc: 'যেকোনো শ্রেণি, যেকোনো বিষয়ের অধ্যায় বেছে নিন কয়েক সেকেন্ডে।' },
  { num: '২', title: '১ ক্লিকে প্রশ্ন তৈরি করুন', desc: 'আমাদের লাখো প্রশ্নের ভান্ডার থেকে মানসম্মত প্রশ্ন চলে আসবে।' },
  { num: '৩', title: 'প্রিন্ট করুন বা পরীক্ষা নিন', desc: 'PDF ডাউনলোড করুন, প্রিন্ট করুন অথবা অনলাইনে পরীক্ষা নিন।' },
];

const trustStats = [
  { value: '১০,০০০+', label: 'প্রশ্নের ভান্ডার' },
  { value: '৳০', label: 'থেকে শুরু' },
  { value: '৩য়–১২শ', label: 'সকল শ্রেণির জন্য' },
  { value: '২৪/৭', label: 'সহায়তা প্রস্তুত' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      const panelMap = { admin: '/admin', teacher: '/teacher', student: '/student' };
      router.replace(panelMap[user.role] || '/login');
    }
  }, [isInitialized, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen" style={{ background: '#FBF8F1', color: '#1B2B22' }}>
      {/* ─── NAVBAR ─── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(251,248,241,0.92)', backdropFilter: 'blur(8px)', borderColor: '#E6DFC9' }}>
        <nav className="max-w-[1140px] mx-auto flex items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: '#0F5132' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6C4 4.9 4.9 4 6 4h9l5 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 12h8M8 16h5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <span className="text-xl font-bold" style={{ color: '#0B3B24' }}>প্রশ্নবন্ধু</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            <a href="#features" className="text-sm font-semibold hover:text-[#0F5132] transition-colors no-underline" style={{ color: '#1B2B22' }}>ফিচার</a>
            <a href="#how" className="text-sm font-semibold hover:text-[#0F5132] transition-colors no-underline" style={{ color: '#1B2B22' }}>কীভাবে কাজ করে</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex items-center px-5 py-2 text-sm font-semibold border-2 rounded-full transition-colors no-underline" style={{ borderColor: '#0F5132', color: '#0B3B24' }}>
              লগইন
            </Link>
            <Link href="/register" className="inline-flex items-center px-5 py-2 text-sm font-semibold rounded-full transition-transform active:translate-y-[1px] no-underline" style={{ background: '#E8A33D', color: '#0B3B24', boxShadow: '0 4px 0 #C6821F' }}>
              ফ্রি শুরু করুন
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pt-16 pb-10 md:pt-20 md:pb-14"
        style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, #FBF8F1 85%),
            repeating-linear-gradient(180deg, transparent 0 37px, #CFE3D6 37px 38px),
            #FBF8F1`
        }}
      >
        {/* Red margin rule (notebook style) */}
        <div className="absolute top-0 bottom-0 left-16 w-[2px] hidden md:block" style={{ background: 'rgba(214,69,69,0.28)' }} />

        <div className="relative text-center max-w-[760px] mx-auto px-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ background: '#E8F1EA', color: '#0B3B24' }}>
              🎓 শিক্ষকদের জন্য তৈরি · ৩য়–১২শ শ্রেণি
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-5"
            style={{ color: '#0B3B24' }}
          >
            প্রশ্ন তৈরি হবে ১ ক্লিকে,<br />সময় বাঁচবে আপনার।
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-base md:text-lg max-w-[560px] mx-auto mb-8"
            style={{ color: '#66705F' }}
          >
            শ্রেণি, বিষয় আর অধ্যায় বেছে নিন — বাকিটা আমরা করে দিচ্ছি।
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="flex flex-wrap gap-3.5 justify-center"
          >
            <Link href="/register" className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-full transition-transform active:translate-y-[2px] no-underline" style={{ background: '#E8A33D', color: '#0B3B24', boxShadow: '0 5px 0 #C6821F' }}>
              ফ্রি অ্যাকাউন্ট খুলুন
              <HiOutlineArrowRight className="h-5 w-5" />
            </Link>
            <a href="#how" className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold border-2 rounded-full transition-colors hover:bg-[#E8F1EA] no-underline" style={{ borderColor: '#0F5132', color: '#0B3B24' }}>
              কীভাবে কাজ করে দেখুন ↓
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section style={{ background: '#0B3B24' }} className="py-7">
        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {trustStats.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: '#B9D4C3' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PROBLEM / SOLUTION ─── */}
      <section className="py-20">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider mb-2.5 block" style={{ color: '#D64545' }}>কেন প্রশ্নবন্ধু</span>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#0B3B24' }}>আগে যেভাবে সময় যেত, এখন যেভাবে বাঁচে</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-2xl p-7"
              style={{ background: '#FBF1EE', border: '1.5px solid #F0D9CF' }}
            >
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: '#A6432B' }}>😩 পুরোনো নিয়মে</h3>
              <ul className="space-y-3.5">
                {problems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: '#7A4335' }}>
                    <HiOutlineX className="h-4.5 w-4.5 mt-0.5 shrink-0" style={{ color: '#C0503A' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="rounded-2xl p-7 text-white"
              style={{ background: '#0F5132' }}
            >
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">😊 প্রশ্নবন্ধুতে</h3>
              <ul className="space-y-3.5">
                {solutions.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: '#DCEFE3' }}>
                    <HiOutlineCheck className="h-4.5 w-4.5 mt-0.5 shrink-0" style={{ color: '#7CE29A' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 border-y" style={{ background: '#FFFFFF', borderColor: '#E6DFC9' }}>
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider mb-2.5 block" style={{ color: '#D64545' }}>সবকিছু একসাথে</span>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#0B3B24' }}>একটি প্ল্যাটফর্মে সব সমাধান</h2>
            <p className="text-sm mt-3" style={{ color: '#66705F' }}>প্রশ্ন তৈরি থেকে ফলাফল প্রকাশ — সবকিছু একসাথে, এক জায়গায়।</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="bg-white rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ borderColor: '#E6DFC9' }}
                >
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#E8F1EA', color: '#0F5132' }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#0B3B24' }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: '#66705F' }}>{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="py-20">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider mb-2.5 block" style={{ color: '#D64545' }}>সহজ ৩ ধাপ</span>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#0B3B24' }}>মাত্র ৩ ধাপে প্রশ্নপত্র তৈরি</h2>
            <p className="text-sm mt-3" style={{ color: '#66705F' }}>কোনো টাইপিং নেই, কোনো জটিলতা নেই।</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Dashed connector line */}
            <div className="absolute top-[27px] left-[16%] right-[16%] h-[2px] hidden md:block" style={{ background: 'repeating-linear-gradient(90deg, #E6DFC9 0 10px, transparent 10px 20px)' }} />
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="relative z-10 text-center"
              >
                <div className="h-14 w-14 rounded-full mx-auto mb-5 flex items-center justify-center text-xl font-bold" style={{ background: '#E8A33D', color: '#0B3B24', boxShadow: '0 5px 0 #C6821F' }}>
                  {step.num}
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#0B3B24' }}>{step.title}</h3>
                <p className="text-sm max-w-[260px] mx-auto" style={{ color: '#66705F' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="pb-20">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="rounded-2xl py-14 px-8 text-center text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F5132 0%, #0B3B24 100%)' }}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">আজই শুরু করুন — প্রথম প্রশ্নপত্র একদম ফ্রি</h2>
            <p className="text-base mb-7" style={{ color: '#CFE5D8' }}>কোনো ঝুঁকি নেই, কোনো কার্ড লাগবে না। মাত্র ২ মিনিটে অ্যাকাউন্ট খুলুন।</p>
            <div className="flex flex-wrap gap-3.5 justify-center">
              <Link href="/register" className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-full transition-transform active:translate-y-[2px] no-underline" style={{ background: '#E8A33D', color: '#0B3B24', boxShadow: '0 5px 0 #C6821F' }}>
                ফ্রি অ্যাকাউন্ট খুলুন
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold border-2 rounded-full transition-colors no-underline" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
                লগইন করুন
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 border-t" style={{ background: '#0B3B24', borderColor: 'rgba(255,255,255,0.12)' }}>
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6C4 4.9 4.9 4 6 4h9l5 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 12h8M8 16h5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <span className="text-base font-bold text-white">প্রশ্নবন্ধু</span>
            </div>
            <p className="text-xs" style={{ color: '#B9D4C3' }}>© ২০২৬ প্রশ্নবন্ধু — শিক্ষকদের জন্য তৈরি</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
