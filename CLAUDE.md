# Dad_Aura - AI Assistant Context

> **Purpose:** Technical context for AI coding assistants
> - Development commands and paths
> - Project structure and dependencies
> - Environment setup and troubleshooting
> - NOT for human readers (see README.md)

## 🚨 CRITICAL: GitHub Safety

**This project syncs to personal GitHub only.**

Git remote: Check with `git remote -v`
Git author: Check with `git config user.email`

**Vercel:** DO NOT push/deploy unless explicitly requested (git push = auto-deploy)

## Project Type

Next.js 14+ web app with TypeScript, Tailwind CSS, Supabase backend, and Vonage SMS integration

*Follows root CLAUDE.md Core Web defaults. No AI/LLM features currently.*

## Key Commands

### Development
```bash
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
dad-aura/
├── app/
│   ├── api/
│   │   ├── aura/route.ts          # GET aura events, POST new event
│   │   ├── flip/route.ts          # Dad flip functionality
│   │   ├── flip-config/route.ts   # Flip configuration
│   │   └── sms-webhook/route.ts   # Vonage SMS webhook handler
│   ├── layout.tsx                  # Root layout with providers
│   ├── page.tsx                    # Main dashboard
│   └── globals.css                 # Tailwind imports
├── components/
│   ├── AuraScore.tsx               # Large current score display
│   ├── AuraTrends.tsx              # Chart components (today, 7d, 30d)
│   ├── ActivityFeed.tsx            # Recent aura events list
│   ├── DadFlipButton.tsx           # Flip the score button
│   ├── FlipConfigPanel.tsx         # Flip settings
│   └── ui/                         # Reusable UI components
├── lib/
│   ├── supabase.ts                 # Supabase client setup
│   ├── aura-calculator.ts          # Compute totals and trends
│   ├── emoji-parser.ts             # Parse SMS text for emoji + points
│   └── flip-manager.ts             # Flip logic
├── types/
│   └── aura.ts                     # App-specific types
├── supabase/
│   └── schema.sql                  # Database schema
├── public/
│   └── favicon.svg                 # App icon
├── .env.local                      # Local environment variables
├── env.example                     # Template for env vars
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

# Vonage (for SMS receiving)
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_api_secret
VONAGE_PHONE_NUMBER=+1234567890

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

### 4. Vonage Webhook (`app/api/sms-webhook/route.ts`)

Receives POST requests from Vonage when SMS arrives:
- Vonage sends JSON: `{ text, msisdn, to, messageId }`
- Parse emoji + points from `text` field
- Store in Supabase
- Return JSON response (200 OK to acknowledge)

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
- Vonage setup:
  1. Create account at https://dashboard.nexmo.com
  2. Buy a virtual number
  3. Configure inbound SMS webhook URL: `https://your-domain.vercel.app/api/sms-webhook`
  4. Set HTTP POST method with JSON format
- For local SMS testing, use ngrok to expose localhost:
  ```bash
  ngrok http 3000
  # Use ngrok URL for Vonage webhook during development
  ```

## Testing

### Manual SMS Testing
Send test messages to your Vonage number:
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

# Test Vonage webhook locally
curl -X POST http://localhost:3000/api/sms-webhook \
  -H "Content-Type: application/json" \
  -d '{"text":"🔥 +10","msisdn":"15551234567","to":"15559876543","messageId":"test123"}'
```

## Troubleshooting

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is not paused
- Ensure RLS policies allow anonymous access (or disable for MVP)

### Vonage Webhook Not Receiving
- Verify webhook URL is correct in Vonage dashboard
- Check webhook is set to HTTP POST with JSON format
- Use ngrok for local testing
- Check Vonage logs for delivery failures (Dashboard → Logs)

### Real-Time Updates Not Working
- Ensure Supabase real-time is enabled for `aura_events` table
- Check browser console for WebSocket connection errors
- Verify Supabase project has real-time enabled

## Deployment Checklist

1. Build locally: `npm run build` (fix any errors)
2. Create Supabase project and run schema.sql
3. Configure environment variables in Vercel
4. Deploy to Vercel: `vercel --prod`
5. Update Vonage webhook URL to production domain
6. Test end-to-end with real SMS

---

**Last Updated:** 2025-12-12
