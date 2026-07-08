import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { getBotReply } from "./bot.js";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const PORT = Number(process.env.PORT || 3000);
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "change-this-verify-token";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function sendHtml(res, html) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function sendWhatsAppMessage(to, text) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.log("Bot reply:", text);
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp API error ${response.status}: ${errorText}`);
  }
}

function extractIncomingMessages(body) {
  const messages = [];
  const entries = body.entry || [];

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      for (const message of value.messages || []) {
        if (message.type === "text" && message.text?.body && message.from) {
          messages.push({
            from: message.from,
            text: message.text.body
          });
        }
      }
    }
  }

  return messages;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/webhook") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(challenge || "");
      return;
    }

    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Verification failed");
    return;
  }

  if (req.method === "POST" && url.pathname === "/webhook") {
    try {
      const body = await readRequestBody(req);
      const messages = extractIncomingMessages(body);

      for (const message of messages) {
        const reply = getBotReply(message.text);
        await sendWhatsAppMessage(message.from, reply);
      }

      sendJson(res, 200, { ok: true, processed: messages.length });
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { ok: false, error: "Webhook processing failed" });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/chat") {
    try {
      const body = await readRequestBody(req);
      sendJson(res, 200, { reply: getBotReply(body.message) });
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { error: "Chat failed" });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    sendHtml(res, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Course Chatbot</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f4f6f8; color: #111827; }
    main { max-width: 760px; margin: 0 auto; min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; }
    header { padding: 20px; background: #075e54; color: white; }
    h1 { font-size: 22px; margin: 0 0 6px; }
    p { margin: 0; line-height: 1.4; }
    #messages { padding: 20px; overflow-y: auto; }
    .msg { max-width: 82%; padding: 12px 14px; margin: 0 0 12px; border-radius: 8px; white-space: pre-wrap; line-height: 1.45; }
    .student { margin-left: auto; background: #dcf8c6; }
    .bot { background: white; border: 1px solid #e5e7eb; }
    form { display: flex; gap: 8px; padding: 14px; background: white; border-top: 1px solid #e5e7eb; }
    input { flex: 1; font-size: 16px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; }
    button { background: #128c7e; color: white; border: 0; border-radius: 6px; padding: 0 18px; font-size: 16px; cursor: pointer; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>AI Course Chatbot</h1>
      <p>Type student questions here to test the WhatsApp replies.</p>
    </header>
    <section id="messages"></section>
    <form id="chatForm">
      <input id="message" placeholder="Example: Fee kitni hai?" autocomplete="off">
      <button>Send</button>
    </form>
  </main>
  <script>
    const messages = document.querySelector("#messages");
    const form = document.querySelector("#chatForm");
    const input = document.querySelector("#message");

    function addMessage(text, className) {
      const div = document.createElement("div");
      div.className = "msg " + className;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    addMessage("وعلیکم السلام! 😊\\n\\nWelcome to the Complete Practical AI Training Program.\\n\\nAsk me about fee, timing, registration, payment, topics, or recordings.", "bot");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = input.value.trim();
      if (!message) return;
      input.value = "";
      addMessage(message, "student");
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      addMessage(data.reply || "Sorry, reply failed.", "bot");
    });
  </script>
</body>
</html>`);
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`AI course WhatsApp chatbot is running on port ${PORT}`);
});
