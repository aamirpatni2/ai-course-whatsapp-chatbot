import { getContentOverrides, saveContentOverrides } from "./data/store.js";

export const course = {
  name: "Complete Practical AI Training Program - July 2026 Batch",
  fee: "Rs. 5,000",
  format: "100% Live Online Classes on Zoom. Physical classes are not available.",
  totalClasses: "10 live classes",
  days: "Saturday and Sunday",
  time: "10:00 PM Pakistan Time",
  duration: "About 1 hour per class",
  level: "Beginners to Advanced Level",
  status: "The course is already running, but new students can still join.",
  recordings:
    "If you missed earlier classes, you will receive recordings of previous lectures.",
  payment: {
    accountTitle: "Muhammad Aamir",
    bank: "MCB Islamic Bank",
    accountNo: "0571000437380001",
    iban: "PK73MCIB0571000437380001",
    easypaisa: "0300-9254418"
  },
  topics: [
    "ChatGPT and Prompt Engineering",
    "Google Gemini",
    "Claude AI",
    "Perplexity AI",
    "AI Image Generation",
    "AI Video Generation",
    "Practical Workflows",
    "Real projects and hands-on training",
    "Live Q&A and guidance"
  ]
};

export const replies = {
  greeting:
    "وعلیکم السلام! 😊\n\nWelcome to the Complete Practical AI Training Program.\n\nHow can I help you?\n\n1. Course details\n2. Fee\n3. Class timing\n4. Registration\n5. Payment details\n6. Recordings",

  details:
    "🚀 Complete Practical AI Training Program - July 2026 Batch\n\n✅ 100% Live Online Classes on Zoom\n❌ Physical classes nahi hain\n📚 Total 10 live classes\n📅 Saturday & Sunday\n🕙 10:00 PM Pakistan Time\n⏱️ Around 1 hour per class\n🎓 Beginners to Advanced Level",

  topics:
    "📚 Course mein yeh topics cover honge:\n\n✔️ ChatGPT and Prompt Engineering\n✔️ Google Gemini\n✔️ Claude AI\n✔️ Perplexity AI\n✔️ AI Image Generation\n✔️ AI Video Generation\n✔️ Practical Workflows\n✔️ Real projects and hands-on training\n✔️ Live Q&A and guidance",

  fee:
    "💰 Course fee sirf Rs. 5,000 hai.",

  timing:
    "📅 Classes Saturday & Sunday hoti hain.\n🕙 Time: 10:00 PM Pakistan Time\n⏱️ Duration: taqreeban 1 hour per class",

  online:
    "✅ Classes 100% live online Zoom par hoti hain.\n❌ Physical classes available nahi hain.",

  recordings:
    "✅ Ji, previous classes ki recordings provide ki jayengi. Agar aap late join kar rahe hain to bhi aap recordings se missed lectures cover kar sakte hain.",

  registration:
    "✅ Registration ka tareeqa:\n\n1️⃣ Course fee submit karein.\n2️⃣ Payment screenshot WhatsApp par send karein.\n3️⃣ Aapki registration confirm kar di jayegi.",

  payment:
    "💳 Payment Details\n\nAccount Title: Muhammad Aamir\nBank: MCB Islamic Bank\nAccount No: 0571000437380001\nIBAN: PK73MCIB0571000437380001\n\nEasypaisa: 0300-9254418\n\nPayment ke baad screenshot WhatsApp par send kar dein.",

  seats:
    "⚠️ Limited seats available hain. Apni seat confirm karne ke liye payment screenshot WhatsApp par send kar dein.",

  beginner:
    "✅ Ji, yeh course beginners ke liye bhi suitable hai. Course basic level se start hota hai aur practical/professional workflows tak le jata hai.",

  advanced:
    "✅ Course beginners se advanced level tak suitable hai. Is mein practical tools, workflows, projects, image/video AI, aur prompt engineering cover hoti hai.",

  certificate:
    "Certificate detail abhi confirm nahi hai. Registration se pehle admin se certificate availability confirm kar lein.",

  human:
    "Aapka message admin ko forward kar diya jayega. Barah-e-karam apna naam aur question clearly send kar dein.",

  fallback:
    "Sorry, mujhe aapka question clear nahi hua.\n\nPlease in mein se koi option send karein:\n\n1. Course details\n2. Fee\n3. Timing\n4. Registration\n5. Payment\n6. Recordings\n7. Topics\n\nYa admin se baat karne ke liye 'admin' type karein."
};

export const keywordRules = [
  {
    reply: "greeting",
    keywords: ["salam", "assalam", "السلام", "hi", "hello", "aoa", "assalamu"]
  },
  {
    reply: "fee",
    keywords: ["fee", "fees", "price", "cost", "charges", "kitni", "فیس", "paisa", "rupees", "5000"]
  },
  {
    reply: "payment",
    keywords: ["payment", "pay", "account", "bank", "iban", "easypaisa", "screenshot", "paid", "transfer"]
  },
  {
    reply: "timing",
    keywords: ["time", "timing", "schedule", "class kab", "days", "saturday", "sunday", "10", "وقت", "ٹائم"]
  },
  {
    reply: "online",
    keywords: ["online", "zoom", "physical", "offline", "location", "address", "class kaha", "آن لائن"]
  },
  {
    reply: "recordings",
    keywords: ["recording", "recordings", "miss", "missed", "previous", "lecture", "lectures", "late join", "رکارڈنگ"]
  },
  {
    reply: "topics",
    keywords: ["topic", "topics", "syllabus", "learn", "seekh", "سیکھ", "cover", "chatgpt", "gemini", "claude", "image", "video", "prompt"]
  },
  {
    reply: "beginner",
    keywords: ["beginner", "basic", "zero", "new", "start", "ابتدائی"]
  },
  {
    reply: "advanced",
    keywords: ["advanced", "professional", "practical", "project", "workflow"]
  },
  {
    reply: "registration",
    keywords: ["register", "registration", "admission", "join", "enroll", "apply", "داخلہ", "رجسٹریشن"]
  },
  {
    reply: "seats",
    keywords: ["seat", "seats", "available", "space", "limited"]
  },
  {
    reply: "certificate",
    keywords: ["certificate", "certification", "سرٹیفکیٹ"]
  },
  {
    reply: "human",
    keywords: ["admin", "teacher", "sir", "human", "call", "contact", "support", "بات"]
  },
  {
    reply: "details",
    keywords: ["detail", "details", "course", "کورس", "program", "info", "information", "maloomat"]
  }
];

const defaultCourse = { ...course };
const defaultReplies = { ...replies };

function applyOverrides() {
  const overrides = getContentOverrides();
  Object.assign(course, defaultCourse, overrides.course || {});
  Object.assign(replies, defaultReplies, overrides.replies || {});
}

applyOverrides();

export function getEditableContent() {
  return { course: { ...course }, replies: { ...replies } };
}

export function getDefaultContent() {
  return { course: { ...defaultCourse }, replies: { ...defaultReplies } };
}

export function updateContent({ course: courseUpdates, replies: repliesUpdates }) {
  if (courseUpdates) {
    Object.assign(course, courseUpdates);
  }
  if (repliesUpdates) {
    Object.assign(replies, repliesUpdates);
  }

  saveContentOverrides({
    course: diffFromDefault(course, defaultCourse),
    replies: diffFromDefault(replies, defaultReplies)
  });

  return getEditableContent();
}

function diffFromDefault(current, defaults) {
  const diff = {};
  for (const key of Object.keys(current)) {
    if (JSON.stringify(current[key]) !== JSON.stringify(defaults[key])) {
      diff[key] = current[key];
    }
  }
  return diff;
}
