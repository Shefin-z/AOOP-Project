const { createHash } = require("node:crypto");
const { query } = require("../config/db");
const { ensureExternalJobsSchema } = require("./external-jobs-schema");

const SOURCE = "jooble";
const CACHE_MINUTES = 15;
const FAILURE_BACKOFF_MINUTES = 5;
const ACTIVE_HOURS = 36;

function cleanText(value, maximum = 5000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maximum);
}

function toSqlDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function validHttpUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function requestHash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function joobleConfigured() {
  return Boolean(cleanText(process.env.JOOBLE_API_KEY, 300));
}

function createSearch(profile = {}) {
  const targetRole = cleanText(profile.targetRole, 120);
  const primaryInterest = Array.isArray(profile.interests) ? cleanText(profile.interests[0], 80) : "";
  const location = cleanText(profile.location, 120) || "Bangladesh";
  return {
    keywords: targetRole || primaryInterest || "entry level",
    location,
    page: "1",
    ResultOnPage: "30",
    SearchMode: "0",
  };
}

function employmentType(value) {
  const type = cleanText(value, 80).toLowerCase();
  if (type.includes("intern")) return "Internship";
  if (type.includes("part")) return "Part-time";
  if (type.includes("contract") || type.includes("temporary")) return "Contract";
  return "Full-time";
}

function workplaceType(value) {
  return /\bremote\b/i.test(String(value || "")) ? "Remote" : "On-site";
}

function normalizeJoobleJob(raw) {
  const title = cleanText(raw?.title, 255);
  const sourceUrl = validHttpUrl(raw?.link);
  if (!title || !sourceUrl) return null;
  const sourceId = cleanText(raw?.id, 160) || requestHash({ title, sourceUrl }).slice(0, 48);
  const description = cleanText(raw?.snippet, 5000);
  const location = cleanText(raw?.location, 255) || "Bangladesh";
  const normalized = {
    source: SOURCE,
    sourceJobId: sourceId,
    title,
    company: cleanText(raw?.company, 255) || "Company not disclosed",
    location,
    workplaceType: workplaceType(`${raw?.type || ""} ${location}`),
    employmentType: employmentType(raw?.type),
    category: "External opportunity",
    description,
    requirements: description,
    salaryText: cleanText(raw?.salary, 255) || null,
    sourceUrl,
    sourceUpdatedAt: toSqlDate(raw?.updated),
  };
  return {
    ...normalized,
    payloadHash: requestHash(normalized),
  };
}

async function activeJobs() {
  return query(
    `SELECT * FROM external_jobs
     WHERE source=? AND active_until>NOW()
     ORDER BY COALESCE(source_updated_at, last_seen_at) DESC
     LIMIT 100`,
    [SOURCE],
  );
}

async function saveFetchState(requestKey, { fetched = false, totalCount = 0, error = null } = {}) {
  await query(
    `INSERT INTO external_job_fetches
       (source, request_key, last_attempt_at, last_fetched_at, total_count, last_error)
     VALUES (?, ?, NOW(), ${fetched ? "NOW()" : "NULL"}, ?, ?)
     ON DUPLICATE KEY UPDATE
       last_attempt_at=NOW(),
       last_fetched_at=${fetched ? "NOW()" : "last_fetched_at"},
       total_count=${fetched ? "VALUES(total_count)" : "total_count"},
       last_error=VALUES(last_error)`,
    [SOURCE, requestKey, totalCount, error ? cleanText(error, 500) : null],
  );
}

async function syncJoobleJobs(profile) {
  await ensureExternalJobsSchema();
  if (!joobleConfigured()) {
    return { configured: false, status: "not_configured", jobs: [], source: "Jooble" };
  }
  const request = createSearch(profile);
  const requestKey = requestHash(request);
  const [fetchState] = await query(
    `SELECT last_attempt_at, last_fetched_at, last_error
     FROM external_job_fetches WHERE source=? AND request_key=? LIMIT 1`,
    [SOURCE, requestKey],
  );
  const now = Date.now();
  const lastFetch = fetchState?.last_fetched_at ? new Date(fetchState.last_fetched_at).getTime() : 0;
  const lastAttempt = fetchState?.last_attempt_at ? new Date(fetchState.last_attempt_at).getTime() : 0;
  const cachedJobs = await activeJobs();
  if (lastFetch && now - lastFetch < CACHE_MINUTES * 60_000) {
    return { configured: true, status: "cached", jobs: cachedJobs, source: "Jooble" };
  }
  if (lastAttempt && now - lastAttempt < FAILURE_BACKOFF_MINUTES * 60_000 && fetchState?.last_error) {
    return { configured: true, status: "cached_after_provider_error", jobs: cachedJobs, source: "Jooble" };
  }

  try {
    const apiKey = cleanText(process.env.JOOBLE_API_KEY, 300);
    const response = await fetch(`https://jooble.org/api/${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`);
    const payload = await response.json();
    const jobs = (Array.isArray(payload?.jobs) ? payload.jobs : []).map(normalizeJoobleJob).filter(Boolean);
    for (const job of jobs) {
      await query(
        `INSERT INTO external_jobs
         (source, source_job_id, title, company, location, workplace_type, employment_type, category,
          description, requirements, salary_text, source_url, source_updated_at, last_seen_at, active_until, payload_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ${ACTIVE_HOURS} HOUR), ?)
         ON DUPLICATE KEY UPDATE
          title=VALUES(title), company=VALUES(company), location=VALUES(location), workplace_type=VALUES(workplace_type),
          employment_type=VALUES(employment_type), category=VALUES(category), description=VALUES(description),
          requirements=VALUES(requirements), salary_text=VALUES(salary_text), source_url=VALUES(source_url),
          source_updated_at=VALUES(source_updated_at), last_seen_at=NOW(), active_until=DATE_ADD(NOW(), INTERVAL ${ACTIVE_HOURS} HOUR),
          payload_hash=VALUES(payload_hash)`,
        [
          job.source, job.sourceJobId, job.title, job.company, job.location, job.workplaceType, job.employmentType,
          job.category, job.description, job.requirements, job.salaryText, job.sourceUrl, job.sourceUpdatedAt, job.payloadHash,
        ],
      );
    }
    await saveFetchState(requestKey, { fetched: true, totalCount: jobs.length });
    return { configured: true, status: "fresh", jobs: await activeJobs(), source: "Jooble" };
  } catch (error) {
    await saveFetchState(requestKey, { error: "Job provider temporarily unavailable" }).catch(() => {});
    return {
      configured: true,
      status: cachedJobs.length ? "cached_after_provider_error" : "provider_error",
      jobs: cachedJobs,
      source: "Jooble",
    };
  }
}

module.exports = {
  joobleConfigured,
  createSearch,
  normalizeJoobleJob,
  syncJoobleJobs,
};
