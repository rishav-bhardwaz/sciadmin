'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PencilIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { eventsApi, ApiError } from '../../lib/api';
import DeleteEventModal from './DeleteEventModal';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  registrations?: number;
  maxAttendees?: number;
  featuredImage?: string;
  venue?: string;
  category?: string;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    registrations?: number;
  };
}

const getStatusBadge = (status: Event['status']) => {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CONCLUDED: 'bg-blue-100 text-blue-800', // Support both for backward compatibility
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const statusUpper = status.toUpperCase();
  const style = styles[statusUpper] || styles.DRAFT;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function EventsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Status change state
  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsApi.getEvents({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        page,
        limit: 50
      });

      // Handle both wrapped and direct response formats
      const eventsData = response.success ? response.data?.events : response.events;

      if (eventsData && Array.isArray(eventsData)) {
        const transformedEvents = eventsData.map((event: any) => {
          // Normalize status to lowercase, handle both COMPLETED and CONCLUDED
          let normalizedStatus = 'draft';
          if (event.status) {
            const statusUpper = event.status.toUpperCase();
            if (statusUpper === 'CONCLUDED') {
              normalizedStatus = 'completed'; // Map CONCLUDED to completed
            } else {
              normalizedStatus = event.status.toLowerCase();
            }
          }
          return {
            ...event,
            status: normalizedStatus as Event['status'],
            startDate: new Date(event.startDateTime || event.startDate),
            endDate: new Date(event.endDateTime || event.endDate),
            registrations: event.registrationCount || event._count?.registrations || 0,
          };
        });
        setEvents(transformedEvents);

        // Handle pagination
        const paginationData = response.success ? response.data?.pagination : response.pagination;
        setPagination(paginationData || {
          page: 1,
          limit: 50,
          total: eventsData.length,
          pages: Math.ceil(eventsData.length / 50)
        });
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, categoryFilter, page]);

  const filteredEvents = events.filter(event => {
    if (!searchTerm) return true;
    return event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.venue && event.venue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      setIsDeleting(true);
      await eventsApi.deleteEvent(eventToDelete.id);
      toast.success(`Event "${eventToDelete.title}" deleted successfully`);
      setDeleteModalOpen(false);
      setEventToDelete(null);
      await fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete event';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      setChangingStatus(eventId);
      await eventsApi.updateEventStatus(eventId, newStatus.toUpperCase());
      toast.success(`Event status changed to ${newStatus} successfully`);
      await fetchEvents();
    } catch (err) {
      console.error('Error changing event status:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to change event status';
      toast.error(errorMessage);
    } finally {
      setChangingStatus(null);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-black shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-black shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Categories</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="competition">Competition</option>
              <option value="conference">Conference</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading events...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {event.featuredImage && (
                        <div className="flex-shrink-0 h-12 w-16 mr-4">
                          <div className="h-12 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">IMG</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {event.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.startDate.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {getStatusBadge(event.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.registrations || 0}
                      {event.maxAttendees && ` / ${event.maxAttendees}`}
                    </div>
                    {event.maxAttendees && event.registrations !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((event.registrations / event.maxAttendees) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.venue || 'TBA'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/events/${event.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="View Event"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/events/${event.id}/edit`}
                        className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                        title="Edit Event"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <div className="relative">
                        <select
                          value={event.status}
                          onChange={(e) => handleStatusChange(event.id, e.target.value)}
                          disabled={changingStatus === event.id}
                          className="text-xs border border-gray-300 rounded-md px-2 py-1 pr-6 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Change Status"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {changingStatus === event.id && (
                          <ArrowPathIcon className="absolute right-2 top-1.5 h-3 w-3 animate-spin text-gray-400" />
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteClick(event)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                        title="Delete Event"
                        disabled={isDeleting}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No events match your search criteria.'
              : 'No events found. Create your first event to get started.'
            }
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.total > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.pages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <DeleteEventModal
          isOpen={deleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          eventTitle={eventToDelete.title}
          eventId={eventToDelete.id}
          registrationsCount={eventToDelete.registrations || 0}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}