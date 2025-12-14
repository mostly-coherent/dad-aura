'use client';

import { useState, useEffect } from 'react';
import { FlipConfig } from '@/types/aura';

export default function FlipConfigPanel() {
  const [config, setConfig] = useState<FlipConfig | null>(null);
  const [maxFlips, setMaxFlips] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchConfig() {
    try {
      const response = await fetch('/api/flip-config');
      if (!response.ok) {
        console.error('Error fetching flip config: HTTP', response.status);
        return;
      }
      const data = await response.json();
      if (data.error || data.max_flips_per_day === undefined) {
        console.error('Error in flip config response:', data.error);
        return;
      }
      setConfig(data);
      setMaxFlips(data.max_flips_per_day);
    } catch (err) {
      console.error('Error fetching flip config:', err);
    }
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      const response = await fetch('/api/flip-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxFlipsPerDay: maxFlips }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        await fetchConfig();
      }
    } catch (err) {
      console.error('Error updating flip config:', err);
    } finally {
      setIsSaving(false);
    }
  }

  if (!config) return null;

  return (
    <section className="px-4 sm:px-6 py-3 sm:py-4" aria-label="Son's control panel for flip settings">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 sm:p-6 text-left hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white focus:ring-inset"
          aria-expanded={isExpanded}
          aria-controls="flip-config-content"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-sm mb-1">
                <span aria-hidden="true">⚙️ </span>Son&apos;s Control Panel
              </h3>
              <p className="text-white/95 text-sm drop-shadow-sm">
                Control how many flips dad gets per day
              </p>
            </div>
            <span className="text-white text-xl sm:text-2xl" aria-hidden="true">
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
        </button>

        {/* Expandable content */}
        {isExpanded && (
          <div id="flip-config-content" className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-white/20">
            <div className="mt-4">
              {showSuccess && (
                <div className="mb-4 p-3 bg-green-600/30 border border-green-300 rounded-lg text-white text-sm font-medium animate-pulse" role="status">
                  ✅ Flip limit updated successfully!
                </div>
              )}

              <div className="bg-white/15 rounded-lg p-4 mb-4">
                <label htmlFor="flip-slider" className="block text-white font-semibold mb-2 drop-shadow-sm">
                  Max Flips Per Day for Dad
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <input
                    id="flip-slider"
                    type="range"
                    min="0"
                    max="10"
                    value={maxFlips}
                    onChange={(e) => setMaxFlips(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={maxFlips}
                  />
                  <output 
                    htmlFor="flip-slider"
                    className="text-2xl sm:text-3xl font-bold text-white w-12 sm:w-16 text-center drop-shadow-sm"
                  >
                    {maxFlips}
                  </output>
                </div>
                <p className="mt-2 text-white/95 text-sm drop-shadow-sm" aria-live="polite">
                  {maxFlips === 0 && '😈 Dad has NO flip power!'}
                  {maxFlips === 1 && '😏 Dad gets 1 flip per day'}
                  {maxFlips === 2 && '😊 Dad gets 2 flips per day (default)'}
                  {maxFlips >= 3 && maxFlips <= 5 && '😇 Dad gets some extra flips'}
                  {maxFlips > 5 && '🤯 Dad has UNLIMITED power!'}
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || maxFlips === config.max_flips_per_day}
                className={`
                  w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-bold
                  transition-all duration-300
                  focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500
                  ${maxFlips !== config.max_flips_per_day && !isSaving
                    ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-lg'
                    : 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-60'
                  }
                `}
                aria-disabled={isSaving || maxFlips === config.max_flips_per_day}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>

              <p className="mt-4 text-center text-white/95 text-xs drop-shadow-sm">
                <span aria-hidden="true">💡 </span>Tip: Set to 0 to disable dad&apos;s flip power completely!
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
