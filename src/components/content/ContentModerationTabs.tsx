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
  { id: 'all', name: 'All Content', icon: Squares2X2Icon },
  { id: 'posts', name: 'Posts', icon: DocumentTextIcon },
  { id: 'comments', name: 'Comments', icon: ChatBubbleLeftIcon },
  { id: 'reported', name: 'Reported Items', icon: ExclamationTriangleIcon },
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
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <ContentTable activeTab={activeTab} />
    </div>
  );
}
