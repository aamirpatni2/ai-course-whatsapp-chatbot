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

To change course answers, edit:

```text
knowledge-base.js
```

You can update fee, timing, account details, topics, and reply wording there.
