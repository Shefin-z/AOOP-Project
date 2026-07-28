require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool, query } = require("../config/db");

async function createAdmin() {
  const name = String(process.env.ADMIN_NAME || "").trim();
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");

  if (!name || !email || !password) {
    throw new Error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await query(
    `INSERT INTO users (name, email, password_hash, role, status)
     VALUES (?, ?, ?, 'admin', 'active')
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       password_hash = VALUES(password_hash),
       role = 'admin',
       status = 'active'`,
    [name, email, passwordHash],
  );

  console.log(`Administrator account is ready for ${email}.`);
}

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
