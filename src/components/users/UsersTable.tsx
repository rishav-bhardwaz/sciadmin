'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  EyeIcon,
  PencilIcon,
  NoSymbolIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import BlacklistModal from "./BlacklistModal"

interface User {
  id: string;
  profilePicture?: string;
  fullName: string;
  email: string;
  joinDate: Date;
  status: 'active' | 'blacklisted';
  role: 'student' | 'mentor' | 'admin';
  postsCount: number;
  eventsAttended: number;
}

const mockUsers: User[] = [
  {
    id: '1',
    profilePicture: '/api/placeholder/40/40',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: new Date('2023-01-15'),
    status: 'active',
    role: 'student',
    postsCount: 23,
    eventsAttended: 5,
  },
  {
    id: '2',
    profilePicture: '/api/placeholder/40/40',
    fullName: 'Alice Smith',
    email: 'alice.smith@example.com',
    joinDate: new Date('2023-03-22'),
    status: 'active',
    role: 'mentor',
    postsCount: 45,
    eventsAttended: 12,
  },
  {
    id: '3',
    fullName: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    joinDate: new Date('2023-02-10'),
    status: 'blacklisted',
    role: 'student',
    postsCount: 8,
    eventsAttended: 2,
  },
  {
    id: '4',
    profilePicture: '/api/placeholder/40/40',
    fullName: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    joinDate: new Date('2023-04-05'),
    status: 'active',
    role: 'admin',
    postsCount: 67,
    eventsAttended: 18,
  },
  {
    id: '5',
    fullName: 'Mike Brown',
    email: 'mike.brown@example.com',
    joinDate: new Date('2023-05-12'),
    status: 'active',
    role: 'student',
    postsCount: 12,
    eventsAttended: 3,
  },
];

const getStatusBadge = (status: User['status']) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    blacklisted: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const getRoleBadge = (role: User['role']) => {
  const styles = {
    student: 'bg-blue-100 text-blue-800',
    mentor: 'bg-purple-100 text-purple-800',
    admin: 'bg-orange-100 text-orange-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

export default function UsersTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleBlacklistAction = (user: User) => {
    setSelectedUser(user);
    setShowBlacklistModal(true);
  };

  const handleBlacklistConfirm = (reason: string, action: 'blacklist' | 'remove') => {
    if (selectedUser) {
      console.log(`${action} user ${selectedUser.id} with reason: ${reason}`);
      // Handle blacklist/remove logic here
    }
    setShowBlacklistModal(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blacklisted">Blacklisted</option>
                </select>
              </div>
              <div className="w-40">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.profilePicture ? (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.joinDate.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(user.joinDate, { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.postsCount} posts
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.eventsAttended} events attended
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="View Profile"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/users/${user.id}/edit`}
                        className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                        title="Edit User"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleBlacklistAction(user)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        title={user.status === 'blacklisted' ? 'Remove User' : 'Blacklist User'}
                      >
                        <NoSymbolIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'No users match your search criteria.'
                : 'No users found.'
              }
            </div>
          </div>
        )}

        {/* Pagination could go here */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
                <span className="font-medium">{mockUsers.length}</span> results
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blacklist Modal */}
      {showBlacklistModal && selectedUser && (
        <BlacklistModal
          user={selectedUser}
          onConfirm={handleBlacklistConfirm}
          onCancel={() => {
            setShowBlacklistModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </>
  );
}
