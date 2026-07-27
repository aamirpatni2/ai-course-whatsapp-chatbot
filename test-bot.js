import { getBotReply } from "./api/bot.js";

const testQuestions = [
  "Assalam o alaikum",
  "Fee kitni hai?",
  "Class timing kya hai?",
  "Payment details send kar dein",
  "Agar class miss ho gai to recording milegi?",
  "Course mein kya kya seekhain ge?",
  "Physical class hai?",
  "Beginner join kar sakta hai?"
];

for (const question of testQuestions) {
  console.log("\nStudent:", question);
  console.log("Bot:", getBotReply(question));
}
