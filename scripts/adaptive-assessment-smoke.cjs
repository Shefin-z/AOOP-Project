const assert = require("node:assert/strict");
const {
  LEVEL_CONFIG,
  buildAssessmentPrompt,
  normalizeGeneratedQuestions,
  sanitiseQuestionsForClient,
  gradeAssessmentQuestions,
} = require("../server/src/services/gemini-assessment");

assert.equal(LEVEL_CONFIG.length, 10);
assert.equal(LEVEL_CONFIG[0].difficulty, "Easy");
assert.equal(LEVEL_CONFIG[9].difficulty, "Expert");

const profile = {
  degree: "BSc in CSE",
  target_role: "Software Engineer",
  career_interests: ["Backend Engineering", "Cloud"],
  name: "Private Name",
  email: "private@example.com",
};
const prompt = buildAssessmentPrompt(profile, 5);
assert.match(prompt, /BSc in CSE/);
assert.match(prompt, /Software Engineer/);
assert.match(prompt, /Backend Engineering, Cloud/);
assert.doesNotMatch(prompt, /Private Name|private@example\.com/);

const questions = normalizeGeneratedQuestions({
  questions: Array.from({ length: 6 }, (_, index) => ({
    prompt: `Which valid approach best solves scenario number ${index + 1}?`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctIndex: index % 4,
    explanation: "This option follows the relevant professional principle.",
    focusArea: `Skill ${index + 1}`,
  })),
});
assert.equal(questions.length, 6);
assert.equal(questions[0].id, "q1");
const clientQuestions = sanitiseQuestionsForClient(questions);
assert.equal(clientQuestions[0].correctIndex, undefined);
assert.equal(clientQuestions[0].explanation, undefined);
const grade = gradeAssessmentQuestions(questions, [
  { questionId: "q1", optionIndex: 0 },
  { questionId: "q2", optionIndex: 1 },
  { questionId: "q3", optionIndex: null },
  { questionId: "q4", optionIndex: 99 },
]);
assert.equal(grade.correctCount, 2);
assert.equal(grade.review[2].selectedIndex, null);

console.log("Adaptive assessment smoke test passed.");
