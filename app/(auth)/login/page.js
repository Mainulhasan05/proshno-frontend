'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { loginUser, clearError } from '@/store/slices/authSlice';
import useAuth from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineAcademicCap } from 'react-icons/hi';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const panelMap = { admin: '/admin', teacher: '/teacher', student: '/student' };
      router.replace(panelMap[user.role] || '/');
    }
  }, [isAuthenticated, user, router]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
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
          <h1 className="text-2xl font-bold text-neutral-800 mb-1">লগইন করুন</h1>
          <p className="text-sm text-neutral-500 mb-6">
            আপনার অ্যাকাউন্টে প্রবেশ করুন
          </p>

          <GoogleAuthButton mode="signin" />
          <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-neutral-200" /><span className="text-xs font-medium text-neutral-400">অথবা ইমেইল দিয়ে</span><span className="h-px flex-1 bg-neutral-200" /></div>
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

            <div>
              <Input
                label="পাসওয়ার্ড"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={HiOutlineLockClosed}
                error={errors.password?.message}
                {...register('password', {
                  required: 'পাসওয়ার্ড প্রয়োজন',
                })}
              />
              <div className="flex items-center justify-between mt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  {showPassword ? 'লুকান' : 'দেখুন'}
                </button>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              লগইন
            </Button>
          </form>

          <p className="text-sm text-neutral-500 text-center mt-6">
            অ্যাকাউন্ট নেই?{' '}
            <Link
              href="/register"
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              রেজিস্ট্রেশন করুন
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
