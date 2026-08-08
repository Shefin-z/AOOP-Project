const { createHash } = require("node:crypto");
const { GoogleGenAI } = require("@google/genai");

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "is", "it", "of", "on", "or", "the", "to", "with", "you", "your",
  "experience", "knowledge", "skill", "skills", "ability", "strong", "good", "work", "working", "year", "years", "candidate", "required", "preferred",
]);

const SKILL_ALIASES = Object.freeze({
  "JavaScript": ["javascript", "js", "ecmascript"],
  "TypeScript": ["typescript", "ts"],
  "React": ["react", "react.js", "reactjs"],
  "Next.js": ["next.js", "nextjs"],
  "Node.js": ["node", "node.js", "nodejs"],
  "Express.js": ["express", "express.js", "expressjs"],
  "Python": ["python"],
  "Java": ["java"],
  "Spring Boot": ["spring boot", "springboot"],
  "C++": ["c++", "cpp"],
  "C#": ["c#", "csharp", "dotnet", ".net"],
  "HTML": ["html"],
  "CSS": ["css", "tailwind", "tailwindcss"],
  "SQL": ["sql"],
  "MySQL": ["mysql"],
  "PostgreSQL": ["postgresql", "postgres"],
  "MongoDB": ["mongodb", "mongo"],
  "Git": ["git", "github", "gitlab"],
  "Docker": ["docker", "containerization"],
  "AWS": ["aws", "amazon web services"],
  "Azure": ["azure"],
  "Google Cloud": ["gcp", "google cloud"],
  "Data Analysis": ["data analysis", "data analytics", "data analyst"],
  "Excel": ["excel", "microsoft excel"],
  "Power BI": ["power bi", "powerbi"],
  "Tableau": ["tableau"],
  "Machine Learning": ["machine learning", "ml", "deep learning"],
  "Figma": ["figma"],
  "UI/UX Design": ["ui ux", "ux design", "user experience", "user interface"],
  "Product Management": ["product management", "product manager", "product strategy"],
  "Project Management": ["project management", "project manager"],
  "Communication": ["communication", "presentation", "stakeholder management"],
  "Problem Solving": ["problem solving", "problem-solving", "analytical thinking"],
  "Agile": ["agile", "scrum", "kanban"],
  "Testing": ["testing", "unit test", "qa", "quality assurance"],
});

const MATCH_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["matches"],
  properties: {
    matches: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["jobId", "reasons", "skillGaps"],
        properties: {
          jobId: { type: "integer" },
          reasons: { type: "array", minItems: 1, maxItems: 3, items: { type: "string", minLength: 6, maxLength: 180 } },
          skillGaps: { type: "array", maxItems: 4, items: { type: "string", minLength: 1, maxLength: 80 } },
        },
      },
    },
  },
};

function cleanText(value, maximum = 160) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maximum);
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value || "[]"); } catch { return []; }
}

function sanitizeSkillNames(value, maximum = 20) {
  const source = Array.isArray(value) ? value : String(value || "").split(/[,\n;]+/);
  const seen = new Set();
  return source
    .map((skill) => cleanText(skill, 60))
    .filter((skill) => skill.length >= 2)
    .filter((skill) => {
      const key = skill.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, maximum);
}

function normalized(value) {
  return ` ${String(value || "").toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function hasPhrase(text, phrase) {
  const candidate = normalized(text);
  const target = normalized(phrase).trim();
  return target.length > 1 && candidate.includes(` ${target} `);
}

function canonicalSkill(skill) {
  const clean = cleanText(skill, 60);
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.some((alias) => hasPhrase(clean, alias))) return canonical;
  }
  return clean;
}

function unique(values, maximum = 20) {
  const seen = new Set();
  return values.filter((value) => {
    const clean = cleanText(value, 80);
    if (!clean || seen.has(clean.toLowerCase())) return false;
    seen.add(clean.toLowerCase());
    return true;
  }).slice(0, maximum);
}

function detectSkills(text) {
  const detected = Object.entries(SKILL_ALIASES)
    .filter(([, aliases]) => aliases.some((alias) => hasPhrase(text, alias)))
    .map(([canonical]) => canonical);
  return unique(detected, 20);
}

function terms(value) {
  return new Set(
    normalized(value).trim().split(" ")
      .filter((token) => token.length > 1 && !STOP_WORDS.has(token)),
  );
}

function overlapScore(left, right) {
  const a = terms(left);
  const b = terms(right);
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / Math.max(1, Math.min(a.size, b.size));
}

function locationScore(studentLocation, jobLocation, workplaceType) {
  if (String(workplaceType || "").toLowerCase() === "remote") return 1;
  const overlap = overlapScore(studentLocation, jobLocation);
  return overlap >= 0.5 ? 1 : overlap >= 0.2 ? 0.55 : 0;
}

function jobSkillNames(job) {
  const structured = sanitizeSkillNames(job.required_skills || job.requiredSkills, 20);
  if (structured.length) return unique(structured.map(canonicalSkill), 20);
  return detectSkills(`${job.requirements || ""} ${job.description || ""} ${job.title || ""}`);
}

function profileForMatching(profile, skillRows = []) {
  const profileSkills = sanitizeSkillNames(profile?.skills || [], 20);
  const databaseSkills = (Array.isArray(skillRows) ? skillRows : []).map((skill) => skill?.name || skill);
  const skills = unique([...profileSkills, ...databaseSkills].map(canonicalSkill), 20);
  const interests = unique(parseJsonArray(profile?.career_interests).map((interest) => cleanText(interest, 60)), 8);
  return {
    degree: cleanText(profile?.degree, 120),
    targetRole: cleanText(profile?.target_role, 120),
    location: cleanText(profile?.location, 120),
    interests,
    skills,
  };
}

function missingProfileFields(profile) {
  const missing = [];
  if (!profile.degree) missing.push("degree");
  if (!profile.targetRole) missing.push("target role");
  if (!profile.location) missing.push("location");
  if (!profile.interests.length) missing.push("career interests");
  if (!profile.skills.length) missing.push("skills");
  return missing;
}

function buildLocalMatch(profile, job) {
  const requiredSkills = jobSkillNames(job);
  const studentSkills = new Set(profile.skills.map((skill) => skill.toLowerCase()));
  const matchedSkills = requiredSkills.filter((skill) => studentSkills.has(skill.toLowerCase()));
  const missingSkills = requiredSkills.filter((skill) => !studentSkills.has(skill.toLowerCase()));
  const skillScore = requiredSkills.length ? matchedSkills.length / requiredSkills.length : 0;
  const roleScore = overlapScore(profile.targetRole, `${job.title || ""} ${job.category || ""}`);
  const interestScore = profile.interests.length
    ? Math.max(...profile.interests.map((interest) => overlapScore(interest, `${job.title || ""} ${job.category || ""} ${job.description || ""}`)))
    : 0;
  const requiresDegree = /\b(?:bsc|bachelor|masters?|degree|graduate|cse|computer science|business administration)\b/i.test(`${job.requirements || ""} ${job.description || ""}`);
  const educationScore = requiresDegree ? overlapScore(profile.degree, `${job.requirements || ""} ${job.description || ""}`) : 0.5;
  const geoScore = locationScore(profile.location, job.location, job.workplace_type);
  const raw = (skillScore * 50) + (roleScore * 25) + (interestScore * 10) + (educationScore * 8) + (geoScore * 7);
  const profileMissing = missingProfileFields(profile);
  const confidence = profileMissing.length === 0 ? "high" : profile.skills.length && profile.targetRole ? "medium" : "low";
  const reasons = [];
  if (matchedSkills.length) reasons.push(`Matches your skills: ${matchedSkills.slice(0, 3).join(", ")}`);
  if (roleScore >= 0.34) reasons.push("The role aligns with your target career direction");
  if (interestScore >= 0.34) reasons.push("The opportunity connects with your stated career interests");
  if (geoScore >= 0.55) reasons.push(String(job.workplace_type || "").toLowerCase() === "remote" ? "Remote work fits your location preference" : "The role is aligned with your saved location");
  if (!reasons.length) reasons.push("Add more relevant skills to improve this match analysis");
  return {
    ...job,
    match_percentage: Math.round(Math.max(0, Math.min(100, raw))),
    match_confidence: confidence,
    match_components: {
      skills: Math.round(skillScore * 100),
      role: Math.round(roleScore * 100),
      interests: Math.round(interestScore * 100),
      education: Math.round(educationScore * 100),
      location: Math.round(geoScore * 100),
    },
    matched_skills: matchedSkills.slice(0, 6),
    skill_gaps: missingSkills.slice(0, 4),
    reasons: reasons.slice(0, 3),
  };
}

function signature(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function profileSignature(profile) {
  return signature({
    degree: profile.degree,
    targetRole: profile.targetRole,
    location: profile.location,
    interests: profile.interests,
    skills: profile.skills,
  });
}

function jobSignature(job) {
  return signature({
    id: job.match_id ?? job.id,
    title: cleanText(job.title, 180),
    category: cleanText(job.category, 100),
    description: cleanText(job.description, 1500),
    requirements: cleanText(job.requirements, 1500),
    requiredSkills: jobSkillNames(job),
    updatedAt: job.updated_at ? new Date(job.updated_at).toISOString() : "",
  });
}

function configuredApiKey() {
  return String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
}

function geminiMatchingConfigured() {
  return Boolean(configuredApiKey());
}

function buildInsightPrompt(profile, jobs) {
  return [
    "You explain job matches for a career platform. Do not calculate or alter match percentages.",
    "Never claim that a student will be hired or that any job is perfect.",
    "Use only the provided professional data. Do not infer protected traits or private facts.",
    "Give concise, factual reasons and concrete skill gaps. Avoid vague encouragement.",
    "Student (no name, email, phone, CV, or address is provided):",
    `Degree: ${profile.degree || "Not provided"}`,
    `Target role: ${profile.targetRole || "Not provided"}`,
    `Career interests: ${profile.interests.join(", ") || "Not provided"}`,
    `Skills: ${profile.skills.join(", ") || "Not provided"}`,
    "Jobs:",
    JSON.stringify(jobs.map((job) => ({
      jobId: Number(job.match_id ?? job.id),
      title: cleanText(job.title, 180),
      category: cleanText(job.category, 100),
      requiredSkills: jobSkillNames(job),
      description: cleanText(job.description, 900),
      requirements: cleanText(job.requirements, 900),
    }))),
    "Return only the requested JSON.",
  ].join("\n");
}

function normaliseInsightPayload(payload, allowedJobs) {
  const allowed = new Set(allowedJobs.map((job) => Number(job.match_id ?? job.id)));
  const seen = new Set();
  return (Array.isArray(payload?.matches) ? payload.matches : [])
    .filter((item) => allowed.has(Number(item?.jobId)) && !seen.has(Number(item?.jobId)))
    .map((item) => {
      const jobId = Number(item.jobId);
      seen.add(jobId);
      return {
        jobId,
        reasons: unique((Array.isArray(item.reasons) ? item.reasons : []).map((reason) => cleanText(reason, 180)), 3),
        skillGaps: unique((Array.isArray(item.skillGaps) ? item.skillGaps : []).map((gap) => cleanText(gap, 80)), 4),
      };
    })
    .filter((item) => item.reasons.length);
}

async function generateGeminiInsights(profile, jobs) {
  const apiKey = configuredApiKey();
  if (!apiKey || !jobs.length) return { model: null, insights: [] };
  const model = String(process.env.GEMINI_MODEL || "gemini-3.6-flash").trim();
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model,
        contents: buildInsightPrompt(profile, jobs),
        config: {
          temperature: 0.15,
          maxOutputTokens: 1800,
          responseMimeType: "application/json",
          responseJsonSchema: MATCH_RESPONSE_SCHEMA,
        },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini match explanation timed out")), 8000)),
    ]);
    const text = response?.text;
    if (!text) throw new Error("Gemini returned an empty match explanation");
    return {
      model: response.modelVersion || model,
      insights: normaliseInsightPayload(JSON.parse(text), jobs),
    };
  } catch {
    return { model: null, insights: [] };
  }
}

module.exports = {
  SKILL_ALIASES,
  sanitizeSkillNames,
  profileForMatching,
  missingProfileFields,
  buildLocalMatch,
  profileSignature,
  jobSignature,
  geminiMatchingConfigured,
  buildInsightPrompt,
  generateGeminiInsights,
};
