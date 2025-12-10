# Dad_Aura - AI Assistant Context

> **Purpose:** Technical context for AI coding assistants
> - Development commands and paths
> - Project structure and dependencies
> - Environment setup and troubleshooting
> - NOT for human readers (see README.md)

## Project Type

Next.js 14+ web app with TypeScript, Tailwind CSS, Supabase backend, and Twilio SMS integration

## Key Commands

### Development
```bash
cd /Users/jmbeh/Builder_Lab/Dad_Aura
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript validation
```

### Database
```bash
# Run Supabase locally (optional)
npx supabase start
npx supabase db reset

# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
```

### Deployment
```bash
vercel --prod        # Deploy to Vercel personal account
```

## Project Structure

```
Dad_Aura/
├── app/
│   ├── api/
│   │   ├── aura/route.ts          # GET aura events, POST new event
│   │   └── sms-webhook/route.ts   # Twilio SMS webhook handler
│   ├── layout.tsx                  # Root layout with providers
│   ├── page.tsx                    # Main dashboard
│   └── globals.css                 # Tailwind imports
├── components/
│   ├── AuraScore.tsx               # Large current score display
│   ├── AuraTrends.tsx              # Chart components (today, 7d, 30d)
│   ├── ActivityFeed.tsx            # Recent aura events list
│   ├── EmojiPicker.tsx             # Emoji selection UI (future)
│   └── ui/                         # Reusable UI components
├── lib/
│   ├── supabase.ts                 # Supabase client setup
│   ├── aura-calculator.ts          # Compute totals and trends
│   ├── emoji-parser.ts             # Parse SMS text for emoji + points
│   └── twilio.ts                   # Twilio client setup
├── types/
│   ├── supabase.ts                 # Generated Supabase types
│   └── aura.ts                     # App-specific types
├── supabase/
│   └── schema.sql                  # Database schema
├── public/
│   └── emoji/                      # Emoji assets (if needed)
├── .env.local                      # Local environment variables
├── .env.example                    # Template for env vars
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies
```

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Twilio (for SMS receiving)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Optional: for development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Schema

### `aura_events` table

```sql
CREATE TABLE aura_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  emoji TEXT NOT NULL,
  points INTEGER NOT NULL,
  note TEXT,
  source TEXT NOT NULL CHECK (source IN ('sms', 'web', 'watch', 'shortcut')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_aura_events_timestamp ON aura_events(timestamp DESC);
```

## Key Features Implementation

### 1. SMS Parsing (`lib/emoji-parser.ts`)

Parses incoming SMS messages to extract emoji and points:
- Regex pattern: `/([+-]?\d+)\s*([^\d\s]+)/g`
- Examples:
  - "🔥 +10" → { emoji: '🔥', points: 10 }
  - "-5 💩" → { emoji: '💩', points: -5 }
  - "🎉" → { emoji: '🎉', points: 15 } (uses preset)

### 2. Aura Calculation (`lib/aura-calculator.ts`)

- **Current Total:** SUM(points) from all events
- **Today:** SUM(points) WHERE DATE(timestamp) = TODAY
- **7-Day Trend:** Daily totals for last 7 days
- **30-Day Trend:** Daily totals for last 30 days

### 3. Real-Time Updates

Use Supabase real-time subscriptions to update dashboard when new aura events arrive:

```typescript
supabase
  .channel('aura_events')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'aura_events' }, 
    (payload) => {
      // Update UI with new event
    }
  )
  .subscribe()
```

### 4. Twilio Webhook (`app/api/sms-webhook/route.ts`)

Receives POST requests from Twilio when SMS arrives:
- Extract message body and sender
- Parse emoji + points
- Store in Supabase
- Return TwiML response (optional)

## Emoji Presets

Hardcoded in `lib/emoji-parser.ts`:

```typescript
const EMOJI_PRESETS = {
  '🔥': 10,
  '🎉': 15,
  '❤️': 5,
  '🌟': 8,
  '💪': 7,
  '👍': 3,
  '⚡': 25,
  '🎯': 20,
  '💩': -5,
  '😤': -8,
  '👎': -3,
  '😡': -10,
  '🙄': -4,
  '💔': -12,
  '🤷': 0,
};
```

## UI/UX Notes

### Aura Score Display
- Large, centered number with glow effect
- Color gradient based on value:
  - > 50: Gold/yellow glow
  - 0-50: Blue/green glow
  - -50-0: Orange glow
  - < -50: Red glow
- Animated transitions when value changes

### Trend Charts
- Use Recharts or Chart.js
- Line chart for 7-day and 30-day trends
- Bar chart for today's hourly breakdown
- Emoji markers on data points

### Activity Feed
- Reverse chronological order
- Each item shows: emoji, points, timestamp, optional note
- Color-coded: green for positive, red for negative
- Smooth scroll animations

## Development Notes

- Server runs on `http://localhost:3000`
- Supabase project: Create at https://supabase.com
- Twilio setup:
  1. Buy phone number at https://console.twilio.com
  2. Configure webhook URL: `https://your-domain.vercel.app/api/sms-webhook`
  3. Set HTTP POST method
- For local SMS testing, use ngrok to expose localhost:
  ```bash
  ngrok http 3000
  # Use ngrok URL for Twilio webhook during development
  ```

## Testing

### Manual SMS Testing
Send test messages to Twilio number:
- "🔥 +10"
- "-5 💩"
- "🎉 +15 Great job dad!"

### API Testing
```bash
# Add aura event via API
curl -X POST http://localhost:3000/api/aura \
  -H "Content-Type: application/json" \
  -d '{"emoji":"🔥","points":10,"source":"web"}'

# Get all aura events
curl http://localhost:3000/api/aura
```

## Troubleshooting

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is not paused
- Ensure RLS policies allow anonymous access (or disable for MVP)

### Twilio Webhook Not Receiving
- Verify webhook URL is correct in Twilio console
- Check webhook is set to HTTP POST
- Use ngrok for local testing
- Check Twilio logs for delivery failures

### Real-Time Updates Not Working
- Ensure Supabase real-time is enabled for `aura_events` table
- Check browser console for WebSocket connection errors
- Verify Supabase project has real-time enabled

## Deployment Checklist

1. Build locally: `npm run build` (fix any errors)
2. Create Supabase project and run schema.sql
3. Configure environment variables in Vercel
4. Deploy to Vercel: `vercel --prod`
5. Update Twilio webhook URL to production domain
6. Test end-to-end with real SMS

---

**Last Updated:** 2025-12-10
