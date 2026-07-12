'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';
import apiClient from '@/store/api/apiClient';
import { MotionConfig, motion } from 'framer-motion';
import {
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineCurrencyBangladeshi,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineCube,
} from 'react-icons/hi';

const faqItems = [
  {
    q: 'OMR শিট কীভাবে মূল্যায়ন করা হয়?',
    a: 'শিক্ষক প্রথমে আমাদের OMR শিট মেকার থেকে কাস্টমাইজড শিট ডাউনলোড করে প্রিন্ট করবেন। শিক্ষার্থীরা পরীক্ষা দেওয়ার পর, শিক্ষক মোবাইল ক্যামেরা বা স্ক্যানার দিয়ে উত্তরপত্রের ছবি তুলবেন। সেই ছবিটি আমাদের ওএমআর মূল্যায়ন ট্যাবে আপলোড করলেই সাথে সাথে ফলাফল, মার্কস এবং গ্রেড রেডি হয়ে যাবে।'
  },
  {
    q: 'OMR টোকেন কী এবং কীভাবে কাজ করে?',
    a: 'OMR টোকেন হলো প্রশ্নপিডিয়ার ওএমআর মূল্যায়ন ব্যালেন্স। ১টি ওএমআর টোকেন দিয়ে ১টি উত্তরপত্র সম্পূর্ণ স্ক্যান ও মূল্যায়ন করা যাবে। যেকোনো প্যাকেজ ক্রয়ের সাথে নির্দিষ্ট পরিমাণ ফ্রি টোকেন দেওয়া হয়। টোকেন শেষ হয়ে গেলে যেকোনো সময় খুব কম খরচে আলাদাভাবে টোকেন রিচার্জ করে নেওয়া যাবে।'
  },
  {
    q: 'প্যাকেজ ক্রয় করার পর সচল হতে কত সময় লাগে?',
    a: 'বিকাশ বা নগদ দিয়ে পেমেন্ট সফল হওয়ার পর পেমেন্ট আইডি সাবমিট করলে আমাদের অ্যাডমিন প্যানেল সাধারণত ১০-৩০ মিনিটের মধ্যে যাচাই করে প্যাকেজটি সচল করে দেয়। প্যাকেজ সচল হওয়ার সাথে সাথে শিক্ষক নোটিফিকেশন পাবেন।'
  },
  {
    q: 'বিকাশ বা নগদ পেমেন্ট কি নিরাপদ?',
    a: 'হ্যাঁ, আমাদের পেমেন্ট ভেরিফিকেশন সম্পূর্ণ সুরক্ষিত। আপনি সরাসরি বিকাশ/নগদ ম্যানুয়াল অথবা অনলাইন পেমেন্ট ব্যবহার করে আপনার ক্রয়ের অনুরোধ পাঠাতে পারেন।'
  }
];

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('class-wise'); // 'class-wise' | 'bundles' | 'coaching'
  const [openFaq, setOpenFaq] = useState(null);

  // Fetch packages from backend public endpoint
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const res = await apiClient.get('/packages/public');
        if (res?.data && res.data.length > 0) {
          setPackages(res.data);
        } else {
          // Fallback to static packages if db is empty
          setPackages(getFallbackPackages());
        }
      } catch (err) {
        console.error('Failed to fetch packages, using fallbacks', err);
        setPackages(getFallbackPackages());
      } finally {
        setLoading(false);
      }
    };
    loadPackages();
  }, []);

  const handleBuy = (packageId) => {
    if (!isInitialized) return;
    if (isAuthenticated) {
      router.push(`/teacher/packages?packageId=${packageId}`);
    } else {
      router.push(`/register?redirect=/teacher/packages&packageId=${packageId}`);
    }
  };

  // Filter packages based on active category
  const filteredPackages = packages.filter(pkg => {
    const name = pkg.name.toLowerCase();
    if (activeTab === 'coaching') {
      return name.includes('coaching') || name.includes('কোচিং') || name.includes('প্রতিষ্ঠান') || name.includes('institution');
    }
    if (activeTab === 'bundles') {
      return name.includes('bundle') || name.includes('বান্ডেল') || name.includes('সমগ্র') || name.includes('৩-') || name.includes('৬-');
    }
    // Default class-wise
    return !name.includes('coaching') && !name.includes('কোচিং') && !name.includes('প্রতিষ্ঠান') && !name.includes('institution') && 
           !name.includes('bundle') && !name.includes('বান্ডেল') && !name.includes('সমগ্র') && !name.includes('৩-১০') && !name.includes('৬-১০');
  });

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen" style={{ background: '#FBF8F1', color: '#1B2B22' }}>
        
        {/* ─── NAVBAR ─── */}
        <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(251,248,241,0.92)', backdropFilter: 'blur(8px)', borderColor: '#E6DFC9' }}>
          <nav className="max-w-[1140px] mx-auto flex items-center justify-between px-6 py-3.5">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: '#0F5132' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6C4 4.9 4.9 4 6 4h9l5 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M8 12h8M8 16h5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold" style={{ color: '#0B3B24' }}>প্রশ্নপিডিয়া</span>
            </Link>
            <div className="hidden md:flex items-center gap-7">
              <Link href="/" className="text-sm font-semibold hover:text-[#0F5132] transition-colors no-underline text-neutral-700">ফিচার</Link>
              <Link href="/#how" className="text-sm font-semibold hover:text-[#0F5132] transition-colors no-underline text-neutral-700">কীভাবে কাজ করে</Link>
              <Link href="/pricing" className="text-sm font-bold transition-colors no-underline" style={{ color: '#0F5132' }}>মূল্য তালিকা</Link>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/teacher" className="inline-flex items-center px-5 py-2 text-sm font-semibold rounded-full text-white bg-[#0F5132] no-underline">
                  ড্যাশবোর্ড
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:inline-flex items-center px-5 py-2 text-sm font-semibold border-2 rounded-full transition-colors no-underline" style={{ borderColor: '#0F5132', color: '#0B3B24' }}>
                    লগইন
                  </Link>
                  <Link href="/register" className="inline-flex items-center px-5 py-2 text-sm font-semibold rounded-full transition-transform active:translate-y-[1px] no-underline" style={{ background: '#E8A33D', color: '#0B3B24', boxShadow: '0 4px 0 #C6821F' }}>
                    ফ্রি শুরু করুন
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        {/* ─── HERO SECTION ─── */}
        <section className="relative overflow-hidden pt-14 pb-8 md:pt-16 md:pb-10"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, #FBF8F1 85%),
              repeating-linear-gradient(180deg, transparent 0 37px, #CFE3D6 37px 38px),
              #FBF8F1`
          }}
        >
          <div className="absolute top-0 bottom-0 left-16 w-[2px] hidden md:block" style={{ background: 'rgba(214,69,69,0.22)' }} />
          <div className="relative text-center max-w-[800px] mx-auto px-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-emerald-100 text-emerald-800" style={{ color: '#0B3B24' }}>
              🎓 সহজ ও নমনীয় প্যাকেজ
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4" style={{ color: '#0B3B24' }}>
              সাশ্রয়ী ও সহজ মূল্য তালিকা
            </h1>
            <p className="text-base md:text-lg max-w-[560px] mx-auto mb-8 text-[#66705F]">
              আপনার প্রয়োজন এবং প্রতিষ্ঠানের ধরন অনুযায়ী সেরা প্যাকেজটি বেছে নিন। কোনো লুকানো চার্জ নেই।
            </p>

            {/* TAB SELECTOR */}
            <div className="inline-flex p-1.5 rounded-full bg-neutral-200/60 backdrop-blur border border-neutral-300 max-w-full overflow-x-auto shadow-sm">
              {[
                { id: 'class-wise', label: 'শ্রেণি অনুযায়ী প্যাকেজ', icon: HiOutlineAcademicCap },
                { id: 'bundles', label: 'একাডেমিক বান্ডেল', icon: HiOutlineCube },
                { id: 'coaching', label: 'কোচিং ও বড় প্রতিষ্ঠান', icon: HiOutlineClipboardList },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all whitespace-nowrap ${
                      active ? 'bg-white text-emerald-900 shadow-md font-bold' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-[#0F5132]' : 'text-neutral-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── PRICING CARDS ─── */}
        <section className="py-12 max-w-[1140px] mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-[#E6DFC9]" />
              ))}
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#E6DFC9] p-8 shadow-sm">
              <HiOutlineCube className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
              <h3 className="text-lg font-bold text-[#0B3B24] mb-1">এই ক্যাটাগরিতে কোনো প্যাকেজ নেই</h3>
              <p className="text-sm text-neutral-500">অনুগ্রহ করে অন্য ক্যাটাগরিগুলো পরীক্ষা করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {filteredPackages.map((pkg, idx) => {
                const isPopular = pkg.price >= 1499 && pkg.price <= 2999;
                return (
                  <motion.div
                    key={pkg._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative bg-white rounded-2xl border transition-all hover:shadow-xl flex flex-col min-h-[480px] overflow-hidden ${
                      isPopular ? 'border-2 shadow-md ring-2 ring-emerald-600/10' : 'border-[#E6DFC9]'
                    }`}
                    style={{ borderColor: isPopular ? '#0F5132' : '#E6DFC9' }}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-[#0F5132] text-white text-xs font-extrabold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                        সেরা অফার
                      </div>
                    )}

                    {/* Card Header */}
                    <div className="p-6 md:p-8 pb-5 border-b border-neutral-100">
                      <h3 className="text-xl font-bold text-[#0B3B24] mb-2">{pkg.name}</h3>
                      <p className="text-xs text-neutral-500 min-h-[32px] line-clamp-2">{pkg.description || '১ বছর মেয়াদে আনলিমিটেড প্রশ্নপত্র তৈরি এবং ওএমআর শিট ব্যবহারের সুযোগ।'}</p>
                      
                      {/* Price tag */}
                      <div className="flex items-baseline gap-1 mt-5">
                        <span className="text-3xl font-extrabold text-[#0B3B24]">৳{pkg.discountPrice ?? pkg.price}</span>
                        {pkg.discountPrice != null && pkg.discountPrice < pkg.price && (
                          <span className="text-sm text-neutral-400 line-through">৳{pkg.price}</span>
                        )}
                        <span className="text-xs text-neutral-500 font-semibold ml-1">/ ১ বছর</span>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="p-6 md:p-8 pt-5 flex-1 space-y-4">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">প্যাকেজে যা অন্তর্ভুক্ত:</p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2.5 text-sm text-[#1B2B22]">
                          <HiOutlineCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>১ ক্লিকে দ্রুত প্রশ্ন তৈরি</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-[#1B2B22]">
                          <HiOutlineCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>আনলিমিটেড PDF ডাউনলোড ও প্রিন্ট</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-[#1B2B22]">
                          <HiOutlineCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>কাস্টম লোগো ও ওয়াটারমার্ক যুক্ত করার সুবিধা</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-[#1B2B22]">
                          <HiOutlineCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            {pkg.omrTokens && pkg.omrTokens > 0 
                              ? `ওএমআর শিট মেকার ও ${pkg.omrTokens}টি ফ্রি ওএমআর টোকেন`
                              : 'ওএমআর শিট মেকার (টোকেন ব্যালেন্স আলাদা ক্রয়ের সুযোগ)'}
                          </span>
                        </li>

                        {/* Specific classes or items */}
                        {pkg.items && pkg.items.length > 0 && (
                          <li className="flex items-start gap-2.5 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                            <span className="font-bold">বিষয়সমূহ:</span>
                            <div className="flex flex-wrap gap-1">
                              {pkg.items.map((item, id) => (
                                <span key={id} className="inline-block bg-[#E8F1EA] text-[#0F5132] px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                  {item.classId?.name} {item.subjectId?.name ? `(${item.subjectId.name})` : ''}
                                </span>
                              ))}
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="p-6 md:p-8 pt-0 mt-auto">
                      <button
                        onClick={() => handleBuy(pkg._id)}
                        className="w-full py-3.5 px-6 rounded-full font-bold transition-all text-center flex items-center justify-center gap-1.5 hover:-translate-y-[1px] active:translate-y-[1px]"
                        style={{
                          background: isPopular ? '#E8A33D' : '#0F5132',
                          color: isPopular ? '#0B3B24' : '#FFFFFF',
                          boxShadow: isPopular ? '0 4px 0 #C6821F' : '0 4px 0 #072617',
                        }}
                      >
                        <HiOutlineCurrencyBangladeshi className="h-5 w-5" />
                        প্যাকেজটি কিনুন
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── COMPARISON SECTION ─── */}
        <section className="py-12 bg-white border-y border-[#E6DFC9]">
          <div className="max-w-[800px] mx-auto px-6">
            <h2 className="text-2xl font-bold text-center text-[#0B3B24] mb-8">সকল প্ল্যানের সাথে যা যা পাচ্ছেন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {[
                { title: '১ ক্লিকে প্রশ্নপত্র', desc: 'আমাদের এআই অ্যাসিস্ট্যান্টের মাধ্যমে যেকোনো শ্রেণির জন্য এক ক্লিকে সিলেবাস ভিত্তিক সৃজনশীল ও নৈর্ব্যক্তিক প্রশ্নপত্র।' },
                { title: 'কাস্টম ওএমআর শিট', desc: 'আপনার স্কুলের নাম, লোগো, বাবল কালার দিয়ে সাজানো এবং ওএমআর রিডারে সহজে স্ক্যানযোগ্য প্রিন্ট-রেডি পিডিএফ।' },
                { title: '২৪/৭ শিক্ষক সাপোর্ট', desc: 'হোয়াটসঅ্যাপ ও ফোনের মাধ্যমে আমাদের টেকনিক্যাল সাপোর্ট টিম সবসময় যেকোনো সমস্যা সমাধানে পাশে আছে।' },
                { title: 'উচ্চমানের প্রশ্ন ব্যাংক', desc: 'অভিজ্ঞ শিক্ষকদের মাধ্যমে প্রণয়নকৃত এবং বারবার যাচাইকৃত লাখো নির্ভুল প্রশ্নের নির্ভরযোগ্য ব্যাংক।' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-4 rounded-xl bg-[#FBF8F1] border border-[#E6DFC9]">
                  <HiOutlineCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#0B3B24] mb-1">{item.title}</h4>
                    <p className="text-neutral-600 text-xs md:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ SECTION ─── */}
        <section className="py-16 max-w-[760px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#0B3B24] mb-8">সাধারণ জিজ্ঞাসা (FAQ)</h2>
          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-xl border border-[#E6DFC9] overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-4 font-bold text-sm md:text-base text-[#0B3B24] flex items-center justify-between transition-colors hover:bg-neutral-50"
                  >
                    <span>{item.q}</span>
                    <HiOutlineChevronDown className={`h-5 w-5 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
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
                <span className="text-base font-bold text-white">প্রশ্নপিডিয়া</span>
              </div>
              <p className="text-xs" style={{ color: '#B9D4C3' }}>© ২০২৬ ProshnoPedia.com — শিক্ষকদের জন্য তৈরি</p>
            </div>
          </div>
        </footer>
        
      </div>
    </MotionConfig>
  );
}

// Fallback pricing packages matching competitor tiers if DB is not populated yet
function getFallbackPackages() {
  return [
    // Class-wise
    {
      _id: 'class-6-all',
      name: 'Class 6 - সকল বিষয়',
      description: '৬ষ্ঠ শ্রেণির সব বিষয়ের প্রশ্ন ও ওএমআর শিট তৈরির সুবিধা (১ বছর মেয়াদ)।',
      price: 999,
      discountPrice: null,
      omrTokens: 100,
      items: [{ classId: { _id: '6', name: 'Class 6' } }]
    },
    {
      _id: 'class-7-all',
      name: 'Class 7 - সকল বিষয়',
      description: '৭ম শ্রেণির সব বিষয়ের প্রশ্ন ও ওএমআর শিট তৈরির সুবিধা (১ বছর মেয়াদ)।',
      price: 999,
      discountPrice: null,
      omrTokens: 100,
      items: [{ classId: { _id: '7', name: 'Class 7' } }]
    },
    {
      _id: 'class-9-10-all',
      name: 'Class 9-10 - সকল বিষয়',
      description: '৯ম ও ১০ম শ্রেণির সব বিষয়ের সৃজনশীল, এমসিকিউ ও ওএমআর তৈরির সুবিধা।',
      price: 1499,
      discountPrice: null,
      omrTokens: 150,
      items: [{ classId: { _id: '9-10', name: 'Class 9-10' } }]
    },
    // Bundles
    {
      _id: 'bundle-6-8',
      name: 'Class 6-8 - সুপার বান্ডেল',
      description: '৬ষ্ঠ, ৭ম ও ৮ম শ্রেণির সব বিষয়ের প্রশ্ন ব্যাংক ও ওএমআর শিট (১ বছর মেয়াদ)।',
      price: 2499,
      discountPrice: 1999,
      omrTokens: 300,
      items: [
        { classId: { _id: '6', name: 'Class 6' } },
        { classId: { _id: '7', name: 'Class 7' } },
        { classId: { _id: '8', name: 'Class 8' } }
      ]
    },
    {
      _id: 'bundle-6-10',
      name: 'Class 6-10 - মেগা বান্ডেল',
      description: '৬ষ্ঠ থেকে ১০ম শ্রেণির সকল বিষয়ের প্রশ্ন ব্যাংক, অনলাইন পরীক্ষা ও ওএমআর মূল্যায়ন।',
      price: 3499,
      discountPrice: 2999,
      omrTokens: 500,
      items: [
        { classId: { _id: '6-10', name: 'Class 6-10' } }
      ]
    },
    // Institution/Coaching
    {
      _id: 'coaching-pack-1',
      name: 'কোচিং সেন্টার প্যাক (৫ম-১০ম)',
      description: '৫ম থেকে ১০ম শ্রেণির সকল বিষয়ের আনলিমিটেড ওএমআর শিট তৈরি এবং দ্রুত মূল্যায়ন টোকেন।',
      price: 3699,
      discountPrice: null,
      omrTokens: 1000,
      items: [
        { classId: { _id: '5-10', name: 'Class 5-10' } }
      ]
    },
    {
      _id: 'coaching-pack-2',
      name: 'প্রতিষ্ঠানের জন্য প্যাক (৩য়-১২শ)',
      description: '৩য় থেকে দ্বাদশ শ্রেণির সকল বিষয়ের প্রশ্নপত্র, ওএমআর শিট এবং ওএমআর মূল্যায়ন ব্যালেন্স।',
      price: 4999,
      discountPrice: 4499,
      omrTokens: 2000,
      items: [
        { classId: { _id: '3-12', name: 'Class 3-12' } }
      ]
    }
  ];
}
