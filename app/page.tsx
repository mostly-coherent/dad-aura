'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AuraEvent, AuraStats } from '@/types/aura';
import { calculateAuraStats } from '@/lib/aura-calculator';
import AuraScore from '@/components/AuraScore';
import AuraTrends from '@/components/AuraTrends';
import ActivityFeed from '@/components/ActivityFeed';
import DadFlipButton from '@/components/DadFlipButton';
import FlipConfigPanel from '@/components/FlipConfigPanel';
import EmojiGuide from '@/components/EmojiGuide';

export default function Home() {
  const [stats, setStats] = useState<AuraStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchAuraData();
  }, []);

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
        (payload) => {
          console.log('Real-time update:', payload);
          fetchAuraData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchAuraData() {
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
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔥</div>
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
            Loading Dad Aura...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 max-w-md">
          <div className="text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchAuraData}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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
    <main className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Dad Aura 🔥</h1>
          <p className="text-lg opacity-90">
            Real-time dad performance tracking
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Aura Score */}
        <AuraScore total={stats.currentTotal} todayTotal={stats.todayTotal} />

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

        {/* Emoji Guide */}
        <EmojiGuide />
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>Tap the Emoji Guide above to see all supported emojis!</p>
      </footer>
    </main>
  );
}

