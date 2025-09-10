'use client';

import { motion } from 'framer-motion';
import AdminLayout from '@/components/layout/AdminLayout';
import { useState } from 'react';

interface ReportedItem {
  id: string;
  type: 'comment' | 'post' | 'user';
  reportedBy: string;
  reason: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
  content: string;
}

export default function ReportedItemsPage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'reviewed' | 'resolved'>('pending');

  // Mock data - replace with actual data fetching
  const reportedItems: ReportedItem[] = [
    {
      id: '1',
      type: 'comment',
      reportedBy: 'user@example.com',
      reason: 'Inappropriate content',
      date: '2025-09-10',
      status: 'pending',
      content: 'This is an example of reported content...'
    },
    // Add more mock items as needed
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const tabs = ['pending', 'reviewed', 'resolved'] as const;

  return (
    <AdminLayout title="Reported Items">
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Status Tabs */}
        <motion.div 
          className="flex space-x-4 border-b border-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`pb-4 px-4 text-sm font-medium capitalize ${
                selectedTab === tab
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab} ({reportedItems.filter(item => item.status === tab).length})
            </motion.button>
          ))}
        </motion.div>

        {/* Reported Items List */}
        <motion.div 
          className="grid gap-4"
          variants={containerVariants}
        >
          {reportedItems
            .filter(item => item.status === selectedTab)
            .map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-black">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Report
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Reported by {item.reportedBy} on {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <motion.span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      item.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : item.status === 'reviewed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.status}
                  </motion.span>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-black">Reason:</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-black">Reported Content:</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                </div>

                <motion.div 
                  className="mt-6 flex space-x-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Review
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-black font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Dismiss
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
