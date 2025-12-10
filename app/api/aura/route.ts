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
    const limit = searchParams.get('limit') || '100';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    let query = supabase
      .from('aura_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit, 10));
    
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
    const body = await request.json();
    const { emoji, points, source, note } = body;
    
    // Validate required fields
    if (!emoji || typeof points !== 'number' || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: emoji, points, source' },
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
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing event ID' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('aura_events')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting aura event:', error);
      return NextResponse.json(
        { error: 'Failed to delete aura event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Aura event deleted successfully' });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/aura:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

