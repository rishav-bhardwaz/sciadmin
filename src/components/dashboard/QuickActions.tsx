import Link from 'next/link';
import {
  PlusIcon,
  EyeIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

const quickActions = [
  {
    name: 'Create New Event',
    href: '/events/create',
    icon: PlusIcon,
    description: 'Set up a new event with speakers and registration',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'View Recent Reports',
    href: '/content/reports',
    icon: EyeIcon,
    description: 'Review flagged content and user reports',
    color: 'bg-red-500 hover:bg-red-600',
  },
  {
    name: 'Add New Admin',
    href: '/settings/admins',
    icon: UserPlusIcon,
    description: 'Grant admin access to trusted users',
    color: 'bg-green-500 hover:bg-green-600',
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-black mb-3">Quick Actions</h3>
      
      <div className="space-y-2">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-black flex items-center justify-center text-white">
              <action.icon className="h-4 w-4" />
            </div>
            
            <div className="ml-3 flex-1">
              <h4 className="text-xs font-medium text-black">
                {action.name}
              </h4>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
            
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
