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
  author: string;
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
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {getActionTitle()}
            </Dialog.Title>

            {/* Content Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    content.type === 'post' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                  </span>
                  <span className="text-sm text-gray-600">by {content.author}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-400">ID: {content.id}</span>
                </div>
                {content.reportCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {content.reportCount} report{content.reportCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {content.parentPost && (
                <p className="text-xs text-gray-500 mb-2">Comment on: {content.parentPost}</p>
              )}
              
              <div className="text-sm text-gray-900">
                {selectedAction === 'edit' ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={6}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{content.fullContent}</p>
                )}
              </div>
              
              {content.reportReasons && content.reportReasons.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-red-600 font-medium mb-1">Report reasons:</p>
                  <div className="flex flex-wrap gap-1">
                    {content.reportReasons.map((reason, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!selectedAction && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setSelectedAction('view')}
                  className="flex items-center justify-center p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">View Only</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('edit')}
                  className="flex items-center justify-center p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <PencilIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Edit Content</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('remove')}
                  className="flex items-center justify-center p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <TrashIcon className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium">Soft Delete</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('delete')}
                  className="flex items-center justify-center p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium">Delete Permanently</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('warning')}
                  className="flex items-center justify-center p-3 border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors col-span-2"
                >
                  <FlagIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium">Send Warning to Author</span>
                </button>
              </div>
            )}

            {selectedAction && selectedAction !== 'view' && selectedAction !== 'edit' && (
              <div className="space-y-4 mb-6">
                {selectedAction === 'warning' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warning Message
                    </label>
                    <textarea
                      value={warningMessage}
                      onChange={(e) => setWarningMessage(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter a warning message to send to the content author..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for {selectedAction === 'remove' ? 'removing' : 'deleting'} this content
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Provide a reason for this moderation action..."
                    />
                  </div>
                )}
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    {selectedAction === 'remove' && 'This will remove the content from public view but keep it in the admin panel for records.'}
                    {selectedAction === 'delete' && 'This will permanently delete the content from the database. This action cannot be undone.'}
                    {selectedAction === 'warning' && 'This will send a direct message to the content author about their post.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {selectedAction && selectedAction !== 'view' && (
                <button
                  onClick={() => {
                    setSelectedAction(null);
                    setReason('');
                    setWarningMessage('');
                    setEditedContent(content.fullContent);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
              )}
              
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedAction === 'edit' 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : selectedAction === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                      : selectedAction === 'remove'
                      ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? 'Processing...' : `Confirm ${selectedAction === 'edit' ? 'Edit' : selectedAction === 'warning' ? 'Send Warning' : selectedAction === 'remove' ? 'Remove' : 'Delete'}`}
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
