'use client';

import { useEffect, useState, useCallback } from 'react';
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
import LogoutButton from '@/components/LogoutButton';

export default function Home() {
  const [stats, setStats] = useState<AuraStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchAuraData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('aura_events')
        .select('*')
        .order('timestamp', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const events = (data || []) as AuraEvent[];
      const calculatedStats = calculateAuraStats(events);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching aura data:', err);
      setError('Failed to load aura data. Please check your Supabase configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchAuraData();
  }, [fetchAuraData]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('aura_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aura_events',
        },
        () => {
          fetchAuraData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAuraData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-4 animate-bounce" role="img" aria-label="Loading">🔥</div>
          <div className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading Dad Aura...
          </div>
        </div>
      </div>
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
    return null;
  }

  return (
    <main className="min-h-screen pb-8 sm:pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 sm:py-6 px-4 sm:px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-sm">
              Dad Aura <span role="img" aria-hidden="true">🔥</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/95 drop-shadow-sm">
              Real-time dad performance tracking
            </p>
          </div>
          <LogoutButton />
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
        <p>Use The Dad Tribunal above, or text emojis from your Apple Watch!</p>
      </footer>
    </main>
  );
}
