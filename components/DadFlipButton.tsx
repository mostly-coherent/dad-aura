'use client';

import { useState, useEffect } from 'react';
import { FlipStatus } from '@/types/aura';

interface DadFlipButtonProps {
  currentTotal: number;
  onFlipSuccess: () => void;
}

export default function DadFlipButton({ currentTotal, onFlipSuccess }: DadFlipButtonProps) {
  // Validate props
  const safeCurrentTotal = typeof currentTotal === 'number' && !isNaN(currentTotal) ? currentTotal : 0;
  
  const [flipStatus, setFlipStatus] = useState<FlipStatus | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    fetchFlipStatus();
    return () => {
      setIsMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchFlipStatus() {
    if (!isMounted) return;
    
    try {
      const response = await fetch('/api/flip');
      if (!response.ok) {
        console.error('Error fetching flip status: HTTP', response.status);
        if (isMounted) {
          setError('Failed to load flip status. Please refresh.');
        }
        return;
      }
      const data = await response.json();
      if (data.error) {
        console.error('Error in flip status response:', data.error);
        if (isMounted) {
          setError(data.error || 'Failed to load flip status.');
        }
        return;
      }
      if (isMounted) {
        setFlipStatus(data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching flip status:', err);
      if (isMounted) {
        setError('Failed to load flip status. Please try again.');
      }
    }
  }

  async function handleFlip() {
    if (!flipStatus?.canFlip || !isMounted) return;

    setIsFlipping(true);
    setError(null);

    try {
      const response = await fetch('/api/flip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTotal: safeCurrentTotal }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (isMounted) {
          setError(data.error || 'Failed to flip');
        }
        return;
      }

      if (!isMounted) return;

      // Show success animation
      setShowSuccess(true);
      const successTimer = setTimeout(() => {
        if (isMounted) {
          setShowSuccess(false);
        }
      }, 3000);

      // Refresh flip status
      await fetchFlipStatus();

      // Notify parent to refresh data
      if (typeof onFlipSuccess === 'function') {
        onFlipSuccess();
      }
      
      return () => clearTimeout(successTimer);
    } catch (err) {
      console.error('Error flipping:', err);
      if (isMounted) {
        setError('Failed to flip. Please try again.');
      }
    } finally {
      if (isMounted) {
        setIsFlipping(false);
      }
    }
  }

  if (!flipStatus) {
    return null;
  }

  const flippedTotal = safeCurrentTotal * -1;
  
  // Validate flipped total is finite
  if (!isFinite(flippedTotal)) {
    return null;
  }

  return (
    <section className="px-4 sm:px-6 py-3 sm:py-4" aria-label="Dad flip power">
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-xl shadow-2xl p-4 sm:p-6 relative overflow-hidden hover-glow">
        {/* Animated background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-2 left-4 text-3xl animate-float" style={{ animationDelay: '0s' }}>🔄</div>
          <div className="absolute bottom-2 right-4 text-2xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
          <div className="absolute top-1/2 left-1/4 text-2xl animate-sparkle" style={{ animationDelay: '0.5s' }}>⭐</div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 relative z-10">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg mb-1 flex items-center gap-2">
              <span className="animate-wiggle inline-block" aria-hidden="true">🔄</span>
              <span>Dad Flip Power</span>
            </h3>
            <p className="text-white/95 text-sm drop-shadow-sm flex items-center gap-1">
              <span>Flip your aura from</span>
              <span className="font-bold text-white">{safeCurrentTotal}</span>
              <span className="animate-bounce-gentle inline-block">→</span>
              <span className="font-bold text-white">{flippedTotal}</span>
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg animate-bounce-gentle">
              {flipStatus.flipsRemainingToday}
            </div>
            <div className="text-white/95 text-xs drop-shadow-sm">
              flips left today
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600/30 border border-red-300 rounded-lg text-white text-sm font-medium" role="alert">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="mb-4 p-3 bg-green-600/30 border border-green-300 rounded-lg text-white text-sm font-medium animate-pulse" role="status">
            ✨ Flip successful! Your aura has been reversed!
          </div>
        )}

        <button
          onClick={handleFlip}
          disabled={!flipStatus.canFlip || isFlipping}
          className={`
            w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg
            transition-all duration-300 transform relative overflow-hidden
            focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-500
            ${flipStatus.canFlip && !isFlipping
              ? 'bg-white text-purple-700 hover:bg-purple-50 hover:scale-[1.05] active:scale-[0.95] shadow-xl hover:shadow-2xl hover:shadow-purple-500/50'
              : 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-60'
            }
          `}
          aria-disabled={!flipStatus.canFlip || isFlipping}
        >
          {isFlipping ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin text-2xl" aria-hidden="true">🔄</span>
              <span>Flipping...</span>
            </span>
          ) : flipStatus.canFlip ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-wiggle inline-block" aria-hidden="true">🔄</span>
              <span>Flip Now</span>
              <span className="font-mono">({safeCurrentTotal} → {flippedTotal})</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span aria-hidden="true">😅</span>
              <span>No Flips Remaining ({flipStatus.flipsUsedToday}/{flipStatus.maxFlipsPerDay} used)</span>
            </span>
          )}
        </button>

        <p className="mt-3 text-center text-white/95 text-xs drop-shadow-sm">
          Your son controls how many flips you get per day
        </p>
      </div>
    </section>
  );
}
