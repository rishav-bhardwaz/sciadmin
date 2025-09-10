'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import {
  ExclamationTriangleIcon,
  NoSymbolIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  fullName: string;
  email: string;
  status: 'active' | 'blacklisted';
}

interface BlacklistModalProps {
  user: User;
  onConfirm: (reason: string, action: 'blacklist' | 'remove') => void;
  onCancel: () => void;
}

export default function BlacklistModal({ user, onConfirm, onCancel }: BlacklistModalProps) {
  const [selectedAction, setSelectedAction] = useState<'blacklist' | 'remove' | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBlacklisted = user.status === 'blacklisted';

  const handleSubmit = async () => {
    if (!selectedAction || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onConfirm(reason, selectedAction);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionTitle = () => {
    if (isBlacklisted) {
      return selectedAction === 'remove' ? 'Remove User Account' : 'Manage Blacklisted User';
    }
    return selectedAction === 'blacklist' ? 'Blacklist User Account' : selectedAction === 'remove' ? 'Remove User Account' : 'User Account Action';
  };

  const getActionDescription = () => {
    if (selectedAction === 'blacklist') {
      return 'The user will not be able to log in, post content, or register for events. Their existing content can be managed separately.';
    }
    if (selectedAction === 'remove') {
      return 'This will permanently delete the user account and all associated data. This action cannot be undone.';
    }
    return 'Choose an action to take on this user account.';
  };

  return (
    <Dialog open={true} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {getActionTitle()}
                </Dialog.Title>
              </div>
            </div>

            <div className="mt-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </div>

              {!selectedAction && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Choose an action to take on this user account:
                  </p>
                  
                  {!isBlacklisted && (
                    <button
                      onClick={() => setSelectedAction('blacklist')}
                      className="w-full flex items-center p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <NoSymbolIcon className="h-5 w-5 text-orange-600 mr-3" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">Blacklist User</div>
                        <div className="text-xs text-gray-500">Restrict account access (recommended)</div>
                      </div>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedAction('remove')}
                    className="w-full flex items-center p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5 text-red-600 mr-3" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {isBlacklisted ? 'Permanently Delete User' : 'Remove User'}
                      </div>
                      <div className="text-xs text-gray-500">Permanently delete account and data</div>
                    </div>
                  </button>
                </div>
              )}

              {selectedAction && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      {getActionDescription()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for {selectedAction === 'blacklist' ? 'blacklisting' : 'removing'} this user *
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={`Please provide a detailed reason for ${selectedAction === 'blacklist' ? 'blacklisting' : 'removing'} this user. This will be logged for audit purposes.`}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This reason will be permanently recorded in the audit log.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              {selectedAction && (
                <button
                  onClick={() => {
                    setSelectedAction(null);
                    setReason('');
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
                Cancel
              </button>
              
              {selectedAction && (
                <button
                  onClick={handleSubmit}
                  disabled={!reason.trim() || isSubmitting}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedAction === 'blacklist'
                      ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? 'Processing...' : `Confirm ${selectedAction === 'blacklist' ? 'Blacklist' : 'Removal'}`}
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
