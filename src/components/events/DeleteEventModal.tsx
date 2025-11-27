'use client';

import { XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
  eventId: string;
  registrationsCount?: number;
  isDeleting?: boolean;
}

export default function DeleteEventModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  eventId,
  registrationsCount = 0,
  isDeleting = false,
}: DeleteEventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-gray-900">Delete Event</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="ml-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Event Details */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <p className="font-medium text-gray-900">Event Title:</p>
              <p className="text-gray-700 mt-1">{eventTitle}</p>
            </div>
            <div className="mt-3 text-sm">
              <p className="font-medium text-gray-900">Event ID:</p>
              <p className="text-gray-700 mt-1 font-mono text-xs">{eventId}</p>
            </div>
            {registrationsCount > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This event has <strong>{registrationsCount}</strong> registration{registrationsCount !== 1 ? 's' : ''}.
                  Deleting this event will permanently remove all associated registrations. This action cannot be undone.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Event</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

