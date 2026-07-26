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

export function classifyMessage(message) {
  const normalized = normalizeText(message);

  if (!normalized) {
    return "greeting";
  }

  if (menuMap[normalized]) {
    return menuMap[normalized];
  }

  for (const rule of keywordRules) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      return rule.reply;
    }
  }

  return "fallback";
}

export function getBotReplyDetailed(message) {
  const category = classifyMessage(message);
  return { category, reply: replies[category] };
}

export function getBotReply(message) {
  return getBotReplyDetailed(message).reply;
}
