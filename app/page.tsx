'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AuraEvent, AuraStats } from '@/types/aura';
import { calculateAuraStats } from '@/lib/aura-calculator';
import AuraScore from '@/components/AuraScore';
import DadTribunal from '@/components/DadTribunal';
import AuraTrends from '@/components/AuraTrends';
import ActivityFeed from '@/components/ActivityFeed';
import DadFlipButton from '@/components/DadFlipButton';
import FlipConfigPanel from '@/components/FlipConfigPanel';
import EmojiGuide from '@/components/EmojiGuide';
// LogoutButton removed — sign-out is now in SessionGuard (consistent across all apps)
import { AuraScoreSkeleton, ActivityFeedSkeleton, TrendsSkeleton } from '@/components/SkeletonLoader';

export default function Home() {
  const [stats, setStats] = useState<AuraStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchAuraData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const { data, error: fetchError } = await supabase
        .from('aura_events')
        .select('*')
        .order('timestamp', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (!isMountedRef.current) return;

      // Validate data structure
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from database');
      }

      const events = data as AuraEvent[];
      
      // Validate events array before processing
      const validEvents = events.filter((event): event is AuraEvent => {
        return event && 
               typeof event === 'object' &&
               typeof event.points === 'number' &&
               typeof event.timestamp === 'string' &&
               typeof event.emoji === 'string';
      });
      
      const calculatedStats = calculateAuraStats(validEvents);
      
      if (isMountedRef.current) {
        setStats(calculatedStats);
      }
    } catch (err) {
      console.error('Error fetching aura data:', err);
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to load aura data. Please check your Supabase configuration.';
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchAuraData();
  }, [fetchAuraData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    try {
      channel = supabase
        .channel('aura_events_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'aura_events',
          },
          () => {
            // Only fetch if component is still mounted
            if (isMountedRef.current) {
              fetchAuraData();
            }
          }
        )
        .subscribe();
    } catch (subscribeError) {
      console.error('Error setting up real-time subscription:', subscribeError);
      // Don't fail the component if subscription fails
    }

    return () => {
      if (channel) {
        try {
          channel.unsubscribe();
          supabase.removeChannel(channel);
        } catch (cleanupError) {
          console.error('Error cleaning up real-time subscription:', cleanupError);
        }
      }
    };
  }, [fetchAuraData]);

  if (loading) {
    return (
      <main className="min-h-screen pb-8 sm:pb-12">
        <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 sm:py-6 px-4 sm:px-6 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                Dad Aura 🔥
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/95 drop-shadow-sm">
                Real-time dad performance tracking
              </p>
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto">
          <AuraScoreSkeleton />
          <TrendsSkeleton />
          <ActivityFeedSkeleton />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-6 sm:p-8 max-w-md w-full">
          <div className="text-5xl sm:text-6xl mb-4 text-center" role="img" aria-label="Error">⚠️</div>
          <h2 className="text-lg sm:text-xl font-bold text-red-800 dark:text-red-200 mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={fetchAuraData}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    // Show loading state if stats is null but not loading
    return (
      <main className="min-h-screen pb-8 sm:pb-12">
        <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 sm:py-6 px-4 sm:px-6 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                Dad Aura 🔥
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/95 drop-shadow-sm">
                Real-time dad performance tracking
              </p>
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto">
          <AuraScoreSkeleton />
          <TrendsSkeleton />
          <ActivityFeedSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-8 sm:pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 sm:py-6 px-4 sm:px-6 shadow-lg relative overflow-hidden">
        {/* Animated background decorations */}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line react/no-unknown-property */}
          <div className="absolute top-0 left-1/4 text-6xl opacity-20 animate-float delay-0">🔥</div>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <div className="absolute top-0 right-1/4 text-5xl opacity-20 animate-float delay-1000">⭐</div>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <div className="absolute bottom-0 left-1/3 text-4xl opacity-20 animate-float delay-2000">🎉</div>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <div className="absolute bottom-0 right-1/3 text-5xl opacity-20 animate-float delay-1500">💪</div>
        </div>
        <div className="max-w-6xl mx-auto flex items-start justify-between relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg flex items-center gap-2">
              <span className="animate-bounce-gentle inline-block">Dad Aura</span>
              <span className="inline-block animate-wiggle" role="img" aria-hidden="true">🔥</span>
              {/* eslint-disable-next-line react/no-unknown-property */}
              <span className="inline-block animate-sparkle delay-500" role="img" aria-hidden="true">✨</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/95 drop-shadow-sm flex items-center gap-2">
              <span>Real-time dad performance tracking</span>
              {/* eslint-disable-next-line react/no-unknown-property */}
              <span className="animate-bounce-gentle inline-block delay-300" role="img" aria-hidden="true">👨‍👦</span>
            </p>
          </div>
          {/* Sign-out is handled by SessionGuard (fixed top-right) */}
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Aura Score */}
        <AuraScore total={stats.currentTotal} todayTotal={stats.todayTotal} />

        {/* THE DAD TRIBUNAL - AI Judge (Prominently positioned!) */}
        <DadTribunal onVerdictSaved={fetchAuraData} />

        {/* Dad Flip Button */}
        <DadFlipButton 
          currentTotal={stats.currentTotal} 
          onFlipSuccess={fetchAuraData}
        />

        {/* Son's Control Panel */}
        <FlipConfigPanel />

        {/* Trends */}
        <AuraTrends last7Days={stats.last7Days} last30Days={stats.last30Days} />

        {/* Activity Feed */}
        <ActivityFeed events={stats.recentEvents} />

        {/* Emoji Guide (for SMS from Apple Watch) */}
        <EmojiGuide />
      </div>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 text-center text-gray-700 dark:text-gray-300 text-xs sm:text-sm px-4">
        <p className="flex items-center justify-center gap-2">
          <span>Use The Dad Tribunal above, or text emojis from your Apple Watch!</span>
          <span className="animate-bounce-gentle inline-block" role="img" aria-hidden="true">⌚</span>
        </p>
      </footer>
    </main>
  );
}
