const assert = require("node:assert/strict");
const {
  sanitizeSkillNames,
  profileForMatching,
  missingProfileFields,
  buildLocalMatch,
  profileSignature,
  buildInsightPrompt,
} = require("../server/src/services/job-matching");

const profile = profileForMatching({
  degree: "BSc in Computer Science and Engineering",
  target_role: "Frontend Software Engineer",
  location: "Dhaka, Bangladesh",
  career_interests: JSON.stringify(["Web Development", "Technology"]),
  name: "Private Student Name",
  email: "private.student@example.com",
}, [
  { name: "React.js", score: 50, source: "profile" },
  { name: "JavaScript", score: 50, source: "profile" },
  { name: "Git", score: 50, source: "profile" },
]);

assert.deepEqual(profile.skills, ["React", "JavaScript", "Git"]);
assert.deepEqual(missingProfileFields(profile), []);
assert.deepEqual(sanitizeSkillNames([" React ", "react", "SQL", ""]).map((item) => item.toLowerCase()), ["react", "sql"]);

const match = buildLocalMatch(profile, {
  id: 31,
  title: "Junior Frontend Software Engineer",
  category: "Engineering",
  location: "Dhaka",
  workplace_type: "Hybrid",
  description: "Build accessible product interfaces with React and JavaScript.",
  requirements: "BSc in Computer Science. Strong React, JavaScript, Git and CSS skills.",
  required_skills: "React, JavaScript, Git, CSS",
});

assert.ok(match.match_percentage >= 65, "Relevant student should receive a meaningful match score");
assert.deepEqual(match.matched_skills, ["React", "JavaScript", "Git"]);
assert.ok(match.skill_gaps.includes("CSS"));
assert.ok(match.reasons.length > 0);

const prompt = buildInsightPrompt(profile, [{
  id: "external-31",
  match_id: -31,
  title: "Junior Frontend Software Engineer",
  category: "Engineering",
  description: "Build product interfaces.",
  requirements: "React and JavaScript required.",
  required_skills: "React, JavaScript",
}]);
assert.doesNotMatch(prompt, /Private Student Name|private\.student@example\.com/);
assert.match(prompt, /"jobId":-31/);
assert.notEqual(profileSignature(profile), profileSignature({ ...profile, skills: ["Python"] }));

console.log("Job matching smoke test passed.");
