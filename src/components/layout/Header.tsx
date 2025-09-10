'use client';

import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        <div>
          <h1 className="text-xl font-medium text-black">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 bg-black text-white flex items-center justify-center text-xs font-bold">
              A
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-black">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
