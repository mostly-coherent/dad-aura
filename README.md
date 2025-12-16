# Dad_Aura 🔥

![Type](https://img.shields.io/badge/Type-Web%20App-blue)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20TypeScript%20%7C%20Supabase%20%7C%20Tailwind-blue)

A playful, emoji-driven app where my son rates my dad performance in real-time using "aura points" from his Apple Watch. Track trends, celebrate wins, and learn from fails—all through the power of emoji.

## Features

- **🎯 Real-Time Aura Tracking:** Current aura score with beautiful visualizations (supports negative values!)
- **🔄 Dad Flip Power:** Dad can reverse his aura score (e.g., -200 → +200), but son controls how many flips per day!
- **⚙️ Son's Control Panel:** Son sets the flip limit (0-10 per day) and can change it anytime
- **📊 Trend Analytics:** See how you're doing today, this week, and this month
- **⌚ Apple Watch Input:** Son sends emoji + points via SMS/iMessage for instant feedback
- **😎 Emoji-Driven:** Every interaction is playful and expressive with preset emoji → point mappings
- **🌈 Dynamic UI:** Aura visualization changes color and glow based on your performance
- **📱 Mobile-First:** Responsive design optimized for dad's phone

## Quick Start

### 1. Install dependencies

```bash
cd /Users/jmbeh/Personal Builder Lab/Dad_Aura
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with:
- Supabase project URL and anon key
- Twilio credentials (for SMS receiving)

### 3. Set up Supabase

Run the schema migration in `supabase/schema.sql` to create the aura_events table.

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## How It Works

### For Son (Aura Giver)
1. Text dad's phone number from Apple Watch
2. Send emoji + points (e.g., "🔥 +10" or "💩 -5")
3. App automatically parses and records the aura event
4. Dad's dashboard updates in real-time

### For Dad (Aura Receiver)
1. Open dashboard to see current aura score
2. Use flip power to reverse negative aura (limited by son!)
3. View trends: today, 7 days, 30 days
4. Check activity feed to see what earned/lost points
5. Learn, improve, and become a legendary dad 🎯

## Emoji Presets

### Positive Aura (+)
- 🔥 **+10** - Awesome dad moment
- 🎉 **+15** - Epic dad win
- ❤️ **+5** - Love you dad
- 🌟 **+8** - You're shining
- 💪 **+7** - Strong dad energy
- ⚡ **+25** - Legendary move

### Negative Aura (-)
- 💩 **-5** - Mild disappointment
- 😤 **-8** - Annoyed
- 😡 **-10** - Dad fail
- 💔 **-12** - Really hurt
- 👎 **-3** - Not cool

### Special
- 🎯 **+20** - Bullseye, perfect dad moment
- 🤷 **0** - Meh, neutral

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run type-check # TypeScript validation
```

## Environment Variables

- **`NEXT_PUBLIC_SUPABASE_URL`** – Supabase project URL
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** – Supabase anonymous key
- **`TWILIO_ACCOUNT_SID`** – Twilio account identifier
- **`TWILIO_AUTH_TOKEN`** – Twilio authentication token
- **`TWILIO_PHONE_NUMBER`** – Your Twilio phone number for receiving SMS

## Deployment

Deploy to Vercel (personal account):

1. Connect GitHub repo to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy to production
4. Set up Twilio webhook to point to your Vercel domain

## Development

- See `Plan.md` for requirements, design decisions, and roadmap
- See `CLAUDE.md` for technical implementation details and commands
- See `FLIP_FEATURE.md` for detailed flip power documentation
- Database schema in `supabase/schema.sql`

---

## What I Learned

The tech came together quickly—SMS webhook → Supabase real-time → instant dashboard updates. But what surprised me: my son controlling how many times I can "flip" negative scores became the most engaging feature. That power asymmetry created negotiation moments that strengthened our relationship more than the scoring itself.

## What's Next

I'm working on **AI guardrails that go beyond content filtering**—teaching the system when to say no, when to disagree with dad or child, and how to nurture healthy values in both. The tricky part: defining what "right" looks like when parenting decisions aren't black-and-white. Sometimes refusing to change aura points *is* the ethical choice, even when a parent or child asks. Teaching AI to enforce alignment boundaries requires codifying judgment, not just rules.

---

**Status:** Active Development (Constant Work in Progress)  
**Purpose:** Personal project - strengthening dad-son connection through playful tech  
**Aura Goal:** Achieve legendary dad status (500+ points) 🎯
