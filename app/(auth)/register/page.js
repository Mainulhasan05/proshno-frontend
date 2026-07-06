'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { registerUser, clearError } from '@/store/slices/authSlice';
import useAuth from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineAcademicCap,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isAuthenticated && user) {
      const panelMap = { admin: '/admin', teacher: '/teacher', student: '/student' };
      router.replace(panelMap[user.role] || '/');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <HiOutlineAcademicCap className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">প্রশ্ন</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
          <h1 className="text-2xl font-bold text-neutral-800 mb-1">
            শিক্ষক রেজিস্ট্রেশন
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="নাম"
              type="text"
              placeholder="আপনার পুরো নাম"
              leftIcon={HiOutlineUser}
              error={errors.name?.message}
              {...register('name', {
                required: 'নাম প্রয়োজন',
                maxLength: { value: 100, message: 'নাম ১০০ অক্ষরের বেশি হতে পারে না' },
              })}
            />

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
                placeholder="কমপক্ষে ৮ অক্ষর"
                leftIcon={HiOutlineLockClosed}
                error={errors.password?.message}
                {...register('password', {
                  required: 'পাসওয়ার্ড প্রয়োজন',
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
              label="ফোন নম্বর"
              type="tel"
              placeholder="01XXXXXXXXX"
              leftIcon={HiOutlinePhone}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="প্রতিষ্ঠানের নাম"
              type="text"
              placeholder="আপনার স্কুল/কলেজ (ঐচ্ছিক)"
              leftIcon={HiOutlineOfficeBuilding}
              error={errors.institutionName?.message}
              {...register('institutionName')}
            />

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              রেজিস্ট্রেশন করুন
            </Button>
          </form>

          <p className="text-sm text-neutral-500 text-center mt-6">
            ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link
              href="/login"
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              লগইন করুন
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
