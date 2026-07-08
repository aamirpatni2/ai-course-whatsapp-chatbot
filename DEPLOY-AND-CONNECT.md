# Deploy And Connect To WhatsApp

Your bot is ready. To make it work with real WhatsApp messages, it must be online with HTTPS. `localhost:3000` only works on your own computer and Meta cannot reach it.

## Step 1: Host The Bot

Use Render, Railway, VPS, or any Node.js host.

For Render:

1. Create a Render account.
2. Create a new Web Service.
3. Upload/connect this chatbot folder.
4. Use:

```text
Build Command: leave empty
Start Command: node server.js
```

5. Add these environment variables:

```text
VERIFY_TOKEN=your-secret-text
WHATSAPP_TOKEN=your-meta-whatsapp-token
PHONE_NUMBER_ID=your-meta-phone-number-id
```

After deploy, Render will give you a public link like:

```text
https://ai-course-whatsapp-chatbot.onrender.com
```

Your webhook callback URL will be:

```text
https://ai-course-whatsapp-chatbot.onrender.com/webhook
```

## Step 2: Get WhatsApp API Details

Go to:

```text
https://developers.facebook.com/apps/
```

Then:

1. Create or open your Meta app.
2. Add WhatsApp product.
3. Open WhatsApp > API Setup.
4. Copy:

```text
WHATSAPP_TOKEN
PHONE_NUMBER_ID
```

The `VERIFY_TOKEN` is your own secret text. Example:

```text
my-ai-course-bot-2026
```

Use exactly the same verify token in Render and Meta webhook setup.

## Step 3: Add Webhook In Meta

In Meta Developer:

1. Open WhatsApp > Configuration.
2. Add Callback URL:

```text
https://your-host-link.com/webhook
```

3. Add Verify Token:

```text
your-secret-text
```

4. Click Verify and Save.
5. Subscribe to WhatsApp messages.

## What I Need From You To Finish Connection

Send these values:

```text
Public bot URL:
VERIFY_TOKEN:
WHATSAPP_TOKEN:
PHONE_NUMBER_ID:
```

Do not send your Facebook password. Only the API values above are needed.
