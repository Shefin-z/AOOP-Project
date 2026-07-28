const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "careerforge-local-development-secret";

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Administrator access required" });
  next();
}

module.exports = { authenticate, adminOnly, JWT_SECRET };
