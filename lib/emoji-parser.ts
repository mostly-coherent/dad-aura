import { ParsedSMS, EmojiPreset } from '@/types/aura';

// Emoji presets with default point values
export const EMOJI_PRESETS: Record<string, number> = {
  // Positive
  '🔥': 10,
  '🎉': 15,
  '❤️': 5,
  '🌟': 8,
  '💪': 7,
  '👍': 3,
  '⚡': 25,
  '🎯': 20,
  // Negative
  '💩': -5,
  '😤': -8,
  '👎': -3,
  '😡': -10,
  '🙄': -4,
  '💔': -12,
  // Neutral
  '🤷': 0,
};

export const EMOJI_PRESET_LIST: EmojiPreset[] = [
  { emoji: '🔥', points: 10, label: 'Awesome dad moment' },
  { emoji: '🎉', points: 15, label: 'Epic dad win' },
  { emoji: '❤️', points: 5, label: 'Love you dad' },
  { emoji: '🌟', points: 8, label: "You're shining" },
  { emoji: '💪', points: 7, label: 'Strong dad energy' },
  { emoji: '👍', points: 3, label: 'Good job' },
  { emoji: '⚡', points: 25, label: 'Legendary move' },
  { emoji: '🎯', points: 20, label: 'Bullseye, perfect' },
  { emoji: '💩', points: -5, label: 'Mild disappointment' },
  { emoji: '😤', points: -8, label: 'Annoyed' },
  { emoji: '👎', points: -3, label: 'Not cool' },
  { emoji: '😡', points: -10, label: 'Dad fail' },
  { emoji: '🙄', points: -4, label: 'Seriously?' },
  { emoji: '💔', points: -12, label: 'Really hurt' },
  { emoji: '🤷', points: 0, label: 'Meh, neutral' },
];

/**
 * Extract the first grapheme (visual character) from a string.
 * Handles multi-codepoint emojis like ❤️, 👨‍👩‍👧, 🇺🇸
 */
function getFirstEmoji(str: string): string {
  const trimmed = str.trim();
  if (!trimmed) return '';
  
  // Use Intl.Segmenter if available (modern browsers/Node 16+)
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = segmenter.segment(trimmed);
    const first = segments[Symbol.iterator]().next().value;
    return first?.segment || '';
  }
  
  // Fallback: use Array.from for basic multi-codepoint handling
  // This works for most emojis but may not handle all ZWJ sequences
  const chars = Array.from(trimmed);
  return chars[0] || '';
}

/**
 * Parse SMS message to extract emoji and points
 * Supports formats:
 * - "🔥 +10" or "🔥 10" → { emoji: '🔥', points: 10 }
 * - "-5 💩" → { emoji: '💩', points: -5 }
 * - "🎉" → { emoji: '🎉', points: 15 } (uses preset)
 * - "🔥 +10 Great job dad!" → { emoji: '🔥', points: 10, note: 'Great job dad!' }
 */
export function parseSMS(message: string): ParsedSMS | null {
  const trimmed = message.trim();
  
  // Pattern 1: Number followed by emoji (e.g., "+10 🔥" or "-5 💩")
  const pattern1 = /^([+-]?\d+)\s*([^\d\s]+)/;
  const match1 = trimmed.match(pattern1);
  
  if (match1) {
    const points = parseInt(match1[1], 10);
    const emoji = getFirstEmoji(match1[2]);
    const remainingText = trimmed.substring(match1[0].length).trim();
    
    return {
      emoji,
      points,
      note: remainingText || undefined,
    };
  }
  
  // Pattern 2: Emoji followed by number (e.g., "🔥 +10" or "💩 -5")
  const pattern2 = /^([^\d\s]+)\s*([+-]?\d+)/;
  const match2 = trimmed.match(pattern2);
  
  if (match2) {
    const emoji = getFirstEmoji(match2[1]);
    const points = parseInt(match2[2], 10);
    const remainingText = trimmed.substring(match2[0].length).trim();
    
    return {
      emoji,
      points,
      note: remainingText || undefined,
    };
  }
  
  // Pattern 3: Just emoji (use preset value)
  const emojiPattern = /^([^\d\s]+)/;
  const match3 = trimmed.match(emojiPattern);
  
  if (match3) {
    const emoji = getFirstEmoji(match3[1]);
    const presetPoints = EMOJI_PRESETS[emoji];
    
    if (presetPoints !== undefined) {
      const remainingText = trimmed.substring(match3[0].length).trim();
      
      return {
        emoji,
        points: presetPoints,
        note: remainingText || undefined,
      };
    }
  }
  
  return null;
}

/**
 * Get the preset point value for an emoji
 */
export function getEmojiPresetPoints(emoji: string): number | undefined {
  return EMOJI_PRESETS[emoji];
}

/**
 * Check if an emoji has a preset value
 */
export function isPresetEmoji(emoji: string): boolean {
  return emoji in EMOJI_PRESETS;
}

/**
 * Get color class based on points value
 */
export function getPointsColor(points: number): string {
  if (points >= 20) return 'text-aura-legendary';
  if (points >= 10) return 'text-aura-high';
  if (points > 0) return 'text-aura-medium';
  if (points === 0) return 'text-gray-500';
  if (points > -10) return 'text-aura-low';
  return 'text-aura-negative';
}

/**
 * Get background color class based on aura total
 */
export function getAuraBackgroundColor(total: number): string {
  if (total >= 100) return 'bg-gradient-to-br from-yellow-400 to-orange-500';
  if (total >= 50) return 'bg-gradient-to-br from-green-400 to-emerald-500';
  if (total > 0) return 'bg-gradient-to-br from-blue-400 to-cyan-500';
  if (total === 0) return 'bg-gradient-to-br from-gray-400 to-gray-500';
  if (total > -50) return 'bg-gradient-to-br from-orange-400 to-red-500';
  return 'bg-gradient-to-br from-red-500 to-rose-700';
}

/**
 * Get glow color class based on aura total
 */
export function getAuraGlowColor(total: number): string {
  if (total >= 100) return 'shadow-[0_0_40px_rgba(251,191,36,0.8)]';
  if (total >= 50) return 'shadow-[0_0_40px_rgba(74,222,128,0.8)]';
  if (total > 0) return 'shadow-[0_0_40px_rgba(96,165,250,0.8)]';
  if (total === 0) return 'shadow-[0_0_20px_rgba(156,163,175,0.5)]';
  if (total > -50) return 'shadow-[0_0_40px_rgba(251,146,60,0.8)]';
  return 'shadow-[0_0_40px_rgba(239,68,68,0.8)]';
}

/**
 * Format aura points with + or - prefix
 */
export function formatPoints(points: number): string {
  if (points > 0) return `+${points}`;
  return points.toString();
}

