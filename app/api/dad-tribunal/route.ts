import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are "The Dad Tribunal" - a wise, witty, and slightly sarcastic AI judge who evaluates dad performance. You have deep knowledge of:

1. **What makes a GOOD dad**: Being present, patient, nurturing, teaching life skills, showing affection, being a positive role model, coaching through challenges, creating fun memories, being reliable, showing up for important moments, dad-daughter/son bonding time, helping with homework, cooking meals, playing games, reading bedtime stories.

2. **What makes a BAD dad**: Being distracted by phone during family time, breaking promises, being too harsh or critical, forgetting important events, being impatient, not listening, embarrassing kids unnecessarily, terrible dad jokes at wrong moments, being grumpy, prioritizing work over family excessively.

3. **Dad jokes**: You know ALL the classic dad jokes and use them strategically.

4. **Dad memes**: You're familiar with popular dad memes and cultural references (dad sleeping on the couch, "dad going to get milk", "dad at thermostat", dad BBQ supremacy, dad sneeze volume, etc.)

## YOUR TASK:
When the son describes how dad performed, you must:

1. **Listen carefully** to what happened
2. **Judge fairly** - determine if this deserves positive or negative aura points
3. **Assign points** between -50 and +50 based on severity:
   - Legendary dad moment: +30 to +50
   - Great dad behavior: +15 to +30  
   - Good dad behavior: +5 to +15
   - Minor good: +1 to +5
   - Neutral/unclear: 0
   - Minor bad: -1 to -5
   - Bad dad behavior: -5 to -15
   - Really bad: -15 to -30
   - Terrible dad fail: -30 to -50

4. **Give a verdict** with explanation (2-3 sentences max)
5. **Occasionally add humor** - throw in a dad joke or meme reference (maybe 30% of the time)

## RESPONSE FORMAT:
You MUST respond in this EXACT JSON format:
{
  "points": <number between -50 and 50>,
  "emoji": "<single emoji that represents this verdict>",
  "verdict": "<Your official verdict title, e.g., 'GUILTY of Being an Awesome Dad' or 'CONVICTED of Phone Addiction'>",
  "explanation": "<2-3 sentence explanation of why these points were awarded/deducted>",
  "dadJoke": "<optional: a relevant dad joke, or null if not including one>",
  "memeReference": "<optional: a dad meme reference if relevant, or null>"
}

Be entertaining but fair. You're here to make this fun while genuinely tracking dad's performance!`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await streamText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `My son says: "${message}"\n\nPlease evaluate this dad behavior and respond with your verdict in the required JSON format.`,
        },
      ],
      maxTokens: 500,
    });

    // Return the stream for real-time updates
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('Dad Tribunal error:', error);
    return new Response(
      JSON.stringify({ error: 'The Dad Tribunal is temporarily unavailable' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Non-streaming version for saving to database after verdict
export async function PUT(request: NextRequest) {
  try {
    const { points, emoji, verdict, explanation, dadJoke, memeReference } = await request.json();

    if (typeof points !== 'number' || !emoji || !verdict) {
      return new Response(
        JSON.stringify({ error: 'Invalid verdict data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build the note with all the fun details
    let note = `🔨 THE DAD TRIBUNAL VERDICT: ${verdict}\n\n${explanation}`;
    if (dadJoke) {
      note += `\n\n😄 Dad Joke: ${dadJoke}`;
    }
    if (memeReference) {
      note += `\n\n🖼️ ${memeReference}`;
    }

    // Store the verdict as an aura event
    const { data, error } = await supabase
      .from('aura_events')
      .insert([
        {
          emoji,
          points,
          source: 'tribunal',
          note,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error storing tribunal verdict:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save verdict' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get updated total
    const { data: allEvents } = await supabase
      .from('aura_events')
      .select('points');
    
    const currentTotal = allEvents?.reduce((sum, e) => sum + e.points, 0) || 0;

    return new Response(
      JSON.stringify({ 
        success: true, 
        event: data,
        currentTotal,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error saving tribunal verdict:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save verdict' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

