import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-initialize the Supabase client to avoid build-time crashes
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim().length === 0) {
    throw new Error(
      'Missing or invalid NEXT_PUBLIC_SUPABASE_URL environment variable. Please set a valid Supabase URL.'
    );
  }

  if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim().length === 0) {
    throw new Error(
      'Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please set a valid Supabase anon key.'
    );
  }

  try {
    supabaseClient = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    return supabaseClient;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(
      `Failed to create Supabase client: ${errorMessage}. Please check your Supabase configuration.`
    );
  }
}

// Export a proxy that lazily initializes the client on first use
// This prevents build-time crashes when env vars aren't set
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

