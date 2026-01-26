'use client';

import { useState, useEffect } from 'react';
import { FlipConfig } from '@/types/aura';

export default function FlipConfigPanel() {
  const [config, setConfig] = useState<FlipConfig | null>(null);
  const [maxFlips, setMaxFlips] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    fetchConfig();
    return () => {
      setIsMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchConfig() {
    if (!isMounted) return;
    
    try {
      const response = await fetch('/api/flip-config');
      if (!response.ok) {
        console.error('Error fetching flip config: HTTP', response.status);
        if (isMounted) {
          setError('Failed to load flip configuration.');
        }
        return;
      }
      const data = await response.json();
      if (data.error || data.max_flips_per_day === undefined) {
        console.error('Error in flip config response:', data.error);
        if (isMounted) {
          setError(data.error || 'Invalid configuration data.');
        }
        return;
      }
      
      // Validate max_flips_per_day
      const maxFlipsValue = typeof data.max_flips_per_day === 'number' 
        ? Math.max(0, Math.min(10, Math.round(data.max_flips_per_day)))
        : 2;
      
      if (isMounted) {
        setConfig(data);
        setMaxFlips(maxFlipsValue);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching flip config:', err);
      if (isMounted) {
        setError('Failed to load flip configuration. Please try again.');
      }
    }
  }

  async function handleSave() {
    if (!isMounted) return;
    
    // Validate maxFlips before saving
    const validMaxFlips = typeof maxFlips === 'number' 
      ? Math.max(0, Math.min(10, Math.round(maxFlips)))
      : 2;
    
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/flip-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxFlipsPerDay: validMaxFlips }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (isMounted) {
          setError(data.error || 'Failed to save configuration.');
        }
        return;
      }

      if (!isMounted) return;

      setShowSuccess(true);
      const successTimer = setTimeout(() => {
        if (isMounted) {
          setShowSuccess(false);
        }
      }, 3000);
      
      await fetchConfig();
      
      return () => clearTimeout(successTimer);
    } catch (err) {
      console.error('Error updating flip config:', err);
      if (isMounted) {
        setError('Failed to save configuration. Please try again.');
      }
    } finally {
      if (isMounted) {
        setIsSaving(false);
      }
    }
  }

  if (!config) return null;

  return (
    <section className="px-4 sm:px-6 py-3 sm:py-4" aria-label="Son's control panel for flip settings">
      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-xl shadow-xl overflow-hidden relative hover-glow transition-all duration-300">
        {/* Animated background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-2 right-4 text-3xl animate-float" style={{ animationDelay: '0s' }}>⚙️</div>
          <div className="absolute bottom-2 left-4 text-2xl animate-sparkle" style={{ animationDelay: '1s' }}>✨</div>
        </div>
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 sm:p-6 text-left hover:bg-white/10 transition-all duration-300 focus:ring-2 focus:ring-white focus:ring-inset relative z-10"
          aria-expanded={isExpanded}
          aria-controls="flip-config-content"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg mb-1 flex items-center gap-2">
                <span className="animate-wiggle inline-block" aria-hidden="true">⚙️</span>
                <span>Son&apos;s Control Panel</span>
              </h3>
              <p className="text-white/95 text-sm drop-shadow-sm flex items-center gap-1">
                <span>Control how many flips dad gets per day</span>
                <span className="animate-bounce-gentle inline-block" role="img" aria-hidden="true">👑</span>
              </p>
            </div>
            <span className={`text-white text-xl sm:text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} aria-hidden="true">
              ▶
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
                {error && (
                  <div className="mb-4 p-3 bg-red-600/30 border border-red-300 rounded-lg text-white text-sm font-medium" role="alert">
                    {error}
                  </div>
                )}
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
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 0 && value <= 10) {
                        setMaxFlips(value);
                      }
                    }}
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
