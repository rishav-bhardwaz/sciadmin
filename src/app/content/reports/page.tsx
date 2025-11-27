'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { contentApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface Report {
  id: string;
  reportType: 'POST' | 'PROFILE';
  reportedId: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VALIDATED' | 'DISMISSED';
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  reportedContent?: {
    id: string;
    content?: string;
    authorId?: string;
    authorName?: string;
    profileName?: string;
    phoneNumber?: string;
    email?: string;
    status?: string;
  };
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  actionTaken?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportDetailsModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onActionTaken: () => void;
}

function ReportDetailsModal({ report, isOpen, onClose, onActionTaken }: ReportDetailsModalProps) {
  const [action, setAction] = useState<'validate' | 'dismiss' | 'escalate' | 'review'>('review');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !report) return null;

  const handleSubmit = async () => {
    if (!report) return;

    try {
      setIsSubmitting(true);
      const response = await contentApi.takeActionOnReport(report.id, action, notes || undefined);
      
      if (response.success) {
        toast.success(`Report ${action === 'validate' ? 'validated' : action === 'dismiss' ? 'dismissed' : action === 'escalate' ? 'escalated' : 'marked for review'} successfully`);
        onActionTaken();
        onClose();
        setNotes('');
      } else {
        throw new Error(response.message || 'Failed to take action');
      }
    } catch (error: any) {
      console.error('Error taking action on report:', error);
      toast.error(error.message || 'Failed to take action on report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {report.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Report Info */}
          <div className="space-y-6">
            {/* Status Badge */}
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                report.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                report.status === 'VALIDATED' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {report.status.replace('_', ' ')}
              </span>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <div className="flex items-center space-x-2">
                {report.reportType === 'POST' ? (
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <UserIcon className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-gray-900">{report.reportType}</span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <p className="text-gray-900">{report.reason}</p>
            </div>

            {/* Description */}
            {report.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{report.description}</p>
              </div>
            )}

            {/* Reported By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
              <div className="text-gray-900">
                <p className="font-medium">{report.reportedBy.name}</p>
                <p className="text-sm text-gray-500">{report.reportedBy.email}</p>
              </div>
            </div>

            {/* Reported Content */}
            {report.reportedContent && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reported Content</label>
                {report.reportType === 'POST' ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {report.reportedContent.content && (
                      <p className="text-gray-900 mb-2">{report.reportedContent.content}</p>
                    )}
                    {report.reportedContent.authorName && (
                      <p className="text-sm text-gray-500">Author: {report.reportedContent.authorName}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {report.reportedContent.profileName && (
                      <p className="text-gray-900 font-medium mb-2">{report.reportedContent.profileName}</p>
                    )}
                    {report.reportedContent.email && (
                      <p className="text-sm text-gray-500">Email: {report.reportedContent.email}</p>
                    )}
                    {report.reportedContent.phoneNumber && (
                      <p className="text-sm text-gray-500">Phone: {report.reportedContent.phoneNumber}</p>
                    )}
                    {report.reportedContent.status && (
                      <p className="text-sm text-gray-500 mt-2">
                        Status: <span className="font-medium">{report.reportedContent.status}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Review Info */}
            {report.reviewedBy && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Information</label>
                <p className="text-sm text-gray-600">Reviewed by: {report.reviewedBy}</p>
                {report.reviewedAt && (
                  <p className="text-sm text-gray-600">Reviewed at: {new Date(report.reviewedAt).toLocaleString()}</p>
                )}
                {report.reviewNotes && (
                  <p className="text-sm text-gray-600 mt-2">Notes: {report.reviewNotes}</p>
                )}
              </div>
            )}

            {/* Action Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Take Action</label>
              
              {/* Action Selection */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setAction('validate')}
                  className={`p-3 rounded-lg border-2 text-left ${
                    action === 'validate'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className={`h-5 w-5 ${
                      action === 'validate' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900">Validate</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Confirm violation</p>
                </button>

                <button
                  onClick={() => setAction('dismiss')}
                  className={`p-3 rounded-lg border-2 text-left ${
                    action === 'dismiss'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className={`h-5 w-5 ${
                      action === 'dismiss' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900">Dismiss</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Invalid report</p>
                </button>

                <button
                  onClick={() => setAction('escalate')}
                  className={`p-3 rounded-lg border-2 text-left ${
                    action === 'escalate'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className={`h-5 w-5 ${
                      action === 'escalate' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900">Escalate</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Needs review</p>
                </button>

                <button
                  onClick={() => setAction('review')}
                  className={`p-3 rounded-lg border-2 text-left ${
                    action === 'review'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ClockIcon className={`h-5 w-5 ${
                      action === 'review' ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900">Review</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mark under review</p>
                </button>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm px-3 py-2"
                  placeholder="Add notes about your decision..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Submit Action'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'UNDER_REVIEW' | 'VALIDATED' | 'DISMISSED' | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'post' | 'profile' | 'all'>('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      const response = await contentApi.getReports(params);

      if (response.success && response.data) {
        setReports(response.data.reports || []);
      } else {
        throw new Error(response.message || 'Failed to fetch reports');
      }
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
      toast.error(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, typeFilter]);

  const handleViewDetails = async (report: Report) => {
    try {
      const response = await contentApi.getReportDetails(report.id);
      if (response.success && response.data) {
        setSelectedReport(response.data);
        setIsModalOpen(true);
      } else {
        // Fallback to the report from list
        setSelectedReport(report);
        setIsModalOpen(true);
      }
    } catch (err: any) {
      console.error('Error fetching report details:', err);
      // Fallback to the report from list
      setSelectedReport(report);
      setIsModalOpen(true);
    }
  };

  const handleActionTaken = () => {
    fetchReports();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      UNDER_REVIEW: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review' },
      VALIDATED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Validated' },
      DISMISSED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Dismissed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <AdminLayout title="Content Reports">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Reports</h2>
          <p className="text-gray-600 mt-1">
            Review and take action on reported posts and profiles
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                }}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="VALIDATED">Validated</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                }}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm px-3 py-2"
              >
                <option value="all">All Types</option>
                <option value="post">Posts</option>
                <option value="profile">Profiles</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchReports}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-500">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchReports}
                className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
              >
                Retry
              </button>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No reports found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {report.reportType === 'POST' ? (
                              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                            ) : (
                              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                            )}
                            <span className="text-sm text-gray-900">{report.reportType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{report.reason}</div>
                          {report.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {report.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.reportedBy.name}</div>
                          <div className="text-sm text-gray-500">{report.reportedBy.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(report)}
                            className="text-gray-900 hover:text-gray-700 inline-flex items-center space-x-1"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Results Count */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {reports.length} report{reports.length !== 1 ? 's' : ''}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report Details Modal */}
      <ReportDetailsModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReport(null);
        }}
        onActionTaken={handleActionTaken}
      />
    </AdminLayout>
  );
}
