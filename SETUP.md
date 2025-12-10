# Dad Aura - Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Twilio account (optional for SMS, free trial available)

## Step 1: Supabase Setup

1. Go to https://supabase.com and create a new project
2. Wait for the project to finish setting up
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
4. Go to **Settings > API** and copy:
   - Project URL
   - Anon/Public key

## Step 2: Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Run the App

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 4: Test Manually (Without SMS)

You can test the app by manually adding aura events via the API:

```bash
# Add a positive aura event
curl -X POST http://localhost:3000/api/aura \
  -H "Content-Type: application/json" \
  -d '{"emoji":"🔥","points":10,"source":"web","note":"Test event"}'

# Add a negative aura event
curl -X POST http://localhost:3000/api/aura \
  -H "Content-Type: application/json" \
  -d '{"emoji":"💩","points":-5,"source":"web"}'
```

The dashboard should update in real-time!

## Step 5: Twilio Setup (Optional - for SMS)

1. Go to https://console.twilio.com and sign up
2. Get a phone number (free trial includes one)
3. Add Twilio credentials to `.env.local`:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

4. For local testing, use ngrok to expose your localhost:

```bash
ngrok http 3000
```

5. In Twilio console, configure your phone number's webhook:
   - Webhook URL: `https://your-ngrok-url.ngrok.io/api/sms-webhook`
   - Method: HTTP POST

6. Send a test SMS to your Twilio number:
   - "🔥 +10"
   - "💩 -5"
   - "🎉 +15 Great job dad!"

## Step 6: Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com (use personal account)
3. Import the repository
4. Add environment variables in Vercel dashboard
5. Deploy!
6. Update Twilio webhook URL to your Vercel domain

## Troubleshooting

### Dashboard shows "Failed to load aura data"
- Check Supabase URL and key in `.env.local`
- Verify schema was created in Supabase SQL Editor
- Check browser console for errors

### SMS not working
- Verify Twilio credentials
- Check webhook URL is correct
- Use ngrok for local testing
- Check Twilio logs for delivery issues

### Real-time updates not working
- Ensure Supabase Realtime is enabled for `aura_events` table
- Check browser console for WebSocket errors
- Verify RLS policies allow access

## Next Steps

- Customize emoji presets in `lib/emoji-parser.ts`
- Add authentication (optional)
- Create Apple Shortcuts for watch input
- Add push notifications
- Customize UI colors and animations

---

**Need Help?** Check `CLAUDE.md` for technical details or `Plan.md` for feature roadmap.

