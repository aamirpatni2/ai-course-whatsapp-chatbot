import { keywordRules, replies } from "./knowledge-base.js";

const menuMap = {
  "1": "details",
  "2": "fee",
  "3": "timing",
  "4": "registration",
  "5": "payment",
  "6": "recordings",
  "7": "topics"
};

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[؟?!.،,;:()[\]{}"'`*_~|<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getBotReply(message) {
  const normalized = normalizeText(message);

  if (!normalized) {
    return replies.greeting;
  }

  if (menuMap[normalized]) {
    return replies[menuMap[normalized]];
  }

  for (const rule of keywordRules) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      return replies[rule.reply];
    }
  }

  return replies.fallback;
}
