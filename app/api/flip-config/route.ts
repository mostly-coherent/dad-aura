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
    const body = await request.json();
    const { maxFlipsPerDay } = body;

    if (typeof maxFlipsPerDay !== 'number' || maxFlipsPerDay < 0 || maxFlipsPerDay > 10) {
      return NextResponse.json(
        { error: 'Invalid maxFlipsPerDay. Must be between 0 and 10.' },
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

