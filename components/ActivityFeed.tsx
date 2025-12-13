'use client';

import { AuraEvent } from '@/types/aura';
import { formatPoints, getPointsColor } from '@/lib/emoji-parser';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  events: AuraEvent[];
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🤷</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
            No aura events yet
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mt-2">
            Send your first emoji to get started!
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
    <section className="px-6 py-8" aria-label="Recent aura activity">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          <span aria-hidden="true">🎯 </span>Recent Activity
        </h2>
        
        <ul className="space-y-4" role="list" aria-label="Aura events">
          {events.map((event) => {
            const isFlip = isFlipEvent(event);
            const pointsLabel = isFlip 
              ? 'Dad used a flip' 
              : `${event.points > 0 ? 'plus' : event.points < 0 ? 'minus' : ''} ${Math.abs(event.points)} points`;
            
            return (
              <li
                key={event.id}
                className={`
                  flex items-start gap-4 p-4 rounded-lg transition-colors
                  ${isFlip 
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-600' 
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }
                `}
                aria-label={`${event.emoji} ${pointsLabel}, ${formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}${event.note ? `, note: ${event.note}` : ''}`}
              >
                {/* Emoji */}
                <span 
                  className={`text-4xl flex-shrink-0 ${isFlip ? 'animate-spin-slow' : ''}`}
                  role="img" 
                  aria-hidden="true"
                >
                  {event.emoji}
                </span>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    {isFlip ? (
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        DAD FLIP!
                      </span>
                    ) : (
                      <span className={`text-2xl font-bold ${getPointsColor(event.points)}`} aria-hidden="true">
                        {formatPoints(event.points)}
                      </span>
                    )}
                    <time 
                      className="text-sm text-gray-500 dark:text-gray-400"
                      dateTime={new Date(event.timestamp).toISOString()}
                    >
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </time>
                  </div>
                  
                  {event.note && (
                    <p className={`text-sm ${isFlip ? 'text-purple-700 dark:text-purple-300 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                      {event.note}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${isFlip ? 'bg-purple-200 dark:bg-purple-700 text-purple-700 dark:text-purple-200' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}`}>
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

