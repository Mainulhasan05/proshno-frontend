'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { adminLogin } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { HiOutlineLockClosed, HiOutlineMail, HiOutlineShieldCheck } from 'react-icons/hi';

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading, error } = useSelector((s) => s.auth);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      router.push('/admin');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = (data) => {
    dispatch(adminLogin(data));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Minimal Shield Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <HiOutlineShieldCheck className="h-7 w-7 text-neutral-500" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8">
          <h1 className="text-lg font-semibold text-neutral-200 mb-1 text-center">System Access</h1>
          <p className="text-xs text-neutral-600 mb-6 text-center">Authorized personnel only</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email required' })}
                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 outline-none placeholder:text-neutral-700"
                placeholder="admin@example.com"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password required' })}
                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 outline-none placeholder:text-neutral-700"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full !bg-neutral-800 hover:!bg-neutral-700 !text-neutral-200 !border-neutral-700"
              size="lg"
            >
              Authenticate
            </Button>
          </form>
        </div>

        <p className="text-[10px] text-neutral-800 text-center mt-4">
          This portal is monitored. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  );
}
