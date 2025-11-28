'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarIcon,
  // UsersIcon,
  DocumentTextIcon,
  // CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { motion, AnimatePresence, easeInOut } from 'framer-motion';

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
  // {
  //   name: 'Users',
  //   href: '/users',
  //   icon: UsersIcon,
  //   children: [
  //     { name: 'User List', href: '/users' },
  //     { name: 'Blacklist Log', href: '/users/blacklist' },
  //   ],
  // },
  {
    name: 'Content',
    href: '/content',
    icon: DocumentTextIcon,
    children: [
      { name: 'All Content', href: '/content' },
      { name: 'Reported Items', href: '/content/reports' },
    ],
  },
  // {
  //   name: 'Settings',
  //   href: '/settings',
  //   icon: CogIcon,
  //   children: [
  //     { name: 'Website Settings', href: '/settings' },
  //     { name: 'Admin Users', href: '/settings/admins' },
  //   ],
  // },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const sidebarVariants = {
    collapsed: { width: 64 },
    expanded: { width: 224 }
  };

  const itemVariants = {
    collapsed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
    expanded: { opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.1 } }
  };

  const subMenuVariants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: easeInOut
      }
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: easeInOut
      }
    }
  };

  return (
    <motion.div
      className="bg-black text-white flex flex-col border-r border-gray-800 h-full"
      initial={collapsed ? "collapsed" : "expanded"}
      animate={collapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <AnimatePresence>
          {!collapsed && (
            <motion.h1 
              className="text-lg font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Sciastra
            </motion.h1>
          )}
        </AnimatePresence>
        <motion.button
          onClick={onToggle}
          className="p-1 hover:bg-gray-800 transition-colors rounded-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isExpanded = expandedItems.includes(item.name);
          const hasChildren = item.children && item.children.length > 0;
          const isHovered = hoveredItem === item.name;

          return (
            <div key={item.name}>
              <motion.div
                className={clsx(
                  'group flex items-center px-2 py-2 text-sm font-medium cursor-pointer transition-colors rounded-md',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
                onClick={() => {
                  if (hasChildren && !collapsed) {
                    toggleExpanded(item.name);
                  }
                }}
                onHoverStart={() => setHoveredItem(item.name)}
                onHoverEnd={() => setHoveredItem(null)}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                  <motion.div
                    animate={{
                      scale: isHovered ? 1.1 : 1,
                      rotate: isHovered ? -2 : 0
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <item.icon
                      className={clsx(
                        'flex-shrink-0 h-5 w-5',
                        collapsed ? 'mx-auto' : 'mr-3'
                      )}
                    />
                  </motion.div>
                  {!collapsed && (
                    <>
                      <motion.span 
                        className="flex-1"
                        variants={itemVariants}
                        initial="collapsed"
                        animate="expanded"
                      >
                        {item.name}
                      </motion.span>
                      {hasChildren && (
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </motion.div>
                      )}
                    </>
                  )}
                </Link>
              </motion.div>

              {/* Submenu */}
              <AnimatePresence>
                {hasChildren && !collapsed && isExpanded && (
                  <motion.div
                    className="ml-4 mt-1 space-y-1 overflow-hidden"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={subMenuVariants}
                  >
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <motion.div
                          key={child.name}
                          whileHover={{ x: 8 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Link
                            href={child.href}
                            className={clsx(
                              'group flex items-center px-3 py-1.5 text-sm transition-colors rounded-md',
                              isChildActive
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            )}
                          >
                            <motion.div
                              className="w-1 h-1 bg-gray-500 rounded-full mr-2"
                              animate={{ 
                                scale: isChildActive ? 1.5 : 1,
                                backgroundColor: isChildActive ? '#fff' : '#6b7280'
                              }}
                            />
                            {child.name}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div 
            className="border-t border-gray-800 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <motion.div 
                className="flex-shrink-0"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="h-7 w-7 bg-white text-black flex items-center justify-center text-xs font-bold rounded-md">
                  A
                </div>
              </motion.div>
              <motion.div 
                className="ml-2"
                variants={itemVariants}
                initial="collapsed"
                animate="expanded"
              >
                <p className="text-sm text-white">Admin</p>
                <p className="text-xs text-gray-400">admin@sciastra.com</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}