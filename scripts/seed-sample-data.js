import { addConversation, addStudent, updateStudent, listStudents } from "../api/data/store.js";
import { getBotReplyDetailed } from "../api/bot.js";

const sampleMessages = [
  { from: "923001234567", text: "Assalam o alaikum" },
  { from: "923001234567", text: "Fee kitni hai?" },
  { from: "923219876543", text: "Class timing kya hai?" },
  { from: "923219876543", text: "Payment details bhej dein" },
  { from: "923334455667", text: "Recording milegi kya agar class miss ho gai?" },
  { from: "923334455667", text: "Kya topics cover honge?" },
  { from: "923450001122", text: "Beginner ke liye theek hai ye course?" },
  { from: "923450001122", text: "Registration kaise karni hai" },
  { from: "923219876543", text: "Seats available hain?" },
  { from: "923001234567", text: "asdkjaslkdjaslkdj" }
];

for (const message of sampleMessages) {
  const { reply, category } = getBotReplyDetailed(message.text);
  addConversation({ from: message.from, channel: "whatsapp", text: message.text, reply, category });
}

const sampleStudents = [
  { name: "Ayesha Siddiqui", contact: "0300-1234567", notes: "Paid via Easypaisa", paymentStatus: "paid" },
  { name: "Bilal Hussain", contact: "0321-9876543", notes: "Asked about recordings" },
  { name: "Sara Malik", contact: "0333-4455667", notes: "" }
];

for (const student of sampleStudents) {
  const created = addStudent(student);
  if (student.paymentStatus) {
    updateStudent(created.id, { paymentStatus: student.paymentStatus });
  }
}

console.log(`Seeded ${sampleMessages.length} sample conversations and ${sampleStudents.length} sample students.`);
console.log(`Total students now: ${listStudents().length}`);
