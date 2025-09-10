'use client';

import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion} from 'framer-motion';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <motion.header 
      className="bg-white border-b border-gray-200"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
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
                type: "spring", 
                stiffness: 500, 
                damping: 15,
                delay: 0.5
              }}
            />
          </motion.button>

          {/* User Menu */}
          <motion.div 
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.div 
              className="h-7 w-7 bg-black text-white flex items-center justify-center text-xs font-bold rounded-md"
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              A
            </motion.div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-black">Admin</div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}