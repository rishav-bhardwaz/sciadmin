import AdminLayout from '@/components/layout/AdminLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import {
  UsersIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-black text-white p-4 rounded-lg">
          <h2 className="text-xl font-medium">Welcome, Admin</h2>
          <p className="text-gray-300 mt-1 text-sm">
            Platform overview
          </p>
        </div>

        {/* Status Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Note:</span> Event and content management is working as of 29 November 2025
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value="2,847"
            change={{ value: "12%", type: "increase" }}
            icon={<UsersIcon className="h-6 w-6" />}
            trend={[20, 35, 25, 45, 30, 55, 40]}
          />
          <MetricCard
            title="Active Events"
            value="23"
            change={{ value: "3", type: "increase" }}
            icon={<CalendarIcon className="h-6 w-6" />}
            trend={[15, 25, 20, 30, 25, 35, 30]}
          />
          <MetricCard
            title="Recent Reports"
            value="7"
            change={{ value: "2", type: "decrease" }}
            icon={<ExclamationTriangleIcon className="h-6 w-6" />}
            trend={[10, 8, 12, 6, 9, 5, 7]}
          />
          <MetricCard
            title="Platform Engagement"
            value="89%"
            change={{ value: "5%", type: "increase" }}
            icon={<ChartBarIcon className="h-6 w-6" />}
            trend={[70, 75, 80, 85, 82, 87, 89]}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Activity Feed */}
          <div>
            <ActivityFeed />
          </div>
          
          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
