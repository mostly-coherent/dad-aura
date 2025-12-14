'use client';

import { useState, useEffect } from 'react';
import { FlipStatus } from '@/types/aura';

interface DadFlipButtonProps {
  currentTotal: number;
  onFlipSuccess: () => void;
}

export default function DadFlipButton({ currentTotal, onFlipSuccess }: DadFlipButtonProps) {
  const [flipStatus, setFlipStatus] = useState<FlipStatus | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchFlipStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchFlipStatus() {
    try {
      const response = await fetch('/api/flip');
      if (!response.ok) {
        console.error('Error fetching flip status: HTTP', response.status);
        return;
      }
      const data = await response.json();
      if (data.error) {
        console.error('Error in flip status response:', data.error);
        return;
      }
      setFlipStatus(data);
    } catch (err) {
      console.error('Error fetching flip status:', err);
    }
  }

  async function handleFlip() {
    if (!flipStatus?.canFlip) return;

    setIsFlipping(true);
    setError(null);

    try {
      const response = await fetch('/api/flip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTotal }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to flip');
        return;
      }

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Refresh flip status
      await fetchFlipStatus();

      // Notify parent to refresh data
      onFlipSuccess();
    } catch (err) {
      console.error('Error flipping:', err);
      setError('Failed to flip. Please try again.');
    } finally {
      setIsFlipping(false);
    }
  }

  if (!flipStatus) {
    return null;
  }

  const flippedTotal = currentTotal * -1;

  return (
    <section className="px-4 sm:px-6 py-3 sm:py-4" aria-label="Dad flip power">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-sm mb-1">
              <span aria-hidden="true">🔄 </span>Dad Flip Power
            </h3>
            <p className="text-white/95 text-sm drop-shadow-sm">
              Flip your aura from {currentTotal} to {flippedTotal}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
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
            transition-all duration-300 transform
            focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-500
            ${flipStatus.canFlip && !isFlipping
              ? 'bg-white text-purple-700 hover:bg-purple-50 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
              : 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-60'
            }
          `}
          aria-disabled={!flipStatus.canFlip || isFlipping}
        >
          {isFlipping ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin" aria-hidden="true">🔄</span>
              Flipping...
            </span>
          ) : flipStatus.canFlip ? (
            `🔄 Flip Now (${currentTotal} → ${flippedTotal})`
          ) : (
            `No Flips Remaining (${flipStatus.flipsUsedToday}/${flipStatus.maxFlipsPerDay} used)`
          )}
        </button>

        <p className="mt-3 text-center text-white/95 text-xs drop-shadow-sm">
          Your son controls how many flips you get per day
        </p>
      </div>
    </section>
  );
}
