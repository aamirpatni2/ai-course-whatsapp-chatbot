import http from "node:http";
import fs from "node:fs";
import path from "node:path";

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

// Dynamic import so env vars from .env are set (above) before api/index.js
// reads process.env at its own module top-level.
const { handleRequest } = await import("./api/index.js");

const PORT = Number(process.env.PORT || 3000);

const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`AI course WhatsApp chatbot is running on port ${PORT}`);
});
