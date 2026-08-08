const assert = require("node:assert/strict");
const fs = require("node:fs");

const route = fs.readFileSync("server/src/routes/community.js", "utf8");
const ui = fs.readFileSync("components/student/CommunityExperience.jsx", "utf8");
const workspace = fs.readFileSync("components/student/StudentWorkspace.jsx", "utf8");

assert.match(route, /p\.status='visible' OR \(p\.user_id=\? AND p\.status='pending_review'\)/, "Owners must see their posts awaiting review");
assert.match(route, /post:\s*createdRows\[0\]/, "Post creation must return a renderable post");
assert.match(ui, /Awaiting administrator review/, "Pending posts need a clear owner-visible status");
assert.match(workspace, /setPosts\(\(current\) => \[result\.post/, "Published posts should appear immediately without a reload");

console.log("Community post visibility smoke test passed.");
