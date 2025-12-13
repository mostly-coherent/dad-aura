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
    <section 
      className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6"
      aria-label="Dad's current aura score"
    >
      {/* Main Aura Score */}
      <div
        className={`
          ${bgColor}
          ${glowColor}
          rounded-full 
          w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64
          flex flex-col items-center justify-center
          transition-all duration-500 ease-in-out
          animate-pulse-slow
        `}
        role="img"
        aria-label={`Aura score: ${total} points. Status: ${status}`}
      >
        <h2 
          className="text-white text-5xl sm:text-6xl md:text-7xl font-bold mb-1 sm:mb-2 drop-shadow-md" 
          aria-hidden="true"
        >
          {total}
        </h2>
        <span 
          className="text-white text-base sm:text-lg md:text-xl font-semibold drop-shadow-sm" 
          aria-hidden="true"
        >
          Aura Points
        </span>
      </div>
      
      {/* Status Label */}
      <p 
        className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white" 
        aria-live="polite"
      >
        {status}
      </p>
      
      {/* Today's Change */}
      <div className="mt-3 sm:mt-4 flex items-center gap-2">
        <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Today:</span>
        <span
          className={`
            text-xl sm:text-2xl font-bold
            ${todayTotal > 0 ? 'text-green-700 dark:text-green-400' : todayTotal < 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}
          `}
          aria-label={`Today's change: ${todayTotal > 0 ? 'plus' : todayTotal < 0 ? 'minus' : ''} ${Math.abs(todayTotal)} points`}
        >
          {todayTotal > 0 ? '+' : ''}{todayTotal}
        </span>
      </div>
    </section>
  );
}
