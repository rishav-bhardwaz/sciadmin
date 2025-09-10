'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PencilIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'published' | 'concluded';
  registrations: number;
  maxAttendees?: number;
  featuredImage?: string;
  venue: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Quantum Mechanics Workshop',
    startDate: new Date('2024-02-15T10:00:00'),
    endDate: new Date('2024-02-15T16:00:00'),
    status: 'published',
    registrations: 45,
    maxAttendees: 50,
    featuredImage: '/api/placeholder/80/60',
    venue: 'Physics Lab A',
  },
  {
    id: '2',
    title: 'AI Ethics Seminar',
    startDate: new Date('2024-02-20T14:00:00'),
    endDate: new Date('2024-02-20T17:00:00'),
    status: 'published',
    registrations: 120,
    maxAttendees: 100,
    featuredImage: '/api/placeholder/80/60',
    venue: 'Online',
  },
  {
    id: '3',
    title: 'Data Science Bootcamp',
    startDate: new Date('2024-03-01T09:00:00'),
    endDate: new Date('2024-03-03T18:00:00'),
    status: 'draft',
    registrations: 0,
    maxAttendees: 30,
    venue: 'Computer Lab B',
  },
  {
    id: '4',
    title: 'Robotics Competition',
    startDate: new Date('2024-01-10T10:00:00'),
    endDate: new Date('2024-01-10T18:00:00'),
    status: 'concluded',
    registrations: 80,
    maxAttendees: 80,
    featuredImage: '/api/placeholder/80/60',
    venue: 'Engineering Hall',
  },
];

const getStatusBadge = (status: Event['status']) => {
  const styles = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    concluded: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function EventsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      // Handle delete logic here
      console.log('Deleting event:', eventId);
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="concluded">Concluded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(event.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {event.registrations}
                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                  </div>
                  {event.maxAttendees && (
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
                  {event.venue}
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
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                      title="Delete Event"
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

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No events match your search criteria.' 
              : 'No events found. Create your first event to get started.'
            }
          </div>
        </div>
      )}
    </div>
  );
}
