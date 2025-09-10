'use client';

import { useState } from 'react';
import {
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import ContentTable from './ContentTable';

const tabs = [
  { id: 'all', name: 'All Content', icon: Squares2X2Icon, count: 1247 },
  { id: 'posts', name: 'Posts', icon: DocumentTextIcon, count: 892 },
  { id: 'comments', name: 'Comments', icon: ChatBubbleLeftIcon, count: 355 },
  { id: 'reported', name: 'Reported Items', icon: ExclamationTriangleIcon, count: 12 },
];

export default function ContentModerationTabs() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon
                className={clsx(
                  'mr-2 h-5 w-5',
                  activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {tab.name}
              <span
                className={clsx(
                  'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium',
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-900'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <ContentTable activeTab={activeTab} />
    </div>
  );
}
