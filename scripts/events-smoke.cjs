const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const read = (file) => readFileSync(join(root, file), "utf8");
const schema = read("database/schema.sql");
const eventSchema = read("server/src/services/event-schema.js");
const admin = read("server/src/routes/admin.js");
const learning = read("server/src/routes/learning.js");
const student = read("components/student/StudentWorkspace.jsx");
const adminUi = read("components/admin/AdminWorkspace.jsx");

assert.match(schema, /created_by BIGINT UNSIGNED NULL/);
assert.match(schema, /event_registrations/);
assert.doesNotMatch(read("database/seed.sql"), /Designing your first 90-day career plan/);
assert.match(eventSchema, /ADD COLUMN IF NOT EXISTS created_by/);
assert.match(admin, /router\.post\("\/events"/);
assert.match(admin, /router\.patch\("\/events\/:id\/status"/);
assert.match(admin, /router\.delete\("\/events\/:id"/);
assert.match(admin, /registration_count/);
assert.match(learning, /WHERE e\.created_by IS NOT NULL AND e\.status='published'/);
assert.match(learning, /FOR UPDATE/);
assert.match(learning, /Only students can reserve event seats/);
assert.match(learning, /router\.delete\("\/events\/:id\/register"/);
assert.match(learning, /Reservation cancelled/);
assert.match(student, /apiRequest\("\/events"\)/);
assert.match(student, /Reserve a seat/);
assert.match(student, /Cancel reservation/);
assert.match(student, /method: "DELETE"/);
assert.match(adminUi, /Create event/);
assert.match(adminUi, /Database-backed/);

console.log("Events smoke test passed.");
