import AdminLayout from '@/components/layout/AdminLayout';
import EventsTable from '@/components/events/EventsTable';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function EventsPage() {
  return (
    <AdminLayout title="Event Management">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
            <p className="text-gray-600 mt-1">
              Manage all events from creation to completion
            </p>
          </div>
          <Link
            href="/events/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Event
          </Link>
        </div>

        {/* Events Table */}
        <EventsTable />
      </div>
    </AdminLayout>
  );
}
