'use client';

import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear()
    setMenuOpen(false)
    window.location.href = "/login";
  }

  return (
    <motion.header
      className="bg-white border-b border-gray-200"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between px-6 py-3">
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-xl font-medium text-black">{title}</h1>
        </motion.div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <motion.div
            className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm outline-none w-40 transition-all duration-300 focus:w-52"
            />
          </motion.div>

          {/* Notifications */}
          <motion.button
            className="relative p-1.5 rounded-lg hover:bg-gray-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BellIcon className="h-5 w-5 text-gray-600" />
            <motion.span
              className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 15,
                delay: 0.5,
              }}
            />
          </motion.button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <motion.div
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <motion.div
                className="h-7 w-7 bg-black text-white flex items-center justify-center text-xs font-bold rounded-md"
                whileHover={{ rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                A
              </motion.div>
              <div className="text-sm font-medium text-black w-[100px] flex items-center justify-center gap-1 px-2 py-1 rounded cursor-pointer">
                <span>Admin</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-4 h-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''
                    }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>

            </motion.div>

            {/* Dropdown Menu */}
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-3 bg-white border border-gray-100 shadow-xl rounded-xl w-40 py-2 z-50"
              >
                <div className="absolute -top-2 right-6 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45"></div>

                <button
                  onClick={() => handleLogout()}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15M18 9l3 3m0 0l-3 3m3-3H9"
                    />
                  </svg>
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
