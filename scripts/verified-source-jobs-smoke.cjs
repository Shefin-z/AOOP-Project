const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const read = (file) => readFileSync(join(root, file), "utf8");

const schema = read("server/src/services/job-schema.js");
const admin = read("server/src/routes/admin.js");
const jobs = read("server/src/routes/jobs.js");
const student = read("components/student/StudentWorkspace.jsx");

assert.match(schema, /application_mode ENUM\('careerforge', 'external'\)/);
assert.match(schema, /external_apply_url VARCHAR\(1000\)/);
assert.match(schema, /source_label VARCHAR\(120\)/);
assert.match(admin, /function cleanExternalApplyUrl/);
assert.match(admin, /official application URL/);
assert.match(admin, /application_mode, external_apply_url, source_label/);
assert.match(jobs, /job\.application_mode === "external"/);
assert.match(jobs, /original company page/);
assert.match(student, /job\.application_mode === "external"/);
assert.match(student, /const externalApplyUrl = job\.external_apply_url/);

console.log("Verified source jobs smoke test passed.");
