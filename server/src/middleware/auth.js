const jwt = require("jsonwebtoken");
const { getPlatformSettings } = require("../services/platform-settings");

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "careerforge-local-development-secret");
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production.");
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    if (req.user.role === "student") {
      const settings = await getPlatformSettings();
      if (settings.features.maintenanceMode) {
        return res.status(503).json({ error: "CareerCube student services are temporarily under maintenance" });
      }
    }
    next();
  } catch (error) {
    if (["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    next(error);
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Administrator access required" });
  next();
}

module.exports = { authenticate, adminOnly, JWT_SECRET };
