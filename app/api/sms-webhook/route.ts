import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSMS } from '@/lib/emoji-parser';

/**
 * POST /api/sms-webhook
 * Twilio webhook handler for incoming SMS messages
 * 
 * Twilio sends POST requests with form-encoded data:
 * - Body: The text of the message
 * - From: The phone number that sent the message
 * - To: Your Twilio phone number
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const messageBody = formData.get('Body') as string;
    const fromNumber = formData.get('From') as string;
    
    console.log('Received SMS:', { from: fromNumber, body: messageBody });
    
    if (!messageBody) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No message body received</Message></Response>',
        {
          status: 400,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }
    
    // Parse the SMS message to extract emoji and points
    const parsed = parseSMS(messageBody);
    
    if (!parsed) {
      console.log('Failed to parse SMS:', messageBody);
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Could not parse aura update. Try: "🔥 +10" or "💩 -5"</Message></Response>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
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
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error saving aura update</Message></Response>',
        {
          status: 500,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }
    
    console.log('Aura event created:', data);
    
    // Calculate new total (optional - could query from DB)
    const { data: allEvents } = await supabase
      .from('aura_events')
      .select('points');
    
    const currentTotal = allEvents?.reduce((sum, e) => sum + e.points, 0) || 0;
    
    // Send TwiML response to confirm
    const responseMessage = `${parsed.emoji} ${parsed.points > 0 ? '+' : ''}${parsed.points} recorded! Dad's aura: ${currentTotal}`;
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${responseMessage}</Message></Response>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  } catch (error) {
    console.error('Unexpected error in SMS webhook:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error processing aura update</Message></Response>',
      {
        status: 500,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  }
}

/**
 * GET /api/sms-webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'SMS webhook is ready',
    timestamp: new Date().toISOString(),
  });
}

