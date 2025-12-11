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
  }, []);

  async function fetchConfig() {
    try {
      const response = await fetch('/api/flip-config');
      if (!response.ok) {
        console.error('Error fetching flip config: HTTP', response.status);
        return;
      }
      const data = await response.json();
      if (data.error || !data.max_flips_per_day === undefined) {
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
    <div className="px-6 py-4">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 text-left hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                ⚙️ Son&apos;s Control Panel
              </h3>
              <p className="text-blue-100 text-sm">
                Control how many flips dad gets per day
              </p>
            </div>
            <div className="text-white text-2xl">
              {isExpanded ? '▼' : '▶'}
            </div>
          </div>
        </button>

        {/* Expandable content */}
        {isExpanded && (
          <div className="px-6 pb-6 border-t border-white/20">
            <div className="mt-4">
              {showSuccess && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-300 rounded-lg text-white text-sm animate-pulse">
                  ✅ Flip limit updated successfully!
                </div>
              )}

              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <label className="block text-white font-semibold mb-2">
                  Max Flips Per Day for Dad
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={maxFlips}
                    onChange={(e) => setMaxFlips(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-3xl font-bold text-white w-16 text-center">
                    {maxFlips}
                  </div>
                </div>
                <div className="mt-2 text-blue-100 text-sm">
                  {maxFlips === 0 && '😈 Dad has NO flip power!'}
                  {maxFlips === 1 && '😏 Dad gets 1 flip per day'}
                  {maxFlips === 2 && '😊 Dad gets 2 flips per day (default)'}
                  {maxFlips >= 3 && maxFlips <= 5 && '😇 Dad gets some extra flips'}
                  {maxFlips > 5 && '🤯 Dad has UNLIMITED power!'}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || maxFlips === config.max_flips_per_day}
                className={`
                  w-full py-3 px-6 rounded-lg font-bold
                  transition-all duration-300
                  ${maxFlips !== config.max_flips_per_day && !isSaving
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>

              <div className="mt-4 text-center text-blue-100 text-xs">
                💡 Tip: Set to 0 to disable dad&apos;s flip power completely!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

