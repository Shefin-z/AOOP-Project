const assert = require("node:assert/strict");
const { createSearch, normalizeJoobleJob } = require("../server/src/services/external-jobs");

const search = createSearch({ targetRole: "Backend Engineer", location: "Dhaka, Bangladesh", interests: ["Cloud"] });
assert.equal(search.keywords, "Backend Engineer");
assert.equal(search.location, "Dhaka, Bangladesh");

const job = normalizeJoobleJob({
  id: 42,
  title: "Junior Backend Engineer",
  company: "Example Ltd",
  location: "Dhaka, Bangladesh · Remote",
  type: "Full-time",
  salary: "BDT 30000 - 50000",
  snippet: "Build Node.js APIs using SQL and Git.",
  link: "https://example.com/jobs/42",
  updated: "2026-08-08T08:30:00Z",
});
assert.equal(job.source, "jooble");
assert.equal(job.employmentType, "Full-time");
assert.equal(job.workplaceType, "Remote");
assert.equal(job.sourceUrl, "https://example.com/jobs/42");
assert.equal(normalizeJoobleJob({ title: "Unsafe", link: "javascript:alert(1)" }), null);

console.log("External job feed smoke test passed.");
