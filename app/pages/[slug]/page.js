'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import apiClient from '@/store/api/apiClient';
import { HiOutlineArrowLeft, HiOutlineHome } from 'react-icons/hi';

export default function PublicPage() {
  const params = useParams();
  const slug = params.slug;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    // Use the public endpoint (no auth required)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/pages/public/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPage(data.data);
        } else {
          setError('পেজটি পাওয়া যায়নি');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('পেজটি লোড করা যায়নি');
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-2/3" />
            <div className="h-4 bg-neutral-200 rounded w-1/3" />
            <div className="space-y-3 mt-8">
              <div className="h-4 bg-neutral-200 rounded" />
              <div className="h-4 bg-neutral-200 rounded" />
              <div className="h-4 bg-neutral-200 rounded w-5/6" />
              <div className="h-4 bg-neutral-200 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="h-16 w-16 rounded-2xl bg-neutral-200 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-800 mb-2">{error || 'পেজটি পাওয়া যায়নি'}</h1>
          <p className="text-sm text-neutral-500 mb-6">এই পেজটি বিদ্যমান নেই অথবা সরিয়ে নেওয়া হয়েছে।</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <HiOutlineHome className="h-4 w-4" />
            হোম পেজে যান
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors">
            <HiOutlineArrowLeft className="h-4 w-4" />
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">প্র</span>
              </div>
              <span className="text-sm font-semibold text-neutral-800">প্রশ্নপিডিয়া</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Content */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">{page.title}</h1>
        {page.publishedAt && (
          <p className="text-sm text-neutral-400 mb-8">
            সর্বশেষ আপডেট: {new Date(page.publishedAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        {/* Rendered HTML Content */}
        <div
          className="page-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8 mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
            <div className="h-5 w-5 rounded bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">প্র</span>
            </div>
            ProshnoPedia.com © ২০২৬
          </Link>
        </div>
      </footer>
    </div>
  );
}
