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
  const { error } = await supabase
    .from('flip_config')
    .update({ 
      max_flips_per_day: maxFlipsPerDay,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    console.error('Error updating flip config:', error);
    return false;
  }

  return true;
}

/**
 * Get today's flip count
 */
export async function getTodaysFlipCount(): Promise<number> {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

  const { data, error } = await supabase
    .from('dad_flips')
    .select('id')
    .gte('timestamp', today.toISOString())
    .lte('timestamp', tomorrow.toISOString());

  if (error) {
    console.error('Error fetching today\'s flip count:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Get all flips for today
 */
export async function getTodaysFlips(): Promise<DadFlip[]> {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

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

  return (data || []) as DadFlip[];
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
 */
export async function performFlip(currentTotal: number): Promise<{ success: boolean; newTotal?: number; error?: string }> {
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

  // Record the flip
  const { error } = await supabase
    .from('dad_flips')
    .insert([
      {
        previous_total: currentTotal,
        flipped_total: flippedTotal,
        timestamp: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Error recording flip:', error);
    return {
      success: false,
      error: 'Failed to record flip. Please try again.',
    };
  }

  // Create a special aura event to represent the flip
  const pointsChange = flippedTotal - currentTotal;
  const { error: eventError } = await supabase
    .from('aura_events')
    .insert([
      {
        emoji: '🔄',
        points: pointsChange,
        source: 'web',
        note: `Dad used a flip! ${currentTotal} → ${flippedTotal}`,
        timestamp: new Date().toISOString(),
      },
    ]);

  if (eventError) {
    console.error('Error creating flip event:', eventError);
  }

  return {
    success: true,
    newTotal: flippedTotal,
  };
}

/**
 * Get all flips (for history)
 */
export async function getAllFlips(limit: number = 20): Promise<DadFlip[]> {
  const { data, error } = await supabase
    .from('dad_flips')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching flips:', error);
    return [];
  }

  return (data || []) as DadFlip[];
}

/**
 * Format flip message for display
 */
export function formatFlipMessage(flip: DadFlip): string {
  return `Dad flipped: ${flip.previous_total} → ${flip.flipped_total}`;
}

