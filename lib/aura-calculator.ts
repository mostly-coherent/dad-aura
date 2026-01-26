import { AuraEvent, AuraTrend, AuraStats } from '@/types/aura';
import { startOfDay, subDays, format, isToday } from 'date-fns';

/**
 * Calculate the current total aura from all events
 */
export function calculateCurrentTotal(events: AuraEvent[]): number {
  if (!Array.isArray(events)) return 0;
  return events.reduce((sum, event) => {
    if (!event || typeof event.points !== 'number') return sum;
    return sum + event.points;
  }, 0);
}

/**
 * Calculate today's aura total
 */
export function calculateTodayTotal(events: AuraEvent[]): number {
  if (!Array.isArray(events)) return 0;
  const todayEvents = events.filter(event => {
    if (!event || !event.timestamp) return false;
    try {
      const eventDate = new Date(event.timestamp);
      if (isNaN(eventDate.getTime())) return false;
      return isToday(eventDate);
    } catch {
      return false;
    }
  });
  return calculateCurrentTotal(todayEvents);
}

/**
 * Calculate daily totals for the last N days
 */
export function calculateDailyTrends(events: AuraEvent[], days: number): AuraTrend[] {
  if (!Array.isArray(events) || typeof days !== 'number' || days < 1) {
    return [];
  }
  
  const trends: AuraTrend[] = [];
  const today = startOfDay(new Date());
  
  // Create a map of date -> events
  const eventsByDate = new Map<string, AuraEvent[]>();
  
  events.forEach(event => {
    if (!event || !event.timestamp) return;
    try {
      const eventDateObj = new Date(event.timestamp);
      if (isNaN(eventDateObj.getTime())) return;
      const eventDate = format(startOfDay(eventDateObj), 'yyyy-MM-dd');
      if (!eventsByDate.has(eventDate)) {
        eventsByDate.set(eventDate, []);
      }
      eventsByDate.get(eventDate)!.push(event);
    } catch {
      // Skip invalid dates
    }
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
  if (!Array.isArray(events) || typeof days !== 'number' || days < 1) {
    return [];
  }
  
  try {
    const cutoffDate = subDays(new Date(), days);
    return events.filter(event => {
      if (!event || !event.timestamp) return false;
      try {
        const eventDate = new Date(event.timestamp);
        if (isNaN(eventDate.getTime())) return false;
        return eventDate >= cutoffDate;
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}

/**
 * Calculate comprehensive aura statistics
 */
export function calculateAuraStats(events: AuraEvent[]): AuraStats {
  if (!Array.isArray(events)) {
    return {
      currentTotal: 0,
      todayTotal: 0,
      last7Days: [],
      last30Days: [],
      recentEvents: [],
    };
  }
  
  // Filter out invalid events before sorting
  const validEvents = events.filter((event): event is AuraEvent => {
    return event &&
           typeof event === 'object' &&
           typeof event.timestamp === 'string' &&
           typeof event.points === 'number' &&
           !isNaN(new Date(event.timestamp).getTime());
  });
  
  // Sort events by timestamp descending (newest first)
  const sortedEvents = [...validEvents].sort((a, b) => {
    try {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    } catch {
      return 0;
    }
  });
  
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
  if (!Array.isArray(events) || events.length === 0) return 0;
  const total = calculateCurrentTotal(events);
  return Math.round((total / events.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Get the most used emoji
 */
export function getMostUsedEmoji(events: AuraEvent[]): { emoji: string; count: number } | null {
  if (!Array.isArray(events) || events.length === 0) return null;
  
  const emojiCounts = new Map<string, number>();
  events.forEach(event => {
    if (!event || !event.emoji || typeof event.emoji !== 'string') return;
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
  if (!Array.isArray(events)) return 0;
  
  try {
    const dailyTrends = calculateDailyTrends(events, 30);
    let streak = 0;
    
    // Count from most recent day backwards
    for (let i = dailyTrends.length - 1; i >= 0; i--) {
      if (dailyTrends[i] && typeof dailyTrends[i].total === 'number' && dailyTrends[i].total > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  } catch {
    return 0;
  }
}

