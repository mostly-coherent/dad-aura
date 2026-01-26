import { supabase } from './supabase';
import { DadFlip, FlipConfig, FlipStatus } from '@/types/aura';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * Get the flip configuration (max flips per day)
 */
export async function getFlipConfig(): Promise<FlipConfig | null> {
  const { data, error } = await supabase
    .from('flip_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('Error fetching flip config:', error);
    return null;
  }

  return data as FlipConfig;
}

/**
 * Update the flip configuration (son only)
 */
export async function updateFlipConfig(maxFlipsPerDay: number): Promise<boolean> {
  // Validate input
  if (typeof maxFlipsPerDay !== 'number' || isNaN(maxFlipsPerDay) || maxFlipsPerDay < 0 || maxFlipsPerDay > 10) {
    console.error('Invalid maxFlipsPerDay value:', maxFlipsPerDay);
    return false;
  }

  try {
    const timestamp = new Date().toISOString();
    
    // Validate timestamp
    if (!timestamp || timestamp === 'Invalid Date') {
      console.error('Invalid timestamp generated');
      return false;
    }

    const { error } = await supabase
      .from('flip_config')
      .update({ 
        max_flips_per_day: maxFlipsPerDay,
        updated_at: timestamp,
      })
      .eq('id', 1);

    if (error) {
      console.error('Error updating flip config:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error in updateFlipConfig:', err);
    return false;
  }
}

/**
 * Get today's flip count
 */
export async function getTodaysFlipCount(): Promise<number> {
  try {
    const today = startOfDay(new Date());
    const tomorrow = endOfDay(new Date());
    
    // Validate dates
    if (isNaN(today.getTime()) || isNaN(tomorrow.getTime())) {
      console.error('Invalid date range for flip count');
      return 0;
    }

    const { data, error } = await supabase
      .from('dad_flips')
      .select('id')
      .gte('timestamp', today.toISOString())
      .lte('timestamp', tomorrow.toISOString());

    if (error) {
      console.error('Error fetching today\'s flip count:', error);
      return 0;
    }

    // Validate data is array
    if (!Array.isArray(data)) {
      return 0;
    }

    return data.length;
  } catch (err) {
    console.error('Unexpected error in getTodaysFlipCount:', err);
    return 0;
  }
}

/**
 * Get all flips for today
 */
export async function getTodaysFlips(): Promise<DadFlip[]> {
  try {
    const today = startOfDay(new Date());
    const tomorrow = endOfDay(new Date());
    
    // Validate dates
    if (isNaN(today.getTime()) || isNaN(tomorrow.getTime())) {
      console.error('Invalid date range for flips');
      return [];
    }

    const { data, error } = await supabase
      .from('dad_flips')
      .select('*')
      .gte('timestamp', today.toISOString())
      .lte('timestamp', tomorrow.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching today\'s flips:', error);
      return [];
    }

    // Validate data is array
    if (!Array.isArray(data)) {
      return [];
    }

    return data as DadFlip[];
  } catch (err) {
    console.error('Unexpected error in getTodaysFlips:', err);
    return [];
  }
}

/**
 * Get flip status (can dad flip today?)
 */
export async function getFlipStatus(): Promise<FlipStatus> {
  const config = await getFlipConfig();
  const flipsUsedToday = await getTodaysFlipCount();
  const maxFlipsPerDay = config?.max_flips_per_day || 2;

  return {
    canFlip: flipsUsedToday < maxFlipsPerDay,
    flipsUsedToday,
    maxFlipsPerDay,
    flipsRemainingToday: Math.max(0, maxFlipsPerDay - flipsUsedToday),
  };
}

/**
 * Perform a flip (dad only)
 * Flips the current aura total from negative to positive or vice versa
 * 
 * NOTE: This function has a race condition risk - concurrent requests could exceed flip limits.
 * For production, consider using database-level constraints or transactions.
 */
export async function performFlip(currentTotal: number): Promise<{ success: boolean; newTotal?: number; error?: string }> {
  // Validate input
  if (typeof currentTotal !== 'number' || isNaN(currentTotal)) {
    return {
      success: false,
      error: 'Invalid currentTotal provided',
    };
  }

  try {
    // Check if dad can flip today
    const status = await getFlipStatus();
    
    if (!status.canFlip) {
      return {
        success: false,
        error: `You've used all ${status.maxFlipsPerDay} flips for today. Try again tomorrow!`,
      };
    }

    // Calculate flipped total (multiply by -1)
    const flippedTotal = currentTotal * -1;
    
    // Validate flipped total is finite
    if (!isFinite(flippedTotal)) {
      return {
        success: false,
        error: 'Invalid flip calculation result',
      };
    }

    const timestamp = new Date().toISOString();
    
    // Validate timestamp
    if (!timestamp || timestamp === 'Invalid Date') {
      return {
        success: false,
        error: 'Invalid timestamp generated',
      };
    }

    // Record the flip first
    const { error: flipError, data: flipData } = await supabase
      .from('dad_flips')
      .insert([
        {
          previous_total: currentTotal,
          flipped_total: flippedTotal,
          timestamp,
        },
      ])
      .select();

    if (flipError) {
      console.error('Error recording flip:', flipError);
      return {
        success: false,
        error: 'Failed to record flip. Please try again.',
      };
    }

    // Verify flip was inserted
    if (!flipData || !Array.isArray(flipData) || flipData.length === 0) {
      console.error('Flip insert returned no data');
      return {
        success: false,
        error: 'Failed to record flip. Please try again.',
      };
    }

    // Create a special aura event to represent the flip
    const pointsChange = flippedTotal - currentTotal;
    
    // Validate points change
    if (!isFinite(pointsChange)) {
      console.error('Invalid points change calculated:', pointsChange);
      // Don't fail the flip if event creation fails - flip is already recorded
    } else {
      const { error: eventError } = await supabase
        .from('aura_events')
        .insert([
          {
            emoji: '🔄',
            points: pointsChange,
            source: 'web',
            note: `Dad used a flip! ${currentTotal} → ${flippedTotal}`,
            timestamp,
          },
        ]);

      if (eventError) {
        // Log but don't fail - flip is already recorded
        console.error('Error creating flip event (non-critical):', eventError);
      }
    }

    return {
      success: true,
      newTotal: flippedTotal,
    };
  } catch (err) {
    console.error('Unexpected error in performFlip:', err);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Get all flips (for history)
 */
export async function getAllFlips(limit: number = 20): Promise<DadFlip[]> {
  // Validate limit
  if (typeof limit !== 'number' || isNaN(limit) || limit < 1 || limit > 1000) {
    console.error('Invalid limit value:', limit);
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('dad_flips')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching flips:', error);
      return [];
    }

    // Validate data is array
    if (!Array.isArray(data)) {
      return [];
    }

    return data as DadFlip[];
  } catch (err) {
    console.error('Unexpected error in getAllFlips:', err);
    return [];
  }
}

/**
 * Format flip message for display
 */
export function formatFlipMessage(flip: DadFlip): string {
  return `Dad flipped: ${flip.previous_total} → ${flip.flipped_total}`;
}

