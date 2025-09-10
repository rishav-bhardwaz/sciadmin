'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  DocumentTextIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  {
    name: 'Events',
    href: '/events',
    icon: CalendarIcon,
    children: [
      { name: 'All Events', href: '/events' },
      { name: 'Create New', href: '/events/create' },
    ],
  },
  {
    name: 'Users',
    href: '/users',
    icon: UsersIcon,
    children: [
      { name: 'User List', href: '/users' },
      { name: 'Blacklist Log', href: '/users/blacklist' },
    ],
  },
  {
    name: 'Content',
    href: '/content',
    icon: DocumentTextIcon,
    children: [
      { name: 'All Content', href: '/content' },
      { name: 'Reported Items', href: '/content/reports' },
    ],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: CogIcon,
    children: [
      { name: 'Website Settings', href: '/settings' },
      { name: 'Admin Users', href: '/settings/admins' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  return (
    <div
      className={clsx(
        'bg-black text-white transition-all duration-300 ease-in-out flex flex-col border-r border-gray-200',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        {!collapsed && (
          <h1 className="text-lg font-bold text-white">Sciastra</h1>
        )}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isExpanded = expandedItems.includes(item.name);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.name}>
              <div
                className={clsx(
                  'group flex items-center px-2 py-2 text-sm font-medium cursor-pointer transition-colors',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
                onClick={() => {
                  if (hasChildren && !collapsed) {
                    toggleExpanded(item.name);
                  }
                }}
              >
                <Link
                  href={item.href}
                  className="flex items-center flex-1"
                  onClick={(e) => {
                    if (hasChildren && !collapsed) {
                      e.preventDefault();
                    }
                  }}
                >
                  <item.icon
                    className={clsx(
                      'flex-shrink-0 h-5 w-5',
                      collapsed ? 'mx-auto' : 'mr-3'
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {hasChildren && (
                        <ChevronRightIcon
                          className={clsx(
                            'h-4 w-4 transition-transform',
                            isExpanded ? 'rotate-90' : ''
                          )}
                        />
                      )}
                    </>
                  )}
                </Link>
              </div>

              {/* Submenu */}
              {hasChildren && !collapsed && isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={clsx(
                        'group flex items-center px-2 py-1 text-sm transition-colors',
                        pathname === child.href
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="border-t border-gray-800 p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-7 w-7 bg-white text-black flex items-center justify-center text-xs font-bold">
                A
              </div>
            </div>
            <div className="ml-2">
              <p className="text-sm text-white">Admin</p>
              <p className="text-xs text-gray-400">admin@sciastra.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
