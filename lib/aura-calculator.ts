import { AuraEvent, AuraTrend, AuraStats } from '@/types/aura';
import { startOfDay, subDays, format, isToday } from 'date-fns';

/**
 * Calculate the current total aura from all events
 */
export function calculateCurrentTotal(events: AuraEvent[]): number {
  return events.reduce((sum, event) => sum + event.points, 0);
}

/**
 * Calculate today's aura total
 */
export function calculateTodayTotal(events: AuraEvent[]): number {
  const todayEvents = events.filter(event => 
    isToday(new Date(event.timestamp))
  );
  return calculateCurrentTotal(todayEvents);
}

/**
 * Calculate daily totals for the last N days
 */
export function calculateDailyTrends(events: AuraEvent[], days: number): AuraTrend[] {
  const trends: AuraTrend[] = [];
  const today = startOfDay(new Date());
  
  // Create a map of date -> events
  const eventsByDate = new Map<string, AuraEvent[]>();
  
  events.forEach(event => {
    const eventDate = format(startOfDay(new Date(event.timestamp)), 'yyyy-MM-dd');
    if (!eventsByDate.has(eventDate)) {
      eventsByDate.set(eventDate, []);
    }
    eventsByDate.get(eventDate)!.push(event);
  });
  
  // Generate trends for last N days
  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate.get(dateStr) || [];
    
    trends.push({
      date: dateStr,
      total: calculateCurrentTotal(dayEvents),
      events: dayEvents.length,
    });
  }
  
  // Reverse so oldest is first
  return trends.reverse();
}

/**
 * Calculate cumulative aura over time (for line charts)
 */
export function calculateCumulativeTrends(events: AuraEvent[], days: number): AuraTrend[] {
  const dailyTrends = calculateDailyTrends(events, days);
  let cumulative = 0;
  
  return dailyTrends.map(trend => {
    cumulative += trend.total;
    return {
      ...trend,
      total: cumulative,
    };
  });
}

/**
 * Get events from the last N days
 */
export function getRecentEvents(events: AuraEvent[], days: number): AuraEvent[] {
  const cutoffDate = subDays(new Date(), days);
  return events.filter(event => 
    new Date(event.timestamp) >= cutoffDate
  );
}

/**
 * Calculate comprehensive aura statistics
 */
export function calculateAuraStats(events: AuraEvent[]): AuraStats {
  // Sort events by timestamp descending (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return {
    currentTotal: calculateCurrentTotal(sortedEvents),
    todayTotal: calculateTodayTotal(sortedEvents),
    last7Days: calculateDailyTrends(sortedEvents, 7),
    last30Days: calculateDailyTrends(sortedEvents, 30),
    recentEvents: sortedEvents.slice(0, 20), // Last 20 events
  };
}

/**
 * Get aura status label based on total
 */
export function getAuraStatus(total: number): string {
  if (total >= 200) return '🏆 Legendary Dad';
  if (total >= 100) return '⭐ Epic Dad';
  if (total >= 50) return '🔥 Great Dad';
  if (total > 0) return '👍 Good Dad';
  if (total === 0) return '🤷 Neutral';
  if (total > -50) return '😬 Dad Needs Work';
  if (total > -100) return '😤 Dad in Trouble';
  return '💔 Dad Emergency';
}

/**
 * Calculate average points per event
 */
export function calculateAveragePoints(events: AuraEvent[]): number {
  if (events.length === 0) return 0;
  const total = calculateCurrentTotal(events);
  return Math.round((total / events.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Get the most used emoji
 */
export function getMostUsedEmoji(events: AuraEvent[]): { emoji: string; count: number } | null {
  if (events.length === 0) return null;
  
  const emojiCounts = new Map<string, number>();
  events.forEach(event => {
    const count = emojiCounts.get(event.emoji) || 0;
    emojiCounts.set(event.emoji, count + 1);
  });
  
  let maxEmoji = '';
  let maxCount = 0;
  emojiCounts.forEach((count, emoji) => {
    if (count > maxCount) {
      maxEmoji = emoji;
      maxCount = count;
    }
  });
  
  return { emoji: maxEmoji, count: maxCount };
}

/**
 * Calculate streak of positive days
 */
export function calculatePositiveStreak(events: AuraEvent[]): number {
  const dailyTrends = calculateDailyTrends(events, 30);
  let streak = 0;
  
  // Count from most recent day backwards
  for (let i = dailyTrends.length - 1; i >= 0; i--) {
    if (dailyTrends[i].total > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

