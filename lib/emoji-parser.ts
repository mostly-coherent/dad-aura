import { ParsedSMS, EmojiPreset } from '@/types/aura';

// Emoji presets with default point values
export const EMOJI_PRESETS: Record<string, number> = {
  // === LEGENDARY (20-25 points) ===
  '💯': 25,      // Perfect!
  '⚡': 25,      // Legendary move
  '🏆': 20,      // Trophy dad
  '👑': 20,      // King dad
  '🥇': 20,      // Gold medal
  '🎯': 20,      // Bullseye
  
  // === AWESOME (10-15 points) ===
  '🎉': 15,      // Epic celebration
  '🙌': 15,      // Raised hands praise
  '🤩': 12,      // Star-struck
  '🌈': 12,      // Rainbow vibes
  '🎂': 12,      // Birthday/special
  '🔥': 10,      // Fire/awesome
  '⭐': 10,      // Star
  '🥳': 10,      // Party face
  
  // === GOOD (5-9 points) ===
  '🎁': 8,       // Gift
  '🌟': 8,       // Glowing star
  '😍': 8,       // Heart eyes
  '🥰': 8,       // Smiling with hearts
  '💖': 7,       // Sparkling heart
  '💪': 7,       // Strong
  '🤗': 6,       // Hugging
  '😄': 6,       // Grinning
  '👏': 6,       // Clapping
  '💕': 6,       // Two hearts
  '❤️': 5,       // Heart
  '😊': 5,       // Smiling
  '🙏': 5,       // Thank you
  '🎮': 5,       // Gaming together
  '🎵': 4,       // Music
  '🍦': 4,       // Ice cream treat
  '☕': 4,       // Coffee/chill time
  
  // === OKAY (1-3 points) ===
  '👍': 3,       // Thumbs up
  '🍕': 3,       // Pizza time
  '😎': 3,       // Cool
  '🤝': 3,       // Handshake/deal
  '😀': 2,       // Basic smile
  '🙂': 1,       // Slight smile
  
  // === NEUTRAL (0 points) ===
  '🤷': 0,       // Meh
  '😐': 0,       // Neutral face
  '🤔': 0,       // Thinking
  
  // === MILD NEGATIVE (-1 to -5 points) ===
  '🥺': -2,      // Pleading/puppy eyes
  '👎': -3,      // Thumbs down
  '😒': -4,      // Unamused
  '🙄': -4,      // Eye roll
  '😔': -4,      // Sad
  '😞': -5,      // Disappointed
  '💩': -5,      // Poop
  '😢': -5,      // Crying
  
  // === NEGATIVE (-6 to -10 points) ===
  '😫': -6,      // Tired of this
  '😩': -6,      // Weary
  '😭': -7,      // Sobbing
  '😤': -8,      // Frustrated
  '💢': -8,      // Anger symbol
  '😡': -10,     // Angry face
  
  // === SEVERE (-12 to -15 points) ===
  '💔': -12,     // Heartbroken
  '🤬': -15,     // Cursing mad
};

export const EMOJI_PRESET_LIST: EmojiPreset[] = [
  // Legendary
  { emoji: '💯', points: 25, label: 'Perfect!' },
  { emoji: '⚡', points: 25, label: 'Legendary move' },
  { emoji: '🏆', points: 20, label: 'Trophy dad' },
  { emoji: '👑', points: 20, label: 'King dad' },
  { emoji: '🥇', points: 20, label: 'Gold medal' },
  { emoji: '🎯', points: 20, label: 'Bullseye' },
  // Awesome
  { emoji: '🎉', points: 15, label: 'Epic celebration' },
  { emoji: '🙌', points: 15, label: 'Praise!' },
  { emoji: '🤩', points: 12, label: 'Star-struck' },
  { emoji: '🌈', points: 12, label: 'Rainbow vibes' },
  { emoji: '🎂', points: 12, label: 'Special day' },
  { emoji: '🔥', points: 10, label: 'Fire!' },
  { emoji: '⭐', points: 10, label: 'Star' },
  { emoji: '🥳', points: 10, label: 'Party!' },
  // Good
  { emoji: '🎁', points: 8, label: 'Gift' },
  { emoji: '🌟', points: 8, label: 'Shining' },
  { emoji: '😍', points: 8, label: 'Heart eyes' },
  { emoji: '🥰', points: 8, label: 'Love' },
  { emoji: '💖', points: 7, label: 'Sparkling heart' },
  { emoji: '💪', points: 7, label: 'Strong' },
  { emoji: '🤗', points: 6, label: 'Hugs' },
  { emoji: '😄', points: 6, label: 'Grinning' },
  { emoji: '👏', points: 6, label: 'Clapping' },
  { emoji: '💕', points: 6, label: 'Hearts' },
  { emoji: '❤️', points: 5, label: 'Love you' },
  { emoji: '😊', points: 5, label: 'Smiling' },
  { emoji: '🙏', points: 5, label: 'Thank you' },
  { emoji: '🎮', points: 5, label: 'Gaming' },
  { emoji: '🎵', points: 4, label: 'Music' },
  { emoji: '🍦', points: 4, label: 'Ice cream' },
  { emoji: '☕', points: 4, label: 'Coffee time' },
  { emoji: '👍', points: 3, label: 'Good job' },
  { emoji: '🍕', points: 3, label: 'Pizza!' },
  { emoji: '😎', points: 3, label: 'Cool' },
  // Neutral
  { emoji: '🤷', points: 0, label: 'Meh' },
  { emoji: '😐', points: 0, label: 'Neutral' },
  { emoji: '🤔', points: 0, label: 'Thinking' },
  // Mild negative
  { emoji: '🥺', points: -2, label: 'Puppy eyes' },
  { emoji: '👎', points: -3, label: 'Not cool' },
  { emoji: '😒', points: -4, label: 'Unamused' },
  { emoji: '🙄', points: -4, label: 'Eye roll' },
  { emoji: '😔', points: -4, label: 'Sad' },
  { emoji: '😞', points: -5, label: 'Disappointed' },
  { emoji: '💩', points: -5, label: 'Poop' },
  { emoji: '😢', points: -5, label: 'Crying' },
  // Negative
  { emoji: '😫', points: -6, label: 'Tired of this' },
  { emoji: '😩', points: -6, label: 'Weary' },
  { emoji: '😭', points: -7, label: 'Sobbing' },
  { emoji: '😤', points: -8, label: 'Frustrated' },
  { emoji: '💢', points: -8, label: 'Angry' },
  { emoji: '😡', points: -10, label: 'Mad' },
  // Severe
  { emoji: '💔', points: -12, label: 'Heartbroken' },
  { emoji: '🤬', points: -15, label: 'Furious' },
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

