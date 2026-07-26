import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getBotReplyDetailed } from "./bot.js";
import {
  addConversation,
  listConversations,
  listStudents,
  addStudent,
  updateStudent,
  deleteStudent
} from "./data/store.js";
import { getEditableContent, updateContent } from "./knowledge-base.js";
import { renderAdminPage } from "./admin-page.js";

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
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

if (!process.env.ADMIN_PASSWORD) {
  console.warn(
    "Warning: ADMIN_PASSWORD is not set. Using default 'admin123'. Set ADMIN_PASSWORD before deploying."
  );
}

const activeSessions = new Set();

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    cookies[trimmed.slice(0, index)] = decodeURIComponent(trimmed.slice(index + 1));
  }
  return cookies;
}

function isAuthed(req) {
  const cookies = parseCookies(req);
  return Boolean(cookies.admin_session && activeSessions.has(cookies.admin_session));
}

function requireAuth(req, res) {
  if (isAuthed(req)) {
    return true;
  }
  sendJson(res, 401, { error: "Unauthorized" });
  return false;
}

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
        const { reply, category } = getBotReplyDetailed(message.text);
        await sendWhatsAppMessage(message.from, reply);
        addConversation({
          from: message.from,
          channel: "whatsapp",
          text: message.text,
          reply,
          category
        });
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
      const { reply, category } = getBotReplyDetailed(body.message);
      addConversation({
        from: "web-widget",
        channel: "web",
        text: body.message,
        reply,
        category
      });
      sendJson(res, 200, { reply });
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

  if (req.method === "GET" && url.pathname === "/admin") {
    sendHtml(res, renderAdminPage());
    return;
  }

  if (req.method === "POST" && url.pathname === "/admin/login") {
    try {
      const body = await readRequestBody(req);
      if (body.password !== ADMIN_PASSWORD) {
        sendJson(res, 401, { error: "Invalid password" });
        return;
      }
      const token = crypto.randomBytes(24).toString("hex");
      activeSessions.add(token);
      res.setHeader(
        "Set-Cookie",
        `admin_session=${token}; HttpOnly; Path=/; SameSite=Lax`
      );
      sendJson(res, 200, { ok: true });
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { error: "Login failed" });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/admin/logout") {
    const cookies = parseCookies(req);
    if (cookies.admin_session) {
      activeSessions.delete(cookies.admin_session);
    }
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === "/admin/api/stats" && req.method === "GET") {
    if (!requireAuth(req, res)) return;
    const conversations = listConversations();
    const today = new Date().toISOString().slice(0, 10);
    const messagesToday = conversations.filter((c) => c.timestamp.startsWith(today)).length;
    const uniqueContacts = new Set(conversations.map((c) => c.from)).size;
    const fallbackCount = conversations.filter((c) => c.category === "fallback").length;
    const categoryCounts = {};
    for (const c of conversations) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    sendJson(res, 200, {
      totalMessages: conversations.length,
      messagesToday,
      uniqueContacts,
      fallbackRate: conversations.length
        ? Math.round((fallbackCount / conversations.length) * 100)
        : 0,
      totalStudents: listStudents().length,
      topCategories
    });
    return;
  }

  if (url.pathname === "/admin/api/conversations" && req.method === "GET") {
    if (!requireAuth(req, res)) return;
    sendJson(res, 200, listConversations());
    return;
  }

  if (url.pathname === "/admin/api/students" && req.method === "GET") {
    if (!requireAuth(req, res)) return;
    sendJson(res, 200, listStudents());
    return;
  }

  if (url.pathname === "/admin/api/students" && req.method === "POST") {
    if (!requireAuth(req, res)) return;
    try {
      const body = await readRequestBody(req);
      const student = addStudent(body);
      sendJson(res, 201, student);
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { error: "Failed to add student" });
    }
    return;
  }

  if (url.pathname.startsWith("/admin/api/students/") && req.method === "PUT") {
    if (!requireAuth(req, res)) return;
    const id = url.pathname.slice("/admin/api/students/".length);
    try {
      const body = await readRequestBody(req);
      const student = updateStudent(id, body);
      if (!student) {
        sendJson(res, 404, { error: "Student not found" });
        return;
      }
      sendJson(res, 200, student);
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { error: "Failed to update student" });
    }
    return;
  }

  if (url.pathname.startsWith("/admin/api/students/") && req.method === "DELETE") {
    if (!requireAuth(req, res)) return;
    const id = url.pathname.slice("/admin/api/students/".length);
    const deleted = deleteStudent(id);
    if (!deleted) {
      sendJson(res, 404, { error: "Student not found" });
      return;
    }
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === "/admin/api/content" && req.method === "GET") {
    if (!requireAuth(req, res)) return;
    sendJson(res, 200, getEditableContent());
    return;
  }

  if (url.pathname === "/admin/api/content" && req.method === "PUT") {
    if (!requireAuth(req, res)) return;
    try {
      const body = await readRequestBody(req);
      const updated = updateContent(body);
      sendJson(res, 200, updated);
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { error: "Failed to update content" });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`AI course WhatsApp chatbot is running on port ${PORT}`);
});
