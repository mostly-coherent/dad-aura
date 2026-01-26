import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSMS } from '@/lib/emoji-parser';
import { createRateLimitMiddleware } from '@/lib/rate-limiter';

// Use Edge runtime for faster cold starts on webhooks
export const runtime = 'edge';

// Rate limit: 50 SMS per 15 minutes (SMS is less frequent)
const rateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50,
});

/**
 * POST /api/sms-webhook
 * Vonage webhook handler for incoming SMS messages
 * 
 * Vonage sends POST requests with JSON data:
 * - text: The text of the message
 * - msisdn: The phone number that sent the message (sender)
 * - to: Your Vonage virtual number
 * - messageId: Unique message identifier
 * 
 * Vonage Webhook Docs: https://developer.vonage.com/en/messaging/sms/guides/inbound-sms
 */
export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = rateLimitMiddleware(request);
  if (rateLimitResult.error) {
    // Still return 200 to Vonage to acknowledge receipt, but log the rate limit
    console.warn('Rate limit exceeded for SMS webhook');
    return NextResponse.json(
      { 
        status: 'rate_limited',
        message: 'Too many requests. Please try again later.',
      },
      { status: 200 } // Vonage expects 200 OK
    );
  }

  try {
    // Vonage sends JSON by default
    let body: any;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Error parsing Vonage webhook JSON:', jsonError);
      // Always return 200 to Vonage even on parse errors
      return NextResponse.json(
        { status: 'error', message: 'Invalid JSON payload' },
        { status: 200 }
      );
    }
    
    // Validate Vonage payload structure
    if (!body || typeof body !== 'object') {
      console.error('Invalid Vonage payload structure:', body);
      return NextResponse.json(
        { status: 'error', message: 'Invalid payload structure' },
        { status: 200 }
      );
    }
    
    // Vonage inbound SMS fields
    const messageBody = body.text as string;
    const fromNumber = body.msisdn as string;
    const toNumber = body.to as string;
    const messageId = body.messageId as string;
    
    console.log('Received SMS from Vonage:', { 
      messageId,
      from: fromNumber, 
      to: toNumber,
      body: messageBody 
    });
    
    if (!messageBody) {
      console.log('No message body received');
      // Vonage expects 200 OK to acknowledge receipt
      return NextResponse.json(
        { status: 'error', message: 'No message body received' },
        { status: 200 }
      );
    }
    
    // Parse the SMS message to extract emoji and points
    const parsed = parseSMS(messageBody);
    
    if (!parsed) {
      console.log('Failed to parse SMS:', messageBody);
      // Acknowledge receipt but note parsing failure
      // To send a reply, you'd use Vonage Messages API separately
      return NextResponse.json({
        status: 'parse_error',
        message: 'Could not parse aura update',
        hint: 'Try: "🔥 +10" or "💩 -5"'
      });
    }
    
    // Store the aura event in the database
    const { data, error } = await supabase
      .from('aura_events')
      .insert([
        {
          emoji: parsed.emoji,
          points: parsed.points,
          source: 'sms',
          note: parsed.note || null,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error storing aura event:', error);
      return NextResponse.json(
        { status: 'error', message: 'Error saving aura update' },
        { status: 200 } // Still 200 to acknowledge receipt
      );
    }
    
    console.log('Aura event created:', data);
    
    // Calculate new total (optional - don't fail if this fails)
    let currentTotal = 0;
    try {
      const { data: allEvents } = await supabase
        .from('aura_events')
        .select('points');
      
      if (allEvents && Array.isArray(allEvents)) {
        currentTotal = allEvents.reduce((sum, e) => {
          const points = typeof e.points === 'number' ? e.points : 0;
          return sum + points;
        }, 0);
      }
    } catch (totalError) {
      console.error('Error calculating total (non-critical):', totalError);
      // Continue without total - don't fail the webhook
    }
    
    // Return success response
    // Note: Vonage inbound webhooks don't support inline replies
    // To send an SMS reply, use the Vonage Messages API separately
    return NextResponse.json({
      status: 'success',
      event: {
        emoji: parsed.emoji,
        points: parsed.points,
        note: parsed.note,
      },
      currentTotal,
      message: `${parsed.emoji} ${parsed.points > 0 ? '+' : ''}${parsed.points} recorded! Dad's aura: ${currentTotal}`
    });
    
  } catch (error) {
    console.error('Unexpected error in SMS webhook:', error);
    // Always return 200 to Vonage to prevent retries
    return NextResponse.json(
      { status: 'error', message: 'Error processing aura update' },
      { status: 200 }
    );
  }
}

/**
 * GET /api/sms-webhook
 * Health check endpoint (also used by Vonage for webhook validation)
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'SMS webhook is ready (Vonage)',
    timestamp: new Date().toISOString(),
  });
}
