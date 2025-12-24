# 🔥 Dad Aura

> A playful, emoji-driven app where my son rates my dad performance in real-time via Apple Watch, updating a live dashboard with aura scores and trends.

![Type](https://img.shields.io/badge/Type-App-blue)
![Status](https://img.shields.io/badge/Status-Active%20Dev-green)
![Stack](https://img.shields.io/badge/Stack-Next.js%2014%20%7C%20Supabase%20%7C%20Vonage-blue)

![Activity Feed](e2e-results/02-activity-feed.png)

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp env.example .env.local
# Edit .env.local with Supabase and Vonage keys

# 3. Run
npm run dev
```

**→ Open http://localhost:3000**

---

<details>
<summary><strong>✨ Features</strong></summary>

- **Real-time aura tracking:** Current score with glowing visualizations (supports negative values!).
- **Dad Flip power:** Reverse your aura score (e.g., -200 → +200), limited by son's settings.
- **Son's control panel:** Son sets the flip limit (0-10 per day) and can change it anytime.
- **Trend analytics:** Performance views for today, 7 days, and 30 days.
- **Apple Watch input:** Son sends emoji + points via SMS for instant feedback.
- **Dynamic UI:** Color and glow changes based on score value.

</details>

<details>
<summary><strong>🎯 How It Works</strong></summary>

**For Son (Aura Giver):**
1. Text dad's phone number from Apple Watch.
2. Send emoji + points (e.g., "🔥 +10" or "💩 -5").
3. Dashboard updates in real-time.

**For Dad (Aura Receiver):**
1. Open dashboard to see current score.
2. Use flip power to reverse negative aura (limited by son!).
3. View trends and activity feed.

</details>

<details>
<summary><strong>⚙️ Environment Variables</strong></summary>

Create `.env.local` from `env.example`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VONAGE_API_KEY` | Vonage (for SMS receiving) |
| `VONAGE_API_SECRET` | Vonage authentication |
| `VONAGE_PHONE_NUMBER` | Your Vonage phone number |

</details>

<details>
<summary><strong>🚢 Deployment</strong></summary>

Recommended: Deploy to Vercel

1. Run `supabase/schema.sql` in Supabase SQL Editor.
2. Build locally: `npm run build`
3. Deploy: `vercel --prod`
4. Configure Vonage webhook to point to `https://your-domain.vercel.app/api/sms-webhook`.

</details>

<details>
<summary><strong>💭 What I Learned</strong></summary>

The tech came together quickly—SMS webhook → Supabase real-time → instant dashboard. But what surprised me: my son controlling how many times I can "flip" negative scores became the most engaging feature. That power asymmetry created negotiation moments that strengthened our relationship more than the scoring itself.

</details>

<details>
<summary><strong>🔮 What's Next</strong></summary>

Working on **AI guardrails that go beyond content filtering**—teaching the system when to say no, when to disagree with dad or child, and how to nurture healthy values in both. Sometimes refusing to change aura points *is* the ethical choice.

</details>

<details>
<summary><strong>📚 Development Notes</strong></summary>

- See `CLAUDE.md` for detailed technical setup and development commands.
- See `Plan.md` for detailed product requirements and architecture decisions.
- See `BUILD_LOG.md` for chronological progress.

</details>

---

**Status:** Active Development | **Purpose:** Personal learning and portfolio project
