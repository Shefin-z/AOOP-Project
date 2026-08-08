const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  average,
  calculateProfileCompletion,
  calculateReadiness,
} = require("../server/src/services/student-overview");

assert.equal(calculateReadiness(), 0);
assert.equal(calculateReadiness({
  profileCompletion: 100,
  assessmentPerformance: 100,
  learningProgress: 100,
}), 100);
assert.equal(calculateReadiness({
  profileCompletion: 100,
  assessmentPerformance: 0,
  learningProgress: 0,
}), 35);
assert.equal(average([]), 0);
assert.equal(average([70, 80, 90]), 80);
assert.equal(calculateProfileCompletion({
  name: "Student",
  email: "student@example.com",
  university: "UIU",
  degree: "BSc in CSE",
  graduation_year: 2027,
  target_role: "Software Engineer",
  location: "Dhaka",
  career_interests: JSON.stringify(["Technology"]),
  skills: ["JavaScript"],
}), 100);

const workspaceSource = fs.readFileSync(
  path.resolve(__dirname, "../components/student/StudentWorkspace.jsx"),
  "utf8",
);
const shellSource = fs.readFileSync(
  path.resolve(__dirname, "../components/DashboardShell.jsx"),
  "utf8",
);
for (const demoText of [
  'value="78%"',
  'value="6 days"',
  "Personal best: 11 days",
  "Three focused actions can move your readiness",
  "You score in the top 18%",
  "126 going",
]) {
  const overviewStart = workspaceSource.indexOf("function Overview(");
  const overviewEnd = workspaceSource.indexOf("function Metric(", overviewStart);
  assert.equal(
    workspaceSource.slice(overviewStart, overviewEnd).includes(demoText),
    false,
    `Student overview still contains demo content: ${demoText}`,
  );
}
assert.equal(shellSource.includes('role === "admin" ? "Live" : "78%"'), false);
assert.match(shellSource, /studentReadiness/);

console.log(JSON.stringify({
  status: "passed",
  readinessSources: ["profile", "assessments", "learning"],
  demoOverviewDataRemoved: true,
}));
