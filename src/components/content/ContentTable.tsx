'use client';

import { useState } from 'react';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import ContentModerationModal from './ContentModerationModal';

interface ContentItem {
  id: string;
  type: 'post' | 'comment';
  author: string;
  authorId: string;
  preview: string;
  fullContent: string;
  datePosted: Date;
  reportCount: number;
  reportReasons?: string[];
  status: 'active' | 'flagged' | 'removed';
  parentPost?: string; // For comments
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    type: 'post',
    author: 'John Doe',
    authorId: 'user_1',
    preview: 'Excited to share my latest research on quantum computing applications...',
    fullContent: 'Excited to share my latest research on quantum computing applications in machine learning. The results are promising and could revolutionize how we approach complex computational problems.',
    datePosted: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    reportCount: 0,
    status: 'active',
  },
  {
    id: '2',
    type: 'comment',
    author: 'Alice Smith',
    authorId: 'user_2',
    preview: 'Great insights! I have been working on similar problems...',
    fullContent: 'Great insights! I have been working on similar problems and would love to collaborate. Have you considered the implications for cryptography?',
    datePosted: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    reportCount: 0,
    status: 'active',
    parentPost: 'Quantum Computing Research',
  },
  {
    id: '3',
    type: 'post',
    author: 'Bob Johnson',
    authorId: 'user_3',
    preview: 'This is inappropriate content that violates community guidelines...',
    fullContent: 'This is inappropriate content that violates community guidelines and contains spam links to external sites.',
    datePosted: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    reportCount: 5,
    reportReasons: ['Spam', 'Inappropriate content', 'External links'],
    status: 'flagged',
  },
  {
    id: '4',
    type: 'comment',
    author: 'Sarah Wilson',
    authorId: 'user_4',
    preview: 'Thanks for organizing such an amazing event! The speakers were...',
    fullContent: 'Thanks for organizing such an amazing event! The speakers were incredibly knowledgeable and the networking opportunities were fantastic.',
    datePosted: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    reportCount: 0,
    status: 'active',
    parentPost: 'AI Ethics Seminar Feedback',
  },
  {
    id: '5',
    type: 'post',
    author: 'Mike Brown',
    authorId: 'user_5',
    preview: 'Removed content due to policy violation',
    fullContent: 'This content has been removed by moderators for violating community guidelines.',
    datePosted: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    reportCount: 3,
    reportReasons: ['Harassment', 'Off-topic'],
    status: 'removed',
  },
];

const getStatusBadge = (status: ContentItem['status'], reportCount: number) => {
  if (status === 'removed') {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Removed</span>;
  }
  if (status === 'flagged' || reportCount > 0) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Flagged</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
};

interface ContentTableProps {
  activeTab: string;
}

export default function ContentTable({ activeTab }: ContentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showModerationModal, setShowModerationModal] = useState(false);

  const filteredContent = mockContent.filter(item => {
    const matchesSearch = item.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'posts':
        return item.type === 'post' && matchesSearch;
      case 'comments':
        return item.type === 'comment' && matchesSearch;
      case 'reported':
        return item.reportCount > 0 && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const handleModerationAction = (content: ContentItem) => {
    setSelectedContent(content);
    setShowModerationModal(true);
  };

  const handleModerationConfirm = (action: string, reason?: string) => {
    if (selectedContent) {
      console.log(`${action} content ${selectedContent.id}`, reason ? `with reason: ${reason}` : '');
      // Handle moderation logic here
    }
    setShowModerationModal(false);
    setSelectedContent(null);
  };

  return (
    <>
      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search content by text or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-4">
          {filteredContent.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.type === 'post' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                    {getStatusBadge(item.status, item.reportCount)}
                    {item.reportCount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.reportCount} report{item.reportCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-900 font-medium">
                      {item.status === 'removed' ? 'Removed content' : item.preview}
                    </p>
                    {item.parentPost && (
                      <p className="text-xs text-gray-500 mt-1">
                        Comment on: {item.parentPost}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>by {item.author}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(item.datePosted, { addSuffix: true })}</span>
                    <span>•</span>
                    <span>ID: {item.id}</span>
                  </div>
                  
                  {item.reportReasons && item.reportReasons.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-600 font-medium">Report reasons:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.reportReasons.map((reason, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleModerationAction(item)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                    title="View Full Content"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  
                  {item.status !== 'removed' && (
                    <>
                      <button
                        onClick={() => handleModerationAction(item)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                        title="Edit Content"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleModerationAction(item)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        title="Remove Content"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleModerationAction(item)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                        title="Send Warning"
                      >
                        <FlagIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm 
                ? 'No content matches your search criteria.' 
                : activeTab === 'reported' 
                  ? 'No reported content found.' 
                  : 'No content found.'
              }
            </div>
          </div>
        )}
      </div>

      {/* Moderation Modal */}
      {showModerationModal && selectedContent && (
        <ContentModerationModal
          content={selectedContent}
          onConfirm={handleModerationConfirm}
          onCancel={() => {
            setShowModerationModal(false);
            setSelectedContent(null);
          }}
        />
      )}
    </>
  );
}
