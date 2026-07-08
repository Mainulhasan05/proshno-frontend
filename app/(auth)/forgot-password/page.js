'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { HiOutlineMail, HiOutlineAcademicCap, HiOutlineCheckCircle } from 'react-icons/hi';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await dispatch(forgotPassword(data.email)).unwrap();
      setIsEmailSent(true);
      toast.success('পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে');
    } catch (err) {
      toast.error(err?.message || 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
            <HiOutlineAcademicCap className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">প্রশ্নপিডিয়া</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
          {isEmailSent ? (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <HiOutlineCheckCircle className="h-9 w-9 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-800 mb-2">
                ইমেইল পাঠানো হয়েছে ✉️
              </h1>
              <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। অনুগ্রহ করে আপনার ইনবক্স (এবং স্প্যাম ফোল্ডার) চেক করুন।
              </p>
              <p className="text-xs text-neutral-400 mb-6">
                লিংকটি ১ ঘণ্টা পর্যন্ত কার্যকর থাকবে।
              </p>
              <Link
                href="/login"
                className="text-primary-600 font-medium hover:text-primary-700 text-sm"
              >
                ← লগইন পেজে ফিরে যান
              </Link>
            </motion.div>
          ) : (
            /* Form State */
            <>
              <h1 className="text-2xl font-bold text-neutral-800 mb-1">
                পাসওয়ার্ড ভুলে গেছেন?
              </h1>
              <p className="text-sm text-neutral-500 mb-6">
                আপনার ইমেইল দিন, আমরা পাসওয়ার্ড রিসেট লিংক পাঠাবো
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="ইমেইল"
                  type="email"
                  placeholder="your@email.com"
                  leftIcon={HiOutlineMail}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'ইমেইল প্রয়োজন',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'সঠিক ইমেইল দিন',
                    },
                  })}
                />

                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full"
                  size="lg"
                >
                  রিসেট লিংক পাঠান
                </Button>
              </form>

              <p className="text-sm text-neutral-500 text-center mt-6">
                পাসওয়ার্ড মনে আছে?{' '}
                <Link
                  href="/login"
                  className="text-primary-600 font-medium hover:text-primary-700"
                >
                  লগইন করুন
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
