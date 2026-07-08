'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { resetPassword } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  HiOutlineLockClosed,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';

function ResetPasswordForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('রিসেট টোকেন পাওয়া যায়নি');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(resetPassword({ token, newPassword: data.newPassword })).unwrap();
      setIsReset(true);
      toast.success('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
    } catch (err) {
      toast.error(err?.message || 'রিসেট টোকেন অবৈধ বা মেয়াদ শেষ হয়ে গেছে');
    } finally {
      setIsLoading(false);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <HiOutlineExclamationCircle className="h-9 w-9 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">
          অবৈধ লিংক
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          পাসওয়ার্ড রিসেট লিংকটি অবৈধ। অনুগ্রহ করে আবার চেষ্টা করুন।
        </p>
        <Link
          href="/forgot-password"
          className="text-primary-600 font-medium hover:text-primary-700 text-sm"
        >
          নতুন রিসেট লিংক নিন →
        </Link>
      </div>
    );
  }

  // Successfully reset
  if (isReset) {
    return (
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
          পাসওয়ার্ড পরিবর্তন সফল! 🎉
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।
        </p>
        <Button
          onClick={() => router.push('/login')}
          className="w-full"
          size="lg"
        >
          লগইন করুন
        </Button>
      </motion.div>
    );
  }

  // Reset form
  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-800 mb-1">
        নতুন পাসওয়ার্ড সেট করুন 🔐
      </h1>
      <p className="text-sm text-neutral-500 mb-6">
        আপনার নতুন পাসওয়ার্ড দিন
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="নতুন পাসওয়ার্ড"
            type={showPassword ? 'text' : 'password'}
            placeholder="কমপক্ষে ৮ অক্ষর"
            leftIcon={HiOutlineLockClosed}
            error={errors.newPassword?.message}
            {...register('newPassword', {
              required: 'নতুন পাসওয়ার্ড প্রয়োজন',
              minLength: { value: 8, message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-primary-600 hover:text-primary-700 mt-1"
          >
            {showPassword ? 'লুকান' : 'দেখুন'}
          </button>
        </div>

        <Input
          label="পাসওয়ার্ড নিশ্চিত করুন"
          type={showPassword ? 'text' : 'password'}
          placeholder="পাসওয়ার্ড আবার দিন"
          leftIcon={HiOutlineLockClosed}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'পাসওয়ার্ড নিশ্চিত করুন',
            validate: (value) =>
              value === newPassword || 'পাসওয়ার্ড মিলছে না',
          })}
        />

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          পাসওয়ার্ড পরিবর্তন করুন
        </Button>
      </form>

      <p className="text-sm text-neutral-500 text-center mt-6">
        <Link
          href="/login"
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          ← লগইন পেজে ফিরে যান
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-500 text-sm">লোড হচ্ছে...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
