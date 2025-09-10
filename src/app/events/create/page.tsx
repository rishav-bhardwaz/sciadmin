import AdminLayout from '@/components/layout/AdminLayout';
import EventForm from '@/components/events/EventForm';

export default function CreateEventPage() {
  return (
    <AdminLayout title="Create New Event">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
          <p className="text-gray-600 mt-1">
            Set up a comprehensive event with all details, speakers, and registration settings.
          </p>
        </div>
        
        <EventForm />
      </div>
    </AdminLayout>
  );
}
