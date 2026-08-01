const { GoogleGenAI } = require("@google/genai");

const LEVEL_CONFIG = Object.freeze([
  { level: 1, label: "Foundation", difficulty: "Easy", focus: "essential vocabulary and first principles" },
  { level: 2, label: "Core concepts", difficulty: "Easy", focus: "basic concepts and direct application" },
  { level: 3, label: "Applied basics", difficulty: "Easy to medium", focus: "small practical scenarios" },
  { level: 4, label: "Developing", difficulty: "Developing", focus: "connected concepts and common trade-offs" },
  { level: 5, label: "Intermediate", difficulty: "Intermediate", focus: "practical problem solving" },
  { level: 6, label: "Proficient", difficulty: "Intermediate plus", focus: "multi-step reasoning and professional practice" },
  { level: 7, label: "Challenging", difficulty: "Challenging", focus: "edge cases and nuanced decisions" },
  { level: 8, label: "Advanced", difficulty: "Advanced", focus: "architecture, evaluation and complex scenarios" },
  { level: 9, label: "Hard", difficulty: "Hard", focus: "deep technical judgment and difficult trade-offs" },
  { level: 10, label: "Expert", difficulty: "Expert", focus: "expert synthesis, ambiguity and high-impact decisions" },
]);

const QUESTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["prompt", "options", "correctIndex", "explanation", "focusArea"],
        properties: {
          prompt: { type: "string", minLength: 12, maxLength: 500 },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: { type: "string", minLength: 1, maxLength: 240 },
          },
          correctIndex: { type: "integer", minimum: 0, maximum: 3 },
          explanation: { type: "string", minLength: 10, maxLength: 700 },
          focusArea: { type: "string", minLength: 2, maxLength: 100 },
        },
      },
    },
  },
};

function cleanText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeInterests(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map((interest) => cleanText(interest, 60))
    .filter(Boolean))]
    .slice(0, 8);
}

function buildAssessmentPrompt(profile, levelNumber, previousPrompts = []) {
  const level = LEVEL_CONFIG[levelNumber - 1];
  if (!level) throw new Error("Invalid assessment level");

  const degree = cleanText(profile.degree, 120);
  const targetRole = cleanText(profile.target_role || profile.targetRole, 120);
  const interests = normalizeInterests(profile.career_interests || profile.careerInterests);
  const avoided = (Array.isArray(previousPrompts) ? previousPrompts : [])
    .map((prompt) => cleanText(prompt, 300))
    .filter(Boolean)
    .slice(-12);

  return [
    "You are an expert career skills assessor.",
    "Create exactly 6 high-quality multiple-choice questions for one assessment level.",
    `Student degree: ${degree}`,
    `Target role: ${targetRole}`,
    `Career interests: ${interests.join(", ")}`,
    `Level: ${level.level} of 10 (${level.label})`,
    `Difficulty: ${level.difficulty}`,
    `Focus: ${level.focus}`,
    "Every question must assess knowledge or applied judgment relevant to this exact degree, target role and interests.",
    "Use four distinct, plausible options. Only one option may be correct.",
    "Avoid trivia, trick wording, unsafe advice, discriminatory assumptions and questions requiring private personal data.",
    "Make the six questions cover different skills. Do not mention that an AI generated them.",
    avoided.length ? `Do not repeat these earlier questions: ${avoided.join(" | ")}` : "",
    "Return only the requested structured JSON.",
  ].filter(Boolean).join("\n");
}

function normalizeGeneratedQuestions(payload) {
  const source = Array.isArray(payload?.questions) ? payload.questions : [];
  if (source.length !== 6) throw new Error("Gemini did not return exactly six questions");

  const prompts = new Set();
  return source.map((question, index) => {
    const prompt = cleanText(question?.prompt, 500);
    const options = (Array.isArray(question?.options) ? question.options : [])
      .map((option) => cleanText(option, 240));
    const correctIndex = Number(question?.correctIndex);
    const explanation = cleanText(question?.explanation, 700);
    const focusArea = cleanText(question?.focusArea, 100);
    const uniqueOptions = new Set(options.map((option) => option.toLowerCase()));

    if (prompt.length < 12 || prompts.has(prompt.toLowerCase())) throw new Error("Gemini returned an invalid or repeated question");
    if (options.length !== 4 || options.some((option) => !option) || uniqueOptions.size !== 4) {
      throw new Error("Gemini returned invalid answer options");
    }
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      throw new Error("Gemini returned an invalid correct answer");
    }
    if (explanation.length < 10 || focusArea.length < 2) throw new Error("Gemini returned incomplete question metadata");
    prompts.add(prompt.toLowerCase());
    return {
      id: `q${index + 1}`,
      prompt,
      options,
      correctIndex,
      explanation,
      focusArea,
    };
  });
}

function sanitiseQuestionsForClient(questions) {
  return questions.map(({ correctIndex: _correctIndex, explanation: _explanation, ...question }) => question);
}

function gradeAssessmentQuestions(questions, submittedAnswers) {
  const answerMap = new Map((Array.isArray(submittedAnswers) ? submittedAnswers : []).flatMap((answer) => {
    if (answer?.optionIndex == null) return [];
    const optionIndex = Number(answer?.optionIndex);
    if (!answer?.questionId || !Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 3) return [];
    return [[String(answer.questionId), optionIndex]];
  }));
  const review = questions.map((question) => {
    const selectedIndex = answerMap.has(question.id) ? answerMap.get(question.id) : null;
    return {
      id: question.id,
      prompt: question.prompt,
      options: question.options,
      selectedIndex,
      correctIndex: question.correctIndex,
      correct: selectedIndex === question.correctIndex,
      explanation: question.explanation,
      focusArea: question.focusArea,
    };
  });
  return {
    correctCount: review.filter((item) => item.correct).length,
    review,
  };
}

function configuredApiKey() {
  return String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
}

function geminiConfigured() {
  return Boolean(configuredApiKey());
}

async function generateAssessmentQuestions({ profile, levelNumber, previousPrompts = [] }) {
  const apiKey = configuredApiKey();
  if (!apiKey) {
    const error = new Error("Gemini is not configured yet. Add GEMINI_API_KEY to the server environment.");
    error.statusCode = 503;
    throw error;
  }

  const model = String(process.env.GEMINI_MODEL || "gemini-3.6-flash").trim();
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model,
      contents: buildAssessmentPrompt(profile, levelNumber, previousPrompts),
      config: {
        temperature: 0.35,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseJsonSchema: QUESTION_SCHEMA,
      },
    });
    const text = response.text;
    if (!text) throw new Error("Gemini returned an empty response");
    return {
      model: response.modelVersion || model,
      questions: normalizeGeneratedQuestions(JSON.parse(text)),
    };
  } catch (cause) {
    const error = new Error("Could not generate this assessment right now. Please try again.");
    error.statusCode = 503;
    error.cause = cause;
    throw error;
  }
}

module.exports = {
  LEVEL_CONFIG,
  QUESTION_SCHEMA,
  buildAssessmentPrompt,
  normalizeGeneratedQuestions,
  sanitiseQuestionsForClient,
  gradeAssessmentQuestions,
  geminiConfigured,
  generateAssessmentQuestions,
};
