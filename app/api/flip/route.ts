import { NextRequest, NextResponse } from 'next/server';
import { performFlip, getFlipStatus } from '@/lib/flip-manager';
import { supabase } from '@/lib/supabase';
import { createRateLimitMiddleware } from '@/lib/rate-limiter';
import type { FlipStatusResponse, FlipResponse } from '@/types/api';

// Rate limit: 30 requests per 15 minutes
const rateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
});

/**
 * GET /api/flip
 * Get flip status (can dad flip today?)
 */
export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = rateLimitMiddleware(request);
  if (rateLimitResult.error) {
    return NextResponse.json(
      { error: rateLimitResult.message },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const status = await getFlipStatus();
    return NextResponse.json<FlipStatusResponse>(status, {
      headers: {
        'X-RateLimit-Remaining': (rateLimitResult.remaining ?? 0).toString(),
      },
    });
  } catch (error) {
    console.error('Error getting flip status:', error);
    return NextResponse.json(
      { error: 'Failed to get flip status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/flip
 * Perform a flip (dad only)
 * Body: { currentTotal: number }
 */
export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = rateLimitMiddleware(request);
  if (rateLimitResult.error) {
    return NextResponse.json(
      { error: rateLimitResult.message },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    let body: any;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Error parsing request JSON:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    const { currentTotal } = body;

    if (typeof currentTotal !== 'number' || isNaN(currentTotal)) {
      return NextResponse.json(
        { error: 'Missing or invalid currentTotal. Must be a number.' },
        { status: 400 }
      );
    }

    // Get current total from database to verify
    const { data: events, error: fetchError } = await supabase
      .from('aura_events')
      .select('points');
    
    if (fetchError) {
      console.error('Error fetching events for flip verification:', fetchError);
      return NextResponse.json(
        { error: 'Failed to verify current total' },
        { status: 500 }
      );
    }

    const actualTotal = events && Array.isArray(events)
      ? events.reduce((sum, e) => {
          const points = typeof e.points === 'number' ? e.points : 0;
          return sum + points;
        }, 0)
      : 0;

    // Allow small discrepancy due to timing
    if (Math.abs(actualTotal - currentTotal) > 10) {
      return NextResponse.json(
        { 
          error: 'Current total mismatch. Please refresh and try again.',
          actualTotal,
        },
        { status: 400 }
      );
    }

    const result = await performFlip(actualTotal);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json<FlipResponse>({
      success: true,
      previousTotal: actualTotal,
      newTotal: result.newTotal!,
      message: `Flip successful! ${actualTotal} → ${result.newTotal}`,
    }, {
      headers: {
        'X-RateLimit-Remaining': (rateLimitResult.remaining ?? 0).toString(),
      },
    });
  } catch (error) {
    console.error('Error performing flip:', error);
    return NextResponse.json(
      { error: 'Failed to perform flip' },
      { status: 500 }
    );
  }
}

