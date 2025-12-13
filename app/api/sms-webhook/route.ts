import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSMS } from '@/lib/emoji-parser';

// Use Edge runtime for faster cold starts on webhooks
export const runtime = 'edge';

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
  try {
    // Vonage sends JSON by default
    const body = await request.json();
    
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
    
    // Calculate new total
    const { data: allEvents } = await supabase
      .from('aura_events')
      .select('points');
    
    const currentTotal = allEvents?.reduce((sum, e) => sum + e.points, 0) || 0;
    
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
