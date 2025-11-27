'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layout/AdminLayout';

export default function NotFound() {
  const router = useRouter();

  return (
    <AdminLayout title="Page Not Found">
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 Number */}
          <motion.div
            className="mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <h1 className="text-9xl font-bold text-black">404</h1>
          </motion.div>

          {/* Error Message */}
          <motion.h2
            className="text-2xl font-semibold text-black mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Page Not Found
          </motion.h2>

          <motion.p
            className="text-gray-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Link>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

