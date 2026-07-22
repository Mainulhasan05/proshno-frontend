'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { MotionConfig, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { adminLogin, clearError } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from 'react-icons/hi';

const accessPoints = [
  'কনটেন্ট ও প্রশ্নব্যাংক ব্যবস্থাপনা',
  'শিক্ষক ও প্যাকেজ নিয়ন্ত্রণ',
  'সিস্টেম রিপোর্ট ও কার্যক্রম পর্যবেক্ষণ',
];

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(adminLogin(data));
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen overflow-hidden bg-[#F2F5F2] text-[#14231A]">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(15,81,50,0.09) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -left-40 -top-52 h-[520px] w-[520px] rounded-full bg-[#DCECE1] blur-3xl opacity-80" />
        <div className="absolute -bottom-64 -right-36 h-[600px] w-[600px] rounded-full bg-[#F7E6C9] blur-3xl opacity-70" />

        <div className="relative mx-auto grid min-h-screen max-w-[1280px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden lg:flex flex-col justify-between px-14 py-12 xl:px-20 xl:py-16">
            <motion.a href="/" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex w-fit items-center gap-3 no-underline">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F5132] shadow-lg shadow-[#0F5132]/20">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6C4 4.9 4.9 4 6 4h9l5 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 12h8M8 16h5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </span>
              <span><span className="block text-lg font-bold tracking-tight text-[#0B3B24]">প্রশ্নপিডিয়া</span><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#718078]">Administration</span></span>
            </motion.a>

            <div className="max-w-[570px] py-12">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#CFE0D3] bg-white/70 px-3.5 py-2 text-xs font-bold text-[#285B3C] shadow-sm">
                <HiOutlineSparkles className="h-4 w-4 text-[#C17A16]" />
                কেন্দ্রীয় পরিচালনা প্যানেল
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="max-w-[540px] text-4xl font-bold leading-[1.2] tracking-[-0.025em] text-[#0B3B24] xl:text-5xl">
                শিক্ষা কার্যক্রম পরিচালনা করুন একটি নিরাপদ জায়গা থেকে।
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 max-w-[510px] text-base leading-8 text-[#637068]">
                প্রশ্ন, শিক্ষক, বিষয়বস্তু ও প্ল্যাটফর্ম সেটিংস—প্রশ্নপিডিয়ার প্রতিটি গুরুত্বপূর্ণ কার্যক্রমের জন্য আপনার কেন্দ্রীয় কর্মক্ষেত্র।
              </motion.p>

              <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.28 } } }} className="mt-9 space-y-3">
                {accessPoints.map((item) => (
                  <motion.div key={item} variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }} className="flex items-center gap-3 text-sm font-semibold text-[#3C4D42]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-[#DCE6DE]"><HiOutlineCheck className="h-4 w-4 text-[#218653]" /></span>
                    {item}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#718078]">
              <HiOutlineShieldCheck className="h-5 w-5 text-[#3D7653]" />
              <span>নিরাপদ সংযোগ · অনুমোদিত অ্যাডমিনদের জন্য সংরক্ষিত</span>
            </div>
          </section>

          <section className="flex items-center justify-center px-5 py-8 sm:px-10 lg:px-12">
            <motion.div initial={{ opacity: 0, y: 22, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-[490px]">
              <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#526259] no-underline transition-colors hover:text-[#0F5132] lg:hidden">
                <HiOutlineArrowLeft className="h-4 w-4" /> হোমে ফিরুন
              </Link>

              <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_30px_80px_rgba(25,55,35,0.13)] backdrop-blur-xl sm:p-9">
                <div className="mb-8 flex items-start justify-between gap-5">
                  <div>
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F2EB] ring-1 ring-[#D3E4D8]">
                      <HiOutlineShieldCheck className="h-7 w-7 text-[#0F5132]" />
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#14231A] sm:text-[1.75rem]">অ্যাডমিন লগইন</h2>
                    <p className="mt-2 text-sm leading-6 text-[#6B776F]">আপনার অনুমোদিত অ্যাডমিন অ্যাকাউন্ট ব্যবহার করুন।</p>
                  </div>
                  <span className="mt-1 hidden rounded-full bg-[#EDF7F0] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#297047] sm:inline-flex">Secure</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="admin-email" className="mb-2 block text-sm font-bold text-[#34443A]">ইমেইল ঠিকানা</label>
                    <div className="group relative">
                      <HiOutlineMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#89958D] transition-colors group-focus-within:text-[#0F5132]" />
                      <input id="admin-email" type="email" autoComplete="username" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'admin-email-error' : undefined} {...register('email', { required: 'ইমেইল ঠিকানা প্রয়োজন', pattern: { value: /^\S+@\S+\.\S+$/, message: 'সঠিক ইমেইল ঠিকানা লিখুন' } })} className="h-13 w-full rounded-xl border border-[#D6DED8] bg-[#FAFCFA] py-3.5 pl-12 pr-4 text-sm text-[#1D2B22] outline-none transition-all placeholder:text-[#A0AAA3] hover:border-[#B8C7BC] focus:border-[#267248] focus:bg-white focus:ring-4 focus:ring-[#267248]/10" placeholder="admin@proshnopedia.com" />
                    </div>
                    {errors.email && <p id="admin-email-error" role="alert" className="mt-1.5 text-xs font-semibold text-rose-600">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="admin-password" className="mb-2 block text-sm font-bold text-[#34443A]">পাসওয়ার্ড</label>
                    <div className="group relative">
                      <HiOutlineLockClosed className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#89958D] transition-colors group-focus-within:text-[#0F5132]" />
                      <input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'admin-password-error' : undefined} {...register('password', { required: 'পাসওয়ার্ড প্রয়োজন' })} className="h-13 w-full rounded-xl border border-[#D6DED8] bg-[#FAFCFA] py-3.5 pl-12 pr-12 text-sm text-[#1D2B22] outline-none transition-all placeholder:text-[#A0AAA3] hover:border-[#B8C7BC] focus:border-[#267248] focus:bg-white focus:ring-4 focus:ring-[#267248]/10" placeholder="আপনার পাসওয়ার্ড" />
                      <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#758179] transition-colors hover:bg-[#EDF3EF] hover:text-[#0F5132]">
                        {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p id="admin-password-error" role="alert" className="mt-1.5 text-xs font-semibold text-rose-600">{errors.password.message}</p>}
                  </div>

                  <Button type="submit" loading={isLoading} className="group !mt-7 !w-full !rounded-xl !border-0 !bg-[#0F5132] !py-3.5 !font-bold !text-white !shadow-[0_8px_20px_rgba(15,81,50,0.22)] transition-all hover:!-translate-y-0.5 hover:!bg-[#0B4329] hover:!shadow-[0_12px_26px_rgba(15,81,50,0.26)]" size="lg">
                    <span>{isLoading ? 'যাচাই করা হচ্ছে' : 'নিরাপদ লগইন'}</span>
                    {!isLoading && <HiOutlineArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
                  </Button>
                </form>

                <div className="mt-7 flex items-start gap-3 rounded-xl border border-[#E3E9E4] bg-[#F7F9F7] px-4 py-3.5">
                  <HiOutlineLockClosed className="mt-0.5 h-4 w-4 shrink-0 text-[#52705D]" />
                  <p className="text-[11px] leading-5 text-[#6B776F]">এই পোর্টালটি শুধু অনুমোদিত ব্যবহারকারীদের জন্য। আপনার লগইন তথ্য অন্য কারও সঙ্গে শেয়ার করবেন না।</p>
                </div>
              </div>

              <p className="mt-5 text-center text-[11px] text-[#7A877F]">© ২০২৬ ProshnoPedia · Admin Operations</p>
            </motion.div>
          </section>
        </div>
      </main>
    </MotionConfig>
  );
}