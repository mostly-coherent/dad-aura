'use client';

import { AuraEvent } from '@/types/aura';
import { formatPoints, getPointsColor } from '@/lib/emoji-parser';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  events: AuraEvent[];
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  // Validate props
  if (!events || !Array.isArray(events)) {
    return (
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl p-6 sm:p-8 text-center border-2 border-purple-200 dark:border-purple-700">
          <div className="text-5xl sm:text-6xl mb-4" role="img" aria-label="Error loading events">⚠️</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">
            Unable to load activity feed
          </h3>
        </div>
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl p-6 sm:p-8 text-center border-2 border-purple-200 dark:border-purple-700">
          <div className="text-5xl sm:text-6xl mb-4 animate-bounce-gentle inline-block" role="img" aria-label="No events yet">🤷</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
            <span>No aura events yet</span>
            <span className="animate-wiggle inline-block" role="img" aria-hidden="true">😊</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base flex items-center justify-center gap-1">
            <span>Send your first emoji to get started!</span>
            <span className="animate-bounce-gentle inline-block" role="img" aria-hidden="true">📱</span>
          </p>
        </div>
      </div>
    );
  }

  // Check if event is a flip event
  const isFlipEvent = (event: AuraEvent) => {
    return event.emoji === '🔄' && event.note?.includes('Dad used a flip');
  };
  
  return (
    <section className="px-4 sm:px-6 py-6 sm:py-8" aria-label="Recent aura activity">
      <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl p-4 sm:p-6 border-2 border-indigo-200 dark:border-indigo-700 hover-glow transition-all duration-300">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white flex items-center gap-2">
          <span className="animate-bounce-gentle inline-block" aria-hidden="true">🎯</span>
          <span>Recent Activity</span>
        </h2>
        
        <ul className="space-y-3 sm:space-y-4" role="list" aria-label="Aura events">
          {events
            .filter((event): event is AuraEvent => {
              return event && 
                     typeof event === 'object' &&
                     typeof event.id === 'string' &&
                     typeof event.timestamp === 'string' &&
                     typeof event.points === 'number' &&
                     typeof event.emoji === 'string';
            })
            .map((event) => {
            const isFlip = isFlipEvent(event);
            const pointsLabel = isFlip 
              ? 'Dad used a flip' 
              : `${event.points > 0 ? 'plus' : event.points < 0 ? 'minus' : ''} ${Math.abs(event.points)} points`;
            
            // Validate timestamp
            let timeAgo = 'recently';
            try {
              const eventDate = new Date(event.timestamp);
              if (!isNaN(eventDate.getTime())) {
                timeAgo = formatDistanceToNow(eventDate, { addSuffix: true });
              }
            } catch {
              // Use default if date parsing fails
            }
            
            return (
              <li
                key={event.id}
                className={`
                  flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all duration-300
                  hover-lift hover-glow
                  ${isFlip 
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-2 border-purple-400 dark:border-purple-500 shadow-lg' 
                    : event.points > 0
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700'
                    : event.points < 0
                    ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-700'
                    : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600'
                  }
                `}
                aria-label={`${event.emoji} ${pointsLabel}, ${timeAgo}${event.note ? `, note: ${event.note}` : ''}`}
              >
                {/* Emoji */}
                <span 
                  className={`text-3xl sm:text-4xl flex-shrink-0 transition-transform duration-300 hover:scale-125 hover:rotate-12 ${event.points > 0 ? 'animate-bounce-gentle' : ''}`}
                  role="img" 
                  aria-hidden="true"
                >
                  {event.emoji}
                </span>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    {isFlip ? (
                      <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        DAD FLIP!
                      </span>
                    ) : (
                      <span className={`text-xl sm:text-2xl font-bold ${getPointsColor(event.points)}`} aria-hidden="true">
                        {formatPoints(event.points)}
                      </span>
                    )}
                    <time 
                      className="text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                      dateTime={(() => {
                        try {
                          const eventDate = new Date(event.timestamp);
                          return !isNaN(eventDate.getTime()) ? eventDate.toISOString() : '';
                        } catch {
                          return '';
                        }
                      })()}
                    >
                      {timeAgo}
                    </time>
                  </div>
                  
                  {event.note && (
                    <p className={`text-sm ${isFlip ? 'text-purple-800 dark:text-purple-300 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                      {event.note}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-full font-medium ${isFlip ? 'bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}>
                      {isFlip ? 'dad flip' : event.source}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
