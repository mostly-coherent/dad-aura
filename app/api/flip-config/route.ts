import { NextRequest, NextResponse } from 'next/server';
import { getFlipConfig, updateFlipConfig } from '@/lib/flip-manager';

/**
 * GET /api/flip-config
 * Get the flip configuration
 */
export async function GET() {
  try {
    const config = await getFlipConfig();
    
    if (!config) {
      return NextResponse.json(
        { error: 'Failed to fetch flip configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error getting flip config:', error);
    return NextResponse.json(
      { error: 'Failed to get flip configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/flip-config
 * Update the flip configuration (son only)
 * Body: { maxFlipsPerDay: number }
 */
export async function PUT(request: NextRequest) {
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
    
    const { maxFlipsPerDay } = body;

    if (typeof maxFlipsPerDay !== 'number' || isNaN(maxFlipsPerDay)) {
      return NextResponse.json(
        { error: 'Missing or invalid maxFlipsPerDay. Must be a number.' },
        { status: 400 }
      );
    }
    
    if (maxFlipsPerDay < 0 || maxFlipsPerDay > 10 || !Number.isInteger(maxFlipsPerDay)) {
      return NextResponse.json(
        { error: 'Invalid maxFlipsPerDay. Must be an integer between 0 and 10.' },
        { status: 400 }
      );
    }

    const success = await updateFlipConfig(maxFlipsPerDay);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update flip configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      maxFlipsPerDay,
      message: `Flip limit updated to ${maxFlipsPerDay} per day`,
    });
  } catch (error) {
    console.error('Error updating flip config:', error);
    return NextResponse.json(
      { error: 'Failed to update flip configuration' },
      { status: 500 }
    );
  }
}

