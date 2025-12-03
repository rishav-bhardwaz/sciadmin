// import AdminLayout from "@/components/layout/AdminLayout";
// import { usersApi } from "../../../lib/api";

// interface UserProfilePageProps {
//   params: {
//     id: string;
//   };
// }

// export default async function UserProfilePage({ params }: UserProfilePageProps) {
//   const { id } = await params;
//   const user = await usersApi.getUserById(id);

//   return (
//     <AdminLayout title="User Profile">
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
//             <p className="text-gray-700 mt-1">Detailed user information</p>
//           </div>
//         </div>

//         {/* Profile Section */}
//         <div className="bg-white shadow rounded-lg p-6 space-y-4">
//           <h3 className="text-xl font-bold text-gray-800">Basic Details</h3>
//           <div className="grid grid-cols-2 gap-4 text-gray-700">
//             <p><strong>User ID:</strong> {user.id}</p>
//             <p><strong>Status:</strong> {user.status}</p>
//             <p><strong>Phone:</strong> {user.phoneNumber}</p>
//             <p><strong>Email:</strong> {user.profile?.email ?? "-"}</p>
//             <p><strong>Name:</strong> {user.profile?.name ?? "-"}</p>
//             <p><strong>Profession:</strong> {user.profile?.profession ?? "-"}</p>
//             <p><strong>Location:</strong> {user.profile?.location ?? "-"}</p>
//           </div>
//         </div>

//         {/* Stats Section */}
//         <div className="bg-white shadow rounded-lg p-6 space-y-4">
//           <h3 className="text-xl font-bold text-gray-800">User Statistics</h3>

//           <div className="grid grid-cols-3 gap-4">
//             <div className="p-4 border rounded-lg text-center">
//               <p className="text-lg font-bold">{user.stats.totalPosts}</p>
//               <span className="text-sm text-gray-600">Posts</span>
//             </div>
//             <div className="p-4 border rounded-lg text-center">
//               <p className="text-lg font-bold">{user.stats.eventRegistrations}</p>
//               <span className="text-sm text-gray-600">Event Registrations</span>
//             </div>
//             <div className="p-4 border rounded-lg text-center">
//               <p className="text-lg font-bold">{user.stats.connectionsSent + user.stats.connectionsReceived}</p>
//               <span className="text-sm text-gray-600">Connections</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }
