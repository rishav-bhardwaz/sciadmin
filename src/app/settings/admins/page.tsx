import AdminLayout from '@/components/layout/AdminLayout';

const mockAdmins = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@sciastra.com',
    role: 'Super Admin',
    lastLogin: '2 hours ago',
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@sciastra.com',
    role: 'Admin',
    lastLogin: '1 day ago',
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@sciastra.com',
    role: 'Moderator',
    lastLogin: '3 days ago',
    status: 'inactive'
  }
];

export default function AdminUsersPage() {
  return (
    <AdminLayout title="Admin Users">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-black">Admin Users</h3>
          <button className="px-3 py-1 bg-black text-white text-xs hover:bg-gray-800 rounded-md">
            Add Admin
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Last Login</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-6 w-6 bg-black text-white flex items-center justify-center text-xs font-bold mr-2 rounded-md">
                        {admin.name.charAt(0)}
                      </div>
                      <span className="text-xs text-black">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{admin.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-black rounded-md">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{admin.lastLogin}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${
                      admin.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="text-xs text-black hover:underline">Edit</button>
                      <button className="text-xs text-gray-600 hover:underline">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-black mb-3">Add New Admin</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Full Name"
              className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black rounded-md"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black rounded-md"
            />
            <select className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black rounded-md">
              <option>Select Role</option>
              <option>Admin</option>
              <option>Moderator</option>
              <option>Super Admin</option>
            </select>
          </div>
          <div className="mt-3">
            <button className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 rounded-md">
              Add Admin User
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
