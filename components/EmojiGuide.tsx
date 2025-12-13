'use client';

import { useState } from 'react';
import { EMOJI_PRESET_LIST } from '@/lib/emoji-parser';

export default function EmojiGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group emojis by tier
  const tiers = [
    { name: 'Legendary', range: '20-25', color: 'from-yellow-400 to-amber-500', emojis: EMOJI_PRESET_LIST.filter(e => e.points >= 20) },
    { name: 'Awesome', range: '10-15', color: 'from-purple-400 to-pink-500', emojis: EMOJI_PRESET_LIST.filter(e => e.points >= 10 && e.points < 20) },
    { name: 'Good', range: '5-9', color: 'from-green-400 to-emerald-500', emojis: EMOJI_PRESET_LIST.filter(e => e.points >= 5 && e.points < 10) },
    { name: 'Okay', range: '1-4', color: 'from-blue-400 to-cyan-500', emojis: EMOJI_PRESET_LIST.filter(e => e.points >= 1 && e.points < 5) },
    { name: 'Neutral', range: '0', color: 'from-gray-400 to-gray-500', emojis: EMOJI_PRESET_LIST.filter(e => e.points === 0) },
    { name: 'Mild -', range: '-2 to -5', color: 'from-orange-400 to-orange-500', emojis: EMOJI_PRESET_LIST.filter(e => e.points >= -5 && e.points < 0) },
    { name: 'Negative', range: '-6 to -10', color: 'from-red-400 to-red-500', emojis: EMOJI_PRESET_LIST.filter(e => e.points >= -10 && e.points < -5) },
    { name: 'Severe', range: '-12 to -15', color: 'from-red-600 to-rose-700', emojis: EMOJI_PRESET_LIST.filter(e => e.points < -10) },
  ];

  return (
    <section className="px-4 sm:px-6 py-3 sm:py-4" aria-label="Emoji guide for aura points">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-inset"
          aria-expanded={isExpanded}
          aria-controls="emoji-guide-content"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl" role="img" aria-hidden="true">📱</span>
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Emoji Guide
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Text these emojis to update Dad&apos;s aura
              </p>
            </div>
          </div>
          <span 
            className={`text-xl sm:text-2xl transition-transform duration-200 text-gray-600 dark:text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            ▼
          </span>
        </button>

        {/* Expandable content */}
        {isExpanded && (
          <div id="emoji-guide-content" className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
            {/* Quick tip */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-sm" role="note">
              <span className="font-semibold text-blue-800 dark:text-blue-300" aria-hidden="true">💡 </span>
              <span className="font-semibold text-blue-800 dark:text-blue-300">Tip:</span>
              <span className="text-blue-700 dark:text-blue-300 ml-1">
                Send just the emoji, or add custom points like &quot;😀 +7&quot;
              </span>
            </div>

            {/* Emoji tiers */}
            {tiers.map((tier) => (
              tier.emojis.length > 0 && (
                <div key={tier.name} className="space-y-2" role="group" aria-label={`${tier.name} tier: ${tier.range} points`}>
                  <div className="flex items-center gap-2">
                    <div className={`bg-gradient-to-r ${tier.color} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                      {tier.range}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {tier.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2" role="list">
                    {tier.emojis.map((preset) => (
                      <div
                        key={preset.emoji}
                        className="group relative flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-1.5 sm:px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-default"
                        role="listitem"
                        aria-label={`${preset.label}: ${preset.points > 0 ? 'plus' : preset.points < 0 ? 'minus' : ''} ${Math.abs(preset.points)} points`}
                      >
                        <span className="text-lg sm:text-xl" role="img" aria-hidden="true">{preset.emoji}</span>
                        <span 
                          className={`text-xs font-bold ${preset.points > 0 ? 'text-green-700 dark:text-green-400' : preset.points < 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}
                          aria-hidden="true"
                        >
                          {preset.points > 0 ? '+' : ''}{preset.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}

            {/* Phone number reminder */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Text to: <span className="font-mono font-bold text-purple-700 dark:text-purple-400">Your Vonage Number</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
