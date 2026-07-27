import fs from "node:fs";
import path from "node:path";

// Vercel's deployed source tree is read-only at runtime, so serverless
// functions there must write to /tmp instead. /tmp isn't guaranteed to
// persist between invocations, so this is a soft fallback, not durable
// storage - see the README for connecting a real database when needed.
const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function defaultDb() {
  return {
    conversations: [],
    students: [],
    contentOverrides: {}
  };
}

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb(), null, 2));
  }
}

export function readDb() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return { ...defaultDb(), ...parsed };
  } catch {
    return defaultDb();
  }
}

export function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function addConversation({ from, channel, text, reply, category }) {
  const db = readDb();
  const entry = {
    id: generateId(),
    from,
    channel,
    text,
    reply,
    category,
    timestamp: new Date().toISOString()
  };
  db.conversations.push(entry);
  writeDb(db);
  return entry;
}

export function listConversations() {
  return readDb().conversations;
}

export function listStudents() {
  return readDb().students;
}

export function addStudent({ name, contact, paymentStatus, notes }) {
  const db = readDb();
  const entry = {
    id: generateId(),
    name: name || "",
    contact: contact || "",
    paymentStatus: paymentStatus || "pending",
    notes: notes || "",
    createdAt: new Date().toISOString()
  };
  db.students.push(entry);
  writeDb(db);
  return entry;
}

export function updateStudent(id, updates) {
  const db = readDb();
  const student = db.students.find((item) => item.id === id);
  if (!student) {
    return null;
  }
  Object.assign(student, updates);
  writeDb(db);
  return student;
}

export function deleteStudent(id) {
  const db = readDb();
  const before = db.students.length;
  db.students = db.students.filter((item) => item.id !== id);
  writeDb(db);
  return db.students.length < before;
}

export function getContentOverrides() {
  return readDb().contentOverrides;
}

export function saveContentOverrides(overrides) {
  const db = readDb();
  db.contentOverrides = overrides;
  writeDb(db);
}
