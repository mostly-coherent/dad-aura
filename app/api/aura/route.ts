import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AuraEvent } from '@/types/aura';

/**
 * GET /api/aura
 * Fetch all aura events or filter by date range
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit') || '100';
    const limit = parseInt(limitParam, 10);
    
    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 1000.' },
        { status: 400 }
      );
    }
    
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Validate date format if provided
    if (startDate) {
      const startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start_date format. Use ISO 8601 format.' },
          { status: 400 }
        );
      }
    }
    
    if (endDate) {
      const endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end_date format. Use ISO 8601 format.' },
          { status: 400 }
        );
      }
    }
    
    let query = supabase
      .from('aura_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    // Apply date filters if provided
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching aura events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch aura events' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ events: data as AuraEvent[] });
  } catch (error) {
    console.error('Unexpected error in GET /api/aura:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/aura
 * Create a new aura event
 * Body: { emoji: string, points: number, source: string, note?: string }
 */
export async function POST(request: NextRequest) {
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
    
    const { emoji, points, source, note } = body;
    
    // Validate required fields
    if (!emoji || typeof emoji !== 'string' || emoji.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid emoji field' },
        { status: 400 }
      );
    }
    
    if (typeof points !== 'number' || isNaN(points)) {
      return NextResponse.json(
        { error: 'Missing or invalid points field. Must be a number.' },
        { status: 400 }
      );
    }
    
    // Validate points range
    if (points < -100 || points > 100) {
      return NextResponse.json(
        { error: 'Points must be between -100 and 100' },
        { status: 400 }
      );
    }
    
    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid source field' },
        { status: 400 }
      );
    }
    
    // Validate source
    const validSources = ['sms', 'web', 'watch', 'shortcut'];
    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be one of: sms, web, watch, shortcut' },
        { status: 400 }
      );
    }
    
    // Validate note length if provided
    if (note && (typeof note !== 'string' || note.length > 500)) {
      return NextResponse.json(
        { error: 'Note must be a string with max 500 characters' },
        { status: 400 }
      );
    }
    
    // Insert into database
    const { data, error } = await supabase
      .from('aura_events')
      .insert([
        {
          emoji,
          points,
          source,
          note: note || null,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating aura event:', error);
      return NextResponse.json(
        { error: 'Failed to create aura event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { event: data as AuraEvent, message: 'Aura event created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/aura:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/aura?id=<event_id>
 * Delete an aura event by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid event ID' },
        { status: 400 }
      );
    }
    
    // Validate UUID format (Supabase uses UUIDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id.trim())) {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      );
    }
    
    const { error, data } = await supabase
      .from('aura_events')
      .delete()
      .eq('id', id.trim())
      .select();
    
    if (error) {
      console.error('Error deleting aura event:', error);
      return NextResponse.json(
        { error: 'Failed to delete aura event', details: error.message },
        { status: 500 }
      );
    }
    
    // Check if event was actually deleted
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Aura event deleted successfully' });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/aura:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

