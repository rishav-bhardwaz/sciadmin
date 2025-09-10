import { formatDistanceToNow } from 'date-fns';
import {
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'user_action' | 'event_action' | 'content_action' | 'admin_action';
  message: string;
  user: string;
  timestamp: Date;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'admin_action',
    message: 'User @JohnDoe was blacklisted',
    user: 'Admin_Sarah',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
  {
    id: '2',
    type: 'event_action',
    message: "Event 'Quantum Mechanics Workshop' was published",
    user: 'Admin_Mike',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    id: '3',
    type: 'content_action',
    message: 'Reported content was removed from feed',
    user: 'Admin_Sarah',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '4',
    type: 'user_action',
    message: 'New user registration: @AliceSmith',
    user: 'System',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: '5',
    type: 'event_action',
    message: "Event 'AI Ethics Seminar' reached max capacity",
    user: 'System',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'user_action':
      return <UserIcon className="h-5 w-5" />;
    case 'event_action':
      return <CalendarIcon className="h-5 w-5" />;
    case 'content_action':
      return <ExclamationTriangleIcon className="h-5 w-5" />;
    case 'admin_action':
      return <ShieldCheckIcon className="h-5 w-5" />;
    default:
      return <UserIcon className="h-5 w-5" />;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'user_action':
      return 'text-black bg-gray-100';
    case 'event_action':
      return 'text-black bg-gray-100';
    case 'content_action':
      return 'text-black bg-gray-100';
    case 'admin_action':
      return 'text-white bg-black';
    default:
      return 'text-black bg-gray-100';
  }
};

export default function ActivityFeed() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-black">Recent Activity</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {mockActivities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="px-4 py-3">
            <div className="flex items-start space-x-2">
              <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs text-black">{activity.message}</p>
                <div className="flex items-center mt-1 space-x-1">
                  <span className="text-xs text-gray-500">{activity.user}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <button className="text-xs text-black hover:underline">
          View all →
        </button>
      </div>
    </div>
  );
}
