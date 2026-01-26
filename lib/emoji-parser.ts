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
 * Normalize an emoji string to handle variation selectors and encoding differences.
 * SMS providers may encode emojis differently (with/without FE0F variation selector).
 */
function normalizeEmoji(emoji: string): string {
  // Remove variation selectors (U+FE0E and U+FE0F) for consistent matching
  // These are invisible characters that affect emoji presentation
  return emoji.normalize('NFC').replace(/[\uFE0E\uFE0F]/g, '');
}

/**
 * Build a normalized lookup map for emoji presets.
 * This allows matching emojis regardless of variation selectors.
 */
function buildNormalizedPresetMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (const [emoji, points] of Object.entries(EMOJI_PRESETS)) {
    // Store both normalized and original versions
    map.set(normalizeEmoji(emoji), points);
    map.set(emoji, points);
  }
  return map;
}

// Pre-built normalized map for fast lookups
const NORMALIZED_PRESETS = buildNormalizedPresetMap();

/**
 * Get preset points for an emoji, handling encoding variations.
 */
function getPresetPointsNormalized(emoji: string): number | undefined {
  if (!emoji || typeof emoji !== 'string' || emoji.trim().length === 0) {
    return undefined;
  }
  
  // Try exact match first
  if (EMOJI_PRESETS[emoji] !== undefined) {
    return EMOJI_PRESETS[emoji];
  }
  // Try normalized match
  try {
    return NORMALIZED_PRESETS.get(normalizeEmoji(emoji));
  } catch {
    return undefined;
  }
}

/**
 * Extract the first grapheme (visual character) from a string.
 * Handles multi-codepoint emojis like ❤️, 👨‍👩‍👧, 🇺🇸
 */
function getFirstEmoji(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  const trimmed = str.trim();
  if (!trimmed) return '';
  
  // Use Intl.Segmenter if available (modern browsers/Node 16+)
  // Note: Not available in Edge runtime, so we have a robust fallback
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
      const segments = segmenter.segment(trimmed);
      const first = segments[Symbol.iterator]().next().value;
      const result = first?.segment || '';
      // Validate result is not empty
      return result.trim().length > 0 ? result : '';
    } catch {
      // Fall through to fallback
    }
  }
  
  // Fallback: Extract first emoji using Array.from and check for ZWJ sequences
  // This handles most emojis including those with variation selectors
  try {
    const chars = Array.from(trimmed);
    if (chars.length === 0) return '';
    
    // Check if first char is start of emoji sequence
    let emoji = chars[0];
    if (!emoji) return '';
    
    let i = 1;
    
    // Consume ZWJ sequences (emoji + ZWJ + emoji) and variation selectors
    while (i < chars.length) {
      const char = chars[i];
      if (!char) break;
      
      const code = char.codePointAt(0);
      if (code === undefined || code === null) break;
      
      // ZWJ (Zero Width Joiner) - connects emoji sequences
      if (code === 0x200D) {
        emoji += char;
        i++;
        // Consume the next character after ZWJ
        if (i < chars.length && chars[i]) {
          emoji += chars[i];
          i++;
        }
      }
      // Variation selectors (FE0E, FE0F) and skin tone modifiers (1F3FB-1F3FF)
      else if (code === 0xFE0E || code === 0xFE0F || (code >= 0x1F3FB && code <= 0x1F3FF)) {
        emoji += char;
        i++;
      }
      // Combining marks for flags and keycaps
      else if (code === 0x20E3 || (code >= 0x1F1E6 && code <= 0x1F1FF)) {
        emoji += char;
        i++;
      }
      else {
        break;
      }
    }
    
    return emoji.trim().length > 0 ? emoji : '';
  } catch {
    // If fallback fails, return empty string
    return '';
  }
}

/**
 * Validate parsed SMS result
 */
function validateParsedSMS(parsed: ParsedSMS): boolean {
  // Validate emoji exists and is not empty
  if (!parsed.emoji || parsed.emoji.trim().length === 0) {
    return false;
  }

  // Validate points are within reasonable bounds (-100 to +100)
  if (parsed.points < -100 || parsed.points > 100) {
    return false;
  }

  // Validate note length (max 500 characters)
  if (parsed.note && parsed.note.length > 500) {
    return false;
  }

  return true;
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
  // Input validation
  if (!message || typeof message !== 'string') {
    return null;
  }

  const trimmed = message.trim();
  
  // Reject empty or extremely long messages
  if (trimmed.length === 0 || trimmed.length > 1000) {
    return null;
  }
  
  // Pattern 1: Number followed by emoji (e.g., "+10 🔥" or "-5 💩")
  const pattern1 = /^([+-]?\d+)\s+([^\d\s]+)/;
  const match1 = trimmed.match(pattern1);
  
  if (match1) {
    const pointsStr = match1[1];
    const emojiStr = match1[2];
    
    // Validate inputs before parsing
    if (!pointsStr || !emojiStr) {
      return null;
    }
    
    const points = parseInt(pointsStr, 10);
    // Validate points is a valid number and within reasonable bounds
    if (isNaN(points) || points < -1000 || points > 1000) {
      return null;
    }
    
    const emoji = getFirstEmoji(emojiStr);
    if (!emoji || emoji.trim().length === 0) {
      return null;
    }
    
    const remainingText = trimmed.substring(match1[0].length).trim();
    
    const parsed = {
      emoji,
      points,
      note: remainingText || undefined,
    };

    if (validateParsedSMS(parsed)) {
      return parsed;
    }
    return null;
  }
  
  // Pattern 2: Emoji followed by number (e.g., "🔥 +10" or "💩 -5")
  const pattern2 = /^([^\d\s]+)\s+([+-]?\d+)/;
  const match2 = trimmed.match(pattern2);
  
  if (match2) {
    const emojiStr = match2[1];
    const pointsStr = match2[2];
    
    // Validate inputs before parsing
    if (!emojiStr || !pointsStr) {
      return null;
    }
    
    const emoji = getFirstEmoji(emojiStr);
    if (!emoji || emoji.trim().length === 0) {
      return null;
    }
    
    const points = parseInt(pointsStr, 10);
    // Validate points is a valid number and within reasonable bounds
    if (isNaN(points) || points < -1000 || points > 1000) {
      return null;
    }
    
    const remainingText = trimmed.substring(match2[0].length).trim();
    
    const parsed = {
      emoji,
      points,
      note: remainingText || undefined,
    };

    if (validateParsedSMS(parsed)) {
      return parsed;
    }
    return null;
  }
  
  // Pattern 3: Just emoji (use preset value)
  const emojiPattern = /^([^\d\s]+)/;
  const match3 = trimmed.match(emojiPattern);
  
  if (match3) {
    const emoji = getFirstEmoji(match3[1]);
    // Use normalized lookup to handle encoding variations from SMS providers
    const presetPoints = getPresetPointsNormalized(emoji);
    
    if (presetPoints !== undefined) {
      const remainingText = trimmed.substring(match3[0].length).trim();
      
      const parsed = {
        emoji,
        points: presetPoints,
        note: remainingText || undefined,
      };

      if (validateParsedSMS(parsed)) {
        return parsed;
      }
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

