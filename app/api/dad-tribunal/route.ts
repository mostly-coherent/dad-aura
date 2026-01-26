import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createRateLimitMiddleware } from '@/lib/rate-limiter';

// Allow responses up to 60 seconds (need time for both LLM calls)
export const maxDuration = 60;

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

const SAFETY_CHECK_PROMPT = `You are a content safety checker for a family app used by young teenagers (ages 10-15).

Your job is to review AI-generated content and ensure it is:
1. Age-appropriate for young teenagers
2. Free from inappropriate language, violence, or adult themes
3. Free from content that could be harmful, scary, or disturbing
4. Positive and constructive even when giving negative feedback
5. Free from any references that a young teen shouldn't see

Review the following content that will be shown to a young teenager:

---
{CONTENT}
---

Respond with ONLY a JSON object in this exact format:
{
  "safe": true/false,
  "reason": "Brief explanation if not safe, or 'Content is appropriate' if safe",
  "sanitized": "If not safe, provide a sanitized version of the content. If safe, leave as null"
}`;

// Safety check using Anthropic Claude
async function checkSafety(content: string): Promise<{
  safe: boolean;
  reason: string;
  sanitized: string | null;
}> {
  try {
    const result = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      prompt: SAFETY_CHECK_PROMPT.replace('{CONTENT}', content),
      maxTokens: 500,
    });

    // Parse the safety check response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        safe: parsed.safe === true,
        reason: parsed.reason || 'Unknown',
        sanitized: parsed.sanitized || null,
      };
    }

    // Default to safe if parsing fails
    return { safe: true, reason: 'Parse error - defaulting to safe', sanitized: null };
  } catch (error) {
    console.error('Safety check error:', error);
    // Default to safe if safety check fails (don't block the app)
    return { safe: true, reason: 'Safety check unavailable', sanitized: null };
  }
}

// Rate limit: 20 requests per 15 minutes (more restrictive for AI endpoints)
const rateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
});

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = rateLimitMiddleware(request);
  if (rateLimitResult.error) {
    return NextResponse.json(
      { 
        error: rateLimitResult.message,
        resetTime: rateLimitResult.resetTime,
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
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
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // useChat sends { messages: [...] }, extract the last user message
    const messages = body.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the last user message
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();
    if (!lastUserMessage || !lastUserMessage.content) {
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userContent = lastUserMessage.content;
    
    // Validate user content
    if (typeof userContent !== 'string' || userContent.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'User message content is required and must be non-empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate content length (prevent abuse)
    if (userContent.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message content too long. Maximum 2000 characters.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Generate verdict with OpenAI GPT-4o
    console.log('Generating verdict with OpenAI...');
    let tribunalResult;
    try {
      tribunalResult = await generateText({
        model: openai('gpt-4o'),
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `My son says: "${userContent}"\n\nPlease evaluate this dad behavior and respond with your verdict in the required JSON format.`,
          },
        ],
        maxTokens: 500,
      });
    } catch (openaiError) {
      console.error('Error generating verdict with OpenAI:', openaiError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate verdict. Please try again later.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const verdictText = tribunalResult.text;
    console.log('Verdict generated:', verdictText.substring(0, 100) + '...');

    // Step 2: Safety check with Anthropic Claude
    console.log('Running safety check with Anthropic...');
    const safetyResult = await checkSafety(verdictText);
    console.log('Safety check result:', safetyResult);

    // Step 3: Return the verdict (sanitized if needed)
    let finalContent = verdictText;
    let safetyNote = '';

    if (!safetyResult.safe) {
      console.log('Content flagged as unsafe, using sanitized version');
      if (safetyResult.sanitized) {
        finalContent = safetyResult.sanitized;
        safetyNote = '\n\n🛡️ [This response was reviewed for safety]';
      } else {
        // If no sanitized version, provide a generic safe response
        finalContent = JSON.stringify({
          points: 0,
          emoji: '🤔',
          verdict: 'The Tribunal Needs More Information',
          explanation: 'The Tribunal couldn\'t process this request properly. Please try describing what Dad did in a different way.',
          dadJoke: null,
          memeReference: null,
        });
        safetyNote = '\n\n🛡️ [Response regenerated for safety]';
      }
    }

    // Return as a simple text response (useChat will handle it)
    // We need to format it for useChat's expected format
    return new Response(finalContent + safetyNote, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain',
        'X-RateLimit-Remaining': (rateLimitResult.remaining ?? 0).toString(),
        'X-RateLimit-Reset': (rateLimitResult.resetTime ?? Date.now()).toString(),
      },
    });
    
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
    let body: any;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Error parsing request JSON:', jsonError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { points, emoji, verdict, explanation, dadJoke, memeReference } = body;

    // Validate required fields
    if (typeof points !== 'number' || isNaN(points)) {
      return new Response(
        JSON.stringify({ error: 'Invalid points. Must be a number.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate points range
    if (points < -50 || points > 50) {
      return new Response(
        JSON.stringify({ error: 'Points must be between -50 and 50' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!emoji || typeof emoji !== 'string' || emoji.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid emoji. Must be a non-empty string.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!verdict || typeof verdict !== 'string' || verdict.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid verdict. Must be a non-empty string.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate optional fields
    if (explanation && (typeof explanation !== 'string' || explanation.length > 1000)) {
      return new Response(
        JSON.stringify({ error: 'Explanation must be a string with max 1000 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (dadJoke && (typeof dadJoke !== 'string' || dadJoke.length > 500)) {
      return new Response(
        JSON.stringify({ error: 'Dad joke must be a string with max 500 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (memeReference && (typeof memeReference !== 'string' || memeReference.length > 500)) {
      return new Response(
        JSON.stringify({ error: 'Meme reference must be a string with max 500 characters' }),
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
    // Note: Using 'web' as source since database constraint limits values
    // The note field contains "THE DAD TRIBUNAL" to identify tribunal verdicts
    const { data, error } = await supabase
      .from('aura_events')
      .insert([
        {
          emoji,
          points,
          source: 'web',
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

    // Get updated total (optional - don't fail if this fails)
    let currentTotal = 0;
    try {
      const { data: allEvents, error: totalError } = await supabase
        .from('aura_events')
        .select('points');
      
      if (totalError) {
        console.error('Error fetching total (non-critical):', totalError);
      } else if (allEvents && Array.isArray(allEvents)) {
        currentTotal = allEvents.reduce((sum, e) => {
          const points = typeof e.points === 'number' ? e.points : 0;
          return sum + points;
        }, 0);
      }
    } catch (totalError) {
      console.error('Error calculating total (non-critical):', totalError);
      // Continue without total - don't fail the request
    }

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
