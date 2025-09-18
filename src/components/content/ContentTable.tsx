'use client';

import { useState, useEffect } from 'react';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import ContentModerationModal from './ContentModerationModal';
import { contentApi, ApiError } from '../../lib/api';

interface ContentItem {
  id: string;
  type: 'post' | 'comment';
  author?: {
    id: string;
    name?: string;
    email?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  authorId: string;
  title?: string;
  content?: string;
  preview?: string;
  fullContent?: string;
  datePosted?: Date;
  createdAt?: string;
  reportCount?: number;
  reportReasons?: string[];
  status?: 'active' | 'flagged' | 'removed';
  parentPost?: string;
  post?: {
    id: string;
    title?: string;
    content?: string;
  };
  isDeleted?: boolean;
  deletedAt?: string;
}

const getStatusBadge = (item: ContentItem) => {
  if (item.status === 'removed' || item.isDeleted) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Removed</span>;
  }
  if (item.status === 'flagged' || (item.reportCount && item.reportCount > 0)) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Flagged</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
};

interface ContentTableProps {
  activeTab: string;
}

export default function ContentTable({ activeTab }: ContentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  const getAuthorName = (item: ContentItem) => {
    if (item.author?.name) return item.author.name;
    if (item.author?.profile?.firstName || item.author?.profile?.lastName) {
      return `${item.author.profile.firstName || ''} ${item.author.profile.lastName || ''}`.trim();
    }
    if (item.author?.email) return item.author.email;
    return 'Unknown User';
  };

  const getContentPreview = (item: ContentItem) => {
    if (item.isDeleted || item.status === 'removed') {
      return 'Removed content due to policy violation';
    }
    const text = item.content || item.title || item.preview || item.fullContent || '';
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch (activeTab) {
        case 'posts':
          response = await contentApi.getPosts({
            search: searchTerm || undefined,
            page,
            limit: 50
          });
          break;
        case 'comments':
          response = await contentApi.getComments({
            search: searchTerm || undefined,
            page,
            limit: 50
          });
          break;
        case 'reported':
          response = await contentApi.getFlaggedContent({
            page,
            limit: 50
          });
          break;
        default:
          // Get both posts and comments
          const [postsResponse, commentsResponse] = await Promise.all([
            contentApi.getPosts({ search: searchTerm || undefined, page, limit: 25 }),
            contentApi.getComments({ search: searchTerm || undefined, page, limit: 25 })
          ]);

          const allContent = [
            ...(postsResponse.data?.posts || []).map((post: any) => ({
              ...post,
              type: 'post' as const,
              datePosted: new Date(post.createdAt),
              authorId: post.authorId,
              preview: getContentPreview({ ...post, type: 'post' }),
              fullContent: post.content,
            })),
            ...(commentsResponse.data?.comments || []).map((comment: any) => ({
              ...comment,
              type: 'comment' as const,
              datePosted: new Date(comment.createdAt),
              authorId: comment.authorId,
              preview: getContentPreview({ ...comment, type: 'comment' }),
              fullContent: comment.content,
              parentPost: comment.post?.title || comment.post?.id,
            }))
          ];

          setContent(allContent);
          setPagination({
            page,
            limit: 50,
            total: allContent.length,
            pages: Math.ceil(allContent.length / 50)
          });
          return;
      }

      if (response && response.success && response.data) {
        const items = activeTab === 'posts' ? response.data.posts :
                     activeTab === 'comments' ? response.data.comments :
                     response.data.content || [];

        const transformedContent = items.map((item: any) => ({
          ...item,
          type: activeTab === 'posts' ? 'post' :
                activeTab === 'comments' ? 'comment' :
                item.type || 'post',
          datePosted: new Date(item.createdAt),
          authorId: item.authorId,
          preview: getContentPreview(item),
          fullContent: item.content,
          parentPost: item.post?.title || item.post?.id,
        }));

        setContent(transformedContent);
        setPagination(response.data.pagination || { page: 1, limit: 50, total: 0, pages: 0 });
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchContent();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeTab, page]);

  const filteredContent = content.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (item.preview || '').toLowerCase().includes(searchLower) ||
           (item.content || '').toLowerCase().includes(searchLower) ||
           (item.title || '').toLowerCase().includes(searchLower) ||
           getAuthorName(item).toLowerCase().includes(searchLower);
  });

  const handleModerationAction = (content: ContentItem) => {
    setSelectedContent(content);
    setShowModerationModal(true);
  };

  const handleModerationConfirm = async (action: string, reason?: string) => {
    if (selectedContent) {
      try {
        if (selectedContent.type === 'post') {
          if (action === 'remove') {
            await contentApi.deletePost(selectedContent.id, reason);
          } else {
            await contentApi.moderatePost(selectedContent.id, action, reason);
          }
        } else {
          if (action === 'remove') {
            await contentApi.deleteComment(selectedContent.id, reason);
          } else {
            await contentApi.moderateComment(selectedContent.id, action, reason);
          }
        }
        await fetchContent();
      } catch (err) {
        console.error('Error moderating content:', err);
        setError(err instanceof ApiError ? err.message : 'Failed to moderate content');
      }
    }
    setShowModerationModal(false);
    setSelectedContent(null);
  };

  return (
    <>
      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search content by text or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading content...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {/* Content List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredContent.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'post' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                      {getStatusBadge(item)}
                      {item.reportCount && item.reportCount > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {item.reportCount} report{item.reportCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      {item.title && (
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {item.title}
                        </h4>
                      )}
                      <p className="text-sm text-gray-900">
                        {getContentPreview(item)}
                      </p>
                      {item.parentPost && (
                        <p className="text-xs text-gray-500 mt-1">
                          Comment on: {item.parentPost}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>by {getAuthorName(item)}</span>
                      <span>•</span>
                      <span>
                        {item.datePosted
                          ? formatDistanceToNow(item.datePosted, { addSuffix: true })
                          : item.createdAt
                            ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                            : 'Unknown time'
                        }
                      </span>
                      <span>•</span>
                      <span>ID: {item.id}</span>
                    </div>

                    {item.reportReasons && item.reportReasons.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-600 font-medium">Report reasons:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.reportReasons.map((reason, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleModerationAction(item)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                      title="View Full Content"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>

                    {item.status !== 'removed' && !item.isDeleted && (
                      <>
                        <button
                          onClick={() => handleModerationAction(item)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                          title="Moderate Content"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleModerationAction(item)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          title="Remove Content"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleModerationAction(item)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                          title="Send Warning"
                        >
                          <FlagIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredContent.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm
                ? 'No content matches your search criteria.'
                : activeTab === 'reported'
                  ? 'No reported content found.'
                  : 'No content found.'
              }
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.total > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.pages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Moderation Modal */}
      {showModerationModal && selectedContent && (
        <ContentModerationModal
          content={selectedContent}
          onConfirm={handleModerationConfirm}
          onCancel={() => {
            setShowModerationModal(false);
            setSelectedContent(null);
          }}
        />
      )}
    </>
  );
}