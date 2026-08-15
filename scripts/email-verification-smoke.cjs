const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

process.env.NODE_ENV = "test";
process.env.EMAIL_VERIFICATION_SECRET = "careerforge-email-verification-smoke-secret";

const {
  generateVerificationCode,
  hashVerificationCode,
  matchesVerificationCode,
  hashPasswordResetCode,
  matchesPasswordResetCode,
} = require("../server/src/services/email-verification");

const email = "student@example.com";
const codes = new Set(Array.from({ length: 40 }, generateVerificationCode));
assert.ok([...codes].every((code) => /^\d{6}$/.test(code)), "Codes must contain exactly six digits");
assert.ok(codes.size > 1, "Generated verification codes must not be constant");

const code = generateVerificationCode();
const hash = hashVerificationCode(email, code);
assert.match(hash, /^[a-f0-9]{64}$/, "Stored code must be an HMAC SHA-256 hash");
assert.equal(matchesVerificationCode(email, code, hash), true, "Correct code must verify");
assert.equal(matchesVerificationCode(email, code === "999999" ? "111111" : "999999", hash), false, "Incorrect code must fail");
assert.equal(hash.includes(code), false, "Stored hash must not contain the plaintext code");
const resetHash = hashPasswordResetCode(email, code);
assert.match(resetHash, /^[a-f0-9]{64}$/, "Password reset codes must be stored as HMAC hashes");
assert.equal(matchesPasswordResetCode(email, code, resetHash), true, "Correct password reset code must verify");
assert.equal(matchesPasswordResetCode(email, code === "999999" ? "111111" : "999999", resetHash), false, "Incorrect password reset code must fail");
assert.notEqual(resetHash, hash, "Password reset code hashes must be scoped separately from signup codes");

const schema = fs.readFileSync(path.resolve(__dirname, "../database/schema.sql"), "utf8");
assert.match(schema, /CREATE TABLE IF NOT EXISTS pending_student_registrations/i);
assert.match(schema, /CREATE TABLE IF NOT EXISTS pending_student_password_resets/i);
assert.match(schema, /code_hash CHAR\(64\)/i);
const pendingTable = schema.match(/CREATE TABLE IF NOT EXISTS pending_student_registrations \([\s\S]*?\n\);/i)?.[0] || "";
assert.doesNotMatch(pendingTable, /\n\s+code\s+/i, "Schema must not store verification codes in plaintext");

const authRoutes = fs.readFileSync(path.resolve(__dirname, "../server/src/routes/auth.js"), "utf8");
const verifyRouteIndex = authRoutes.indexOf('router.post("/register/verify"');
const accountInsertIndex = authRoutes.indexOf("INSERT INTO users", verifyRouteIndex);
assert.ok(verifyRouteIndex >= 0, "Verification endpoint must exist");
assert.ok(accountInsertIndex > verifyRouteIndex, "Student account must be created only inside verification");
assert.match(authRoutes, /router\.post\("\/password\/reset\/request"/, "Password reset request endpoint must exist");
assert.match(authRoutes, /router\.post\("\/password\/reset\/verify"/, "Password reset verification endpoint must exist");
assert.match(authRoutes, /router\.post\("\/password\/reset\/confirm"/, "Password reset confirmation endpoint must exist");
assert.match(authRoutes, /UPDATE users SET password_hash=\?/, "Password reset must update the stored password hash");

const authUi = fs.readFileSync(path.resolve(__dirname, "../components/AuthExperience.jsx"), "utf8");
assert.match(authUi, /autoComplete="one-time-code"/);
assert.match(authUi, /Verify & create account/);
assert.match(authUi, /Forgot password\?/);
assert.match(authUi, /Send verification code/);
assert.match(authUi, /Change password/);

const emailService = fs.readFileSync(path.resolve(__dirname, "../server/src/services/email-verification.js"), "utf8");
assert.match(emailService, /EMAIL_PROVIDER/);
assert.match(emailService, /GMAIL_APP_PASSWORD/);
assert.match(emailService, /MAIL_VERIFICATION_SECRET/);
assert.match(emailService, /nodemailer\.createTransport/);
assert.match(emailService, /await gmailTransporter\.sendMail/);
assert.match(emailService, /sendPasswordResetEmail/);
assert.doesNotMatch(emailService, /pass:\s*["'][^"']+["']/, "Gmail credentials must not be hard-coded");

console.log(JSON.stringify({
  status: "passed",
  codeFormat: "6-digits",
  plaintextStored: false,
  accountCreatedAfterVerification: true,
  gmailProviderSupported: true,
}));
