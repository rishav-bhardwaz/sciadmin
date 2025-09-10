import AdminLayout from '@/components/layout/AdminLayout';
import ContentModerationTabs from '@/components/content/ContentModerationTabs';

export default function ContentPage() {
  return (
    <AdminLayout title="Content Moderation">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
          <p className="text-gray-600 mt-1">
            Review and moderate all user-generated content across the platform
          </p>
        </div>

        {/* Content Moderation Interface */}
        <ContentModerationTabs />
      </div>
    </AdminLayout>
  );
}
