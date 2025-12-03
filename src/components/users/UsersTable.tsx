'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  EyeIcon,
  PencilIcon,
  NoSymbolIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import BlacklistModal from "./BlacklistModal";
import { usersApi, ApiError } from '../../lib/api';

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
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const limit = 50;

  // Reset to page 1 when filters change
  const resetPage = () => setPage(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await usersApi.getUsers({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        page,
        limit
      });

      if (response.success && response.data) {
        console.log(response.data);
        const usersData = response.data.users || response.data || [];
        console.log(usersData)
        const mappedUsers: User[] = usersData.map((user: any) => ({
          id: user.id || user._id,
          profilePicture: user.profilePicture || user.profileImage,
          fullName: user.fullName || user.name || user.profileName || user.profile?.name || 'Unknown',
          email: user.email || '',
          joinDate: user?.createdAt ? new Date(user.createdAt) : new Date(),
          status: user.status === 'BLACKLISTED' || user.status === 'blacklisted' ? 'blacklisted' : 'active',
          role: user.role || 'student',
          postsCount: user.postsCount || user.stats.totalPosts || 0,
          eventsAttended: user.eventsAttended || user.profile?.eventRegistrations || 0,
        }));

        setUsers(mappedUsers);
        setPagination(response.data.pagination || {
          page,
          limit,
          total: mappedUsers.length,
          pages: Math.ceil(mappedUsers.length / limit)
        });
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [page, statusFilter, roleFilter, searchTerm]);

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
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-600 text-gray-900 focus:outline-none focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                  className="block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blacklisted">Blacklisted</option>
                </select>
              </div>
              <div className="w-40">
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); resetPage(); }}
                  className="block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-900">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-red-600">
                    Error: {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-900">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
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
                        <div className="text-sm text-gray-700">
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
                    <div className="text-sm text-gray-700">
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
                    <div className="text-sm text-gray-700">
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
              ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && users.length === 0 && (searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
          <div className="text-center py-12">
            <div className="text-gray-900">
              No users match your search criteria.
            </div>
          </div>
        )}

        {/* Pagination could go here */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-900">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.pages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
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
