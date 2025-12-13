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
      className="flex flex-col items-center justify-center py-12 px-6"
      aria-label="Dad's current aura score"
    >
      {/* Main Aura Score */}
      <div
        className={`
          ${bgColor}
          ${glowColor}
          rounded-full w-64 h-64 flex flex-col items-center justify-center
          transition-all duration-500 ease-in-out
          animate-pulse-slow
        `}
        role="img"
        aria-label={`Aura score: ${total} points. Status: ${status}`}
      >
        <h2 className="text-white text-7xl font-bold mb-2" aria-hidden="true">
          {total}
        </h2>
        <span className="text-white text-xl font-semibold opacity-90" aria-hidden="true">
          Aura Points
        </span>
      </div>
      
      {/* Status Label */}
      <p className="mt-6 text-3xl font-bold text-center" aria-live="polite">
        {status}
      </p>
      
      {/* Today's Change */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400">Today:</span>
        <span
          className={`
            text-2xl font-bold
            ${todayTotal > 0 ? 'text-green-600' : todayTotal < 0 ? 'text-red-600' : 'text-gray-600'}
          `}
          aria-label={`Today's change: ${todayTotal > 0 ? 'plus' : todayTotal < 0 ? 'minus' : ''} ${Math.abs(todayTotal)} points`}
        >
          {todayTotal > 0 ? '+' : ''}{todayTotal}
        </span>
      </div>
    </section>
  );
}

