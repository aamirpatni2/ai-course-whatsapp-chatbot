# AI Course WhatsApp Chatbot

This is a ready starter chatbot for your **Complete Practical AI Training Program - July 2026 Batch**. It replies automatically to common student questions on WhatsApp.

## What It Answers

- Course details
- Fee
- Class timing
- Online or physical class
- Registration method
- Payment details
- Recordings for missed classes
- Course topics
- Beginner suitability
- Admin/human contact requests

## Quick Test

Install Node.js 18 or newer, then open this folder and run:

```bash
npm test
```

To start the bot server:

```bash
npm start
```

The local server will run at:

```text
http://localhost:3000
```

## Connect With WhatsApp

You need Meta WhatsApp Cloud API.

1. Create a Meta Developer app.
2. Add WhatsApp Cloud API.
3. Copy your WhatsApp access token and phone number ID.
4. Copy `.env.example` to `.env`.
5. Add your values:

```text
VERIFY_TOKEN=your-own-secret-text
WHATSAPP_TOKEN=your-whatsapp-token
PHONE_NUMBER_ID=your-phone-number-id
```

6. Put this webhook URL in Meta:

```text
https://your-domain.com/webhook
```

7. Use the same `VERIFY_TOKEN` in Meta webhook verification.

## Important

For real WhatsApp use, this bot must be hosted online with HTTPS. Good options are Render, Railway, VPS, or any Node.js hosting provider.

## Edit Answers

To change default course answers, edit:

```text
knowledge-base.js
```

You can update fee, timing, account details, topics, and reply wording there. These are the
defaults the dashboard content editor starts from.

## Admin Dashboard

Open:

```text
http://localhost:3000/admin
```

Log in with the `ADMIN_PASSWORD` you set in `.env` (defaults to `admin123` locally if unset —
always set a real password before deploying). The dashboard has five tabs:

- **Analytics** — total messages, messages today, unique contacts, unanswered (fallback) rate,
  and the most-asked question categories.
- **Marketing** — live Meta Ads spend, impressions, clicks, CTR, cost per click, leads/results, cost
  per lead, and cost per registered student (ad spend ÷ paid students), with a per-campaign
  breakdown. Requires `META_ACCESS_TOKEN` and `META_AD_ACCOUNT_ID` (see below) — the tab shows
  setup instructions until those are configured.
- **Conversations** — a log of every WhatsApp and web-widget message with the bot's reply and
  matched category.
- **Students** — a simple list of registered students with name, contact, and payment status
  (pending/paid) you can add, toggle, and delete.
- **Course Content** — edit the fee, class days/time, duration, topics, and the bot's reply text
  for fee/timing/payment/registration/recordings/fallback. Changes apply immediately to live bot
  replies.

### Connect Meta Ads (Marketing Tab)

1. In Meta Business Settings, go to **System Users**, create or open one, and click **Generate
   New Token** for the ad account you want to track, with the `ads_read` permission.
2. Find your ad account's numeric ID (in Ads Manager, without the `act_` prefix).
3. Add to `.env` (or your host's environment variables):

```text
META_ACCESS_TOKEN=your-generated-token
META_AD_ACCOUNT_ID=your-ad-account-id
```

4. Restart the server. The Marketing tab pulls live data directly from Meta's Graph API and
   caches it for about 15 minutes to stay within API rate limits — use the **Refresh** button in
   the tab to force an immediate update.

Data (conversations, students, content edits) is stored in `data/db.json`, a plain JSON file —
there's no external database to set up. On hosts with ephemeral disks (e.g. Render's free plan),
this file resets on redeploy, so treat it as working data, not a permanent record.

### Try It With Sample Data

To see the dashboard populated instead of empty, run:

```bash
npm run seed
```

This adds a few example WhatsApp conversations and students to `data/db.json`. Safe to run
against a fresh install; re-running it adds another batch of the same sample entries.
