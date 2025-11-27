'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';

interface ContentItem {
  id: string;
  type: 'post' | 'comment';
  author?: string | {
    id: string;
    name?: string;
    email?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  authorId: string;
  preview: string;
  fullContent: string;
  datePosted: Date;
  reportCount: number;
  reportReasons?: string[];
  status: 'active' | 'flagged' | 'removed';
  parentPost?: string;
}

interface ContentModerationModalProps {
  content: ContentItem;
  onConfirm: (action: string, reason?: string) => void;
  onCancel: () => void;
}

export default function ContentModerationModal({ content, onConfirm, onCancel }: ContentModerationModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState(content.fullContent);
  const [reason, setReason] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get author name from either string or object
  const getAuthorName = () => {
    if (typeof content.author === 'string') {
      return content.author;
    }
    if (content.author?.name) {
      return content.author.name;
    }
    if (content.author?.profile?.firstName || content.author?.profile?.lastName) {
      return `${content.author.profile.firstName || ''} ${content.author.profile.lastName || ''}`.trim();
    }
    if (content.author?.email) {
      return content.author.email;
    }
    return 'Unknown User';
  };

  const handleSubmit = async () => {
    if (!selectedAction) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (selectedAction === 'edit') {
        onConfirm('edit', editedContent);
      } else if (selectedAction === 'warning') {
        onConfirm('warning', warningMessage);
      } else {
        onConfirm(selectedAction, reason);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionTitle = () => {
    switch (selectedAction) {
      case 'view': return 'View Full Content';
      case 'edit': return 'Edit Content';
      case 'remove': return 'Remove Content';
      case 'delete': return 'Delete Content Permanently';
      case 'warning': return 'Send Warning to Author';
      default: return 'Content Moderation';
    }
  };

  return (
    <Dialog open={true} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
      
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="relative w-full max-w-3xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
            <div className="p-6">
              <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900 mb-6">
                {getActionTitle()}
              </Dialog.Title>

              {/* Content Preview */}
              <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      content.type === 'post' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                    </span>
                    <span className="text-sm text-gray-700 font-medium">by {getAuthorName()}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-xs text-gray-500 font-mono">ID: {content.id}</span>
                  </div>
                  {content.reportCount && content.reportCount > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {content.reportCount} report{content.reportCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                {content.parentPost && (
                  <p className="text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">Comment on: {content.parentPost}</p>
                )}
                
                <div className="text-sm text-gray-900">
                  {selectedAction === 'edit' ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={6}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                      placeholder="Edit content..."
                    />
                  ) : (
                    <div className="bg-white rounded-md p-4 border border-gray-200">
                      <p className="whitespace-pre-wrap text-gray-900">{content.fullContent || 'No content available'}</p>
                    </div>
                  )}
                </div>
                
                {content.reportReasons && content.reportReasons.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-red-600 font-medium mb-2">Report reasons:</p>
                    <div className="flex flex-wrap gap-2">
                      {content.reportReasons.map((reason, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!selectedAction && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setSelectedAction('view')}
                    className="flex flex-col items-center justify-center p-4 border-2 border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 bg-white"
                  >
                    <EyeIcon className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-900">View Only</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedAction('edit')}
                    className="flex flex-col items-center justify-center p-4 border-2 border-green-300 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all duration-200 bg-white"
                  >
                    <PencilIcon className="h-6 w-6 text-green-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-900">Edit Content</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedAction('remove')}
                    className="flex flex-col items-center justify-center p-4 border-2 border-orange-300 rounded-lg hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 bg-white"
                  >
                    <TrashIcon className="h-6 w-6 text-orange-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-900">Soft Delete</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedAction('delete')}
                    className="flex flex-col items-center justify-center p-4 border-2 border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 bg-white"
                  >
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-900">Delete Permanently</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedAction('warning')}
                    className="flex flex-col items-center justify-center p-4 border-2 border-yellow-300 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 transition-all duration-200 bg-white col-span-2"
                  >
                    <FlagIcon className="h-6 w-6 text-yellow-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-900">Send Warning to Author</span>
                  </button>
                </div>
              )}

              {selectedAction && selectedAction !== 'view' && selectedAction !== 'edit' && (
                <div className="space-y-4 mb-6">
                  {selectedAction === 'warning' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Warning Message
                      </label>
                      <textarea
                        value={warningMessage}
                        onChange={(e) => setWarningMessage(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                        placeholder="Enter a warning message to send to the content author..."
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Reason for {selectedAction === 'remove' ? 'removing' : 'deleting'} this content
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                        placeholder="Provide a reason for this moderation action..."
                      />
                    </div>
                  )}
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-md p-4">
                    <p className="text-sm text-yellow-800">
                      {selectedAction === 'remove' && 'This will remove the content from public view but keep it in the admin panel for records.'}
                      {selectedAction === 'delete' && 'This will permanently delete the content from the database. This action cannot be undone.'}
                      {selectedAction === 'warning' && 'This will send a direct message to the content author about their post.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {selectedAction && selectedAction !== 'view' && (
                  <button
                    onClick={() => {
                      setSelectedAction(null);
                      setReason('');
                      setWarningMessage('');
                      setEditedContent(content.fullContent);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                  >
                    Back
                  </button>
                )}
                
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  {selectedAction === 'view' ? 'Close' : 'Cancel'}
                </button>
                
                {selectedAction && selectedAction !== 'view' && (
                  <button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting || 
                      (selectedAction === 'warning' && !warningMessage.trim()) ||
                      (selectedAction !== 'warning' && selectedAction !== 'edit' && !reason.trim())
                    }
                    className={`px-5 py-2.5 text-sm font-semibold text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      selectedAction === 'edit' 
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : selectedAction === 'warning'
                        ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                        : selectedAction === 'remove'
                        ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current`}
                  >
                    {isSubmitting ? 'Processing...' : `Confirm ${selectedAction === 'edit' ? 'Edit' : selectedAction === 'warning' ? 'Send Warning' : selectedAction === 'remove' ? 'Remove' : 'Delete'}`}
                  </button>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
