// 'use client';

// import { useState, useEffect } from 'react';
// import AdminLayout from '@/components/layout/AdminLayout';
// import { authApi, ApiError } from '../../../lib/api';

// const mockAdmins = [
//   {
//     id: '1',
//     name: 'Admin User',
//     email: 'admin@sciastra.com',
//     role: 'Super Admin',
//     lastLogin: '2 hours ago',
//     status: 'active'
//   },
//   {
//     id: '2',
//     name: 'Sarah Wilson',
//     email: 'sarah@sciastra.com',
//     role: 'Admin',
//     lastLogin: '1 day ago',
//     status: 'active'
//   },
//   {
//     id: '3',
//     name: 'Mike Johnson',
//     email: 'mike@sciastra.com',
//     role: 'Moderator',
//     lastLogin: '3 days ago',
//     status: 'inactive'
//   }
// ];

// export default function AdminUsersPage() {
//   const [admins, setAdmins] = useState(mockAdmins);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newAdmin, setNewAdmin] = useState({
//     name: '',
//     email: '',
//     role: 'admin'
//   });

//   // For now, we'll use mock data since the admin endpoints work but might need specific formatting
//   // The /admin/admin/all endpoint exists and works with proper authentication

//   useEffect(() => {
//     // Simulate loading delay for now
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, []);

//   const handleAddAdmin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       // This would integrate with the authApi.register endpoint when admin registration is implemented
//       console.log('Adding admin:', newAdmin);

//       // For now, just add to local state
//       const newAdminWithId = {
//         ...newAdmin,
//         id: Date.now().toString(),
//         lastLogin: 'Never',
//         status: 'active' as const
//       };

//       setAdmins([newAdminWithId, ...admins]);
//       setNewAdmin({ name: '', email: '', role: 'admin' });
//       setShowAddForm(false);
//     } catch (err) {
//       setError(err instanceof ApiError ? err.message : 'Failed to add admin');
//     }
//   };

//   return (
//     <AdminLayout title="Admin Users">
//       <div className="space-y-4">
//         <div className="flex justify-between items-center">
//           <h3 className="text-sm font-medium text-black">Admin Users</h3>
//           <button
//             onClick={() => setShowAddForm(!showAddForm)}
//             className="px-3 py-1 bg-black text-white text-xs hover:bg-gray-800 rounded-md"
//           >
//             {showAddForm ? 'Cancel' : 'Add Admin'}
//           </button>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
//           <table className="min-w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Role</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Last Login</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {loading ? (
//                 <tr>
//                   <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
//                     Loading admins...
//                   </td>
//                 </tr>
//               ) : error ? (
//                 <tr>
//                   <td colSpan={6} className="px-4 py-3 text-center text-red-500">
//                     Error: {error}
//                   </td>
//                 </tr>
//               ) : (
//                 admins.map((admin) => (
//                 <tr key={admin.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3">
//                     <div className="flex items-center">
//                       <div className="h-6 w-6 bg-black text-white flex items-center justify-center text-xs font-bold mr-2 rounded-md">
//                         {admin.name.charAt(0)}
//                       </div>
//                       <span className="text-xs text-black">{admin.name}</span>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 text-xs text-gray-600">{admin.email}</td>
//                   <td className="px-4 py-3">
//                     <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-black rounded-md">
//                       {admin.role}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-xs text-gray-600">{admin.lastLogin}</td>
//                   <td className="px-4 py-3">
//                     <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${
//                       admin.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
//                     }`}>
//                       {admin.status}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex space-x-2">
//                       <button className="text-xs text-black hover:underline">Edit</button>
//                       <button className="text-xs text-gray-600 hover:underline">Remove</button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {showAddForm && (
//           <div className="bg-white border border-gray-200 p-4 rounded-lg">
//             <h4 className="text-sm font-medium text-black mb-3">Add New Admin</h4>
//             <form onSubmit={handleAddAdmin}>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                 <input
//                   type="text"
//                   placeholder="Full Name"
//                   value={newAdmin.name}
//                   onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
//                   required
//                   className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black rounded-md"
//                 />
//                 <input
//                   type="email"
//                   placeholder="Email Address"
//                   value={newAdmin.email}
//                   onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
//                   required
//                   className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black rounded-md"
//                 />
//                 <select
//                   value={newAdmin.role}
//                   onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
//                   className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black rounded-md"
//                 >
//                   <option value="admin">Admin</option>
//                   <option value="moderator">Moderator</option>
//                   <option value="super_admin">Super Admin</option>
//                 </select>
//               </div>
//               <div className="mt-3">
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 rounded-md"
//                 >
//                   Add Admin User
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }
