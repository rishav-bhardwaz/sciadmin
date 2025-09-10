import AdminLayout from '@/components/layout/AdminLayout';

export default function SettingsPage() {
  return (
    <AdminLayout title="Website Settings">
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-black mb-3">General Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Site Name</label>
              <input
                type="text"
                defaultValue="Sciastra"
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Site Description</label>
              <textarea
                rows={3}
                defaultValue="Educational platform for science and technology"
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Contact Email</label>
              <input
                type="email"
                defaultValue="admin@sciastra.com"
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-black mb-3">Platform Settings</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs text-black">User Registration</label>
                <p className="text-xs text-gray-500">Allow new users to register</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs text-black">Email Notifications</label>
                <p className="text-xs text-gray-500">Send email notifications to users</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs text-black">Content Moderation</label>
                <p className="text-xs text-gray-500">Require approval for user posts</p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 rounded-md">
            Save Changes
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
