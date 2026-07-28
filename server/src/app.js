require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { query } = require("./config/db");
const authRoutes = require("./routes/auth");
const jobsRoutes = require("./routes/jobs");
const learningRoutes = require("./routes/learning");
const communityRoutes = require("./routes/community");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || ["http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));

app.get("/api/health", async (_req, res) => {
  let database = "unavailable";
  try { await query("SELECT 1"); database = "healthy"; } catch {}
  res.json({ status: "ok", service: "careerforge-api", database, timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api", learningRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.code === "ER_DUP_ENTRY" ? 409 : 500;
  res.status(status).json({ error: status === 500 ? "Unexpected server error" : "This record already exists" });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`CareerForge API running on http://localhost:${PORT}`));
}

module.exports = app;
