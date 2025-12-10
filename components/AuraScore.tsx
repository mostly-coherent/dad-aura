'use client';

import { getAuraBackgroundColor, getAuraGlowColor } from '@/lib/emoji-parser';
import { getAuraStatus } from '@/lib/aura-calculator';

interface AuraScoreProps {
  total: number;
  todayTotal: number;
}

export default function AuraScore({ total, todayTotal }: AuraScoreProps) {
  const bgColor = getAuraBackgroundColor(total);
  const glowColor = getAuraGlowColor(total);
  const status = getAuraStatus(total);
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Main Aura Score */}
      <div
        className={`
          ${bgColor}
          ${glowColor}
          rounded-full w-64 h-64 flex flex-col items-center justify-center
          transition-all duration-500 ease-in-out
          animate-pulse-slow
        `}
      >
        <div className="text-white text-7xl font-bold mb-2">
          {total}
        </div>
        <div className="text-white text-xl font-semibold opacity-90">
          Aura Points
        </div>
      </div>
      
      {/* Status Label */}
      <div className="mt-6 text-3xl font-bold text-center">
        {status}
      </div>
      
      {/* Today's Change */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400">Today:</span>
        <span
          className={`
            text-2xl font-bold
            ${todayTotal > 0 ? 'text-green-600' : todayTotal < 0 ? 'text-red-600' : 'text-gray-600'}
          `}
        >
          {todayTotal > 0 ? '+' : ''}{todayTotal}
        </span>
      </div>
    </div>
  );
}

