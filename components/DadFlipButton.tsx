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
  }, []);

  async function fetchFlipStatus() {
    try {
      const response = await fetch('/api/flip');
      const data = await response.json();
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
    <div className="px-6 py-4">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              🔄 Dad Flip Power
            </h3>
            <p className="text-purple-100 text-sm">
              Flip your aura from {currentTotal} to {flippedTotal}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {flipStatus.flipsRemainingToday}
            </div>
            <div className="text-purple-100 text-xs">
              flips left today
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-300 rounded-lg text-white text-sm">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-300 rounded-lg text-white text-sm animate-pulse">
            ✨ Flip successful! Your aura has been reversed!
          </div>
        )}

        <button
          onClick={handleFlip}
          disabled={!flipStatus.canFlip || isFlipping}
          className={`
            w-full py-3 px-6 rounded-lg font-bold text-lg
            transition-all duration-300 transform
            ${flipStatus.canFlip && !isFlipping
              ? 'bg-white text-purple-600 hover:bg-purple-50 hover:scale-105 active:scale-95 shadow-lg'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
            }
          `}
        >
          {isFlipping ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">🔄</span>
              Flipping...
            </span>
          ) : flipStatus.canFlip ? (
            `🔄 Flip Now (${currentTotal} → ${flippedTotal})`
          ) : (
            `No Flips Remaining (${flipStatus.flipsUsedToday}/${flipStatus.maxFlipsPerDay} used)`
          )}
        </button>

        <div className="mt-3 text-center text-purple-100 text-xs">
          Your son controls how many flips you get per day
        </div>
      </div>
    </div>
  );
}

