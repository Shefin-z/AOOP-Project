const assert = require("node:assert/strict");
const fs = require("node:fs");

const schema = fs.readFileSync("database/schema.sql", "utf8");
const route = fs.readFileSync("server/src/routes/student-network.js", "utf8");
const ui = fs.readFileSync("components/student/ConnectionsExperience.jsx", "utf8");
const workspace = fs.readFileSync("components/student/StudentWorkspace.jsx", "utf8");
const shell = fs.readFileSync("components/DashboardShell.jsx", "utf8");

assert.match(schema, /CREATE TABLE IF NOT EXISTS student_connections/, "Connection records need a database table");
assert.match(schema, /UNIQUE KEY uq_student_connection_pair/, "A pair of students should only have one connection record");
assert.match(schema, /CREATE TABLE IF NOT EXISTS student_messages/, "Private messages need a database table");
assert.match(schema, /ALTER TABLE student_connections\s+ADD COLUMN IF NOT EXISTS id/, "Legacy connection tables need an API-addressable ID migration");
assert.match(route, /router\.get\("\/students"/, "Students must be searchable");
assert.match(route, /router\.post\("\/connections"/, "Students must be able to send connection requests");
assert.match(route, /status='accepted'/, "Messages must be gated by an accepted connection");
assert.match(route, /router\.post\("\/conversations\/:connectionId\/messages"/, "Connected students must be able to send messages");
assert.match(route, /recipient_id=\? AND read_at IS NULL/, "Unread messages must be tracked per recipient");
assert.match(ui, /\/network\/students\?q=/, "The inbox UI must call the live student search API");
assert.match(ui, /\/network\/conversations\//, "The inbox UI must load live conversations");
assert.match(workspace, /id: "connections", label: "Connections & inbox"/, "The student workspace needs an inbox section");
assert.match(shell, /Search students by name or ID/, "The top bar must support student search");

console.log("Student network smoke test passed.");
