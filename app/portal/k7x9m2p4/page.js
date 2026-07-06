'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { adminLogin, clearError } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import { HiOutlineLockClosed, HiOutlineMail, HiOutlineShieldCheck, HiOutlineArrowRight } from 'react-icons/hi';

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
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(adminLogin(data));
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 flex items-center justify-center px-4 overflow-hidden select-none">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary-600/10 blur-[150px]" />
      
      {/* Tech Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-[480px]"
      >
        {/* Glow Border Effect wrapper */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/25 to-primary-500/25 rounded-3xl blur-[20px] opacity-75" />

        {/* Login Container Card */}
        <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] shadow-2xl p-8 sm:p-10">
          
          {/* Top Logo & Shield Badge */}
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              initial={{ scale: 0.8, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-primary-500/10 border border-violet-500/20 flex items-center justify-center mb-4 shadow-inner"
            >
              <HiOutlineShieldCheck className="h-9 w-9 text-violet-400" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">System Access</h1>
            <p className="text-xs text-neutral-400 font-medium">Authorized administrative staff only</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 tracking-wide uppercase">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                  <HiOutlineMail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  {...register('email', { required: 'Email required' })}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950/80 border border-white/[0.08] rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                  placeholder="admin@proshno.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 font-medium mt-1 pl-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 tracking-wide uppercase">Password</label>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                  <HiOutlineLockClosed className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  {...register('password', { required: 'Password required' })}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950/80 border border-white/[0.08] rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 font-medium mt-1 pl-1">{errors.password.message}</p>
              )}
            </div>

            {/* Authenticate Button */}
            <Button
              type="submit"
              loading={isLoading}
              className="w-full !bg-gradient-to-r !from-violet-600 !to-primary-600 hover:!from-violet-500 hover:!to-primary-500 !text-white !border-none !rounded-xl !py-3.5 !font-semibold shadow-lg shadow-violet-600/10 flex items-center justify-center gap-2 group transition-all duration-300"
              size="lg"
            >
              <span>Authenticate System</span>
              <HiOutlineArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>

        {/* Security Warning Footer */}
        <p className="text-[10px] text-neutral-600 font-mono text-center mt-6 uppercase tracking-widest">
          ⚠️ SECURE SHELL. MONITOR ACTIVE. UNAUTHORIZED IPS REPORTED.
        </p>
      </motion.div>
    </div>
  );
}
