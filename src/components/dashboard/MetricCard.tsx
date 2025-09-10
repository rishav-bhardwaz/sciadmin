import { ReactNode } from 'react';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: ReactNode;
  trend?: number[];
}

export default function MetricCard({ title, value, change, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-black mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-1">
              <span
                className={clsx(
                  'text-xs',
                  change.type === 'increase' && 'text-black',
                  change.type === 'decrease' && 'text-gray-600',
                  change.type === 'neutral' && 'text-gray-600'
                )}
              >
                {change.type === 'increase' && '+'}
                {change.value}
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-black flex items-center justify-center rounded-md">
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
