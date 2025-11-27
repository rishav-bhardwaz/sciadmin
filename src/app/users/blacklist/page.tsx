// import AdminLayout from '@/components/layout/AdminLayout';

// const mockBlacklistLog = [
//   {
//     id: '1',
//     userName: 'John Doe',
//     userEmail: 'john.doe@example.com',
//     reason: 'Spam posting and inappropriate content sharing',
//     blacklistedBy: 'Admin_Sarah',
//     blacklistedDate: new Date('2024-01-15T10:30:00'),
//     status: 'active'
//   },
//   {
//     id: '2',
//     userName: 'Bob Johnson',
//     userEmail: 'bob.johnson@example.com',
//     reason: 'Harassment of other users in comments',
//     blacklistedBy: 'Admin_Mike',
//     blacklistedDate: new Date('2024-01-10T14:20:00'),
//     status: 'active'
//   },
//   {
//     id: '3',
//     userName: 'Mike Brown',
//     userEmail: 'mike.brown@example.com',
//     reason: 'Violation of community guidelines - offensive language',
//     blacklistedBy: 'Admin_Sarah',
//     blacklistedDate: new Date('2024-01-05T09:15:00'),
//     status: 'removed'
//   }
// ];

// export default function BlacklistLogPage() {
//   return (
//     <AdminLayout title="Blacklist Log">
//       <div className="space-y-4">
//         <div className="flex justify-between items-center">
//           <h3 className="text-sm font-medium text-black">Blacklisted Users</h3>
//           <div className="text-xs text-gray-500">
//             Total: {mockBlacklistLog.length} users
//           </div>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
//           <table className="min-w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">User</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reason</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Blacklisted By</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {mockBlacklistLog.map((entry) => (
//                 <tr key={entry.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3">
//                     <div>
//                       <div className="text-xs font-medium text-black">{entry.userName}</div>
//                       <div className="text-xs text-gray-500">{entry.userEmail}</div>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="text-xs text-gray-900 max-w-xs">
//                       {entry.reason}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 text-xs text-gray-600">{entry.blacklistedBy}</td>
//                   <td className="px-4 py-3">
//                     <div className="text-xs text-gray-900">
//                       {entry.blacklistedDate.toLocaleDateString()}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {entry.blacklistedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${
//                       entry.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
//                     }`}>
//                       {entry.status === 'active' ? 'Blacklisted' : 'Removed'}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex space-x-2">
//                       <button className="text-xs text-black hover:underline">View</button>
//                       {entry.status === 'active' && (
//                         <button className="text-xs text-gray-600 hover:underline">Unblock</button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="bg-white border border-gray-200 p-4 rounded-lg">
//           <h4 className="text-sm font-medium text-black mb-2">Blacklist Statistics</h4>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
//             <div>
//               <div className="text-lg font-bold text-black">
//                 {mockBlacklistLog.filter(entry => entry.status === 'active').length}
//               </div>
//               <div className="text-xs text-gray-500">Currently Blacklisted</div>
//             </div>
//             <div>
//               <div className="text-lg font-bold text-black">
//                 {mockBlacklistLog.filter(entry => entry.status === 'removed').length}
//               </div>
//               <div className="text-xs text-gray-500">Permanently Removed</div>
//             </div>
//             <div>
//               <div className="text-lg font-bold text-black">{mockBlacklistLog.length}</div>
//               <div className="text-xs text-gray-500">Total Actions</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }
