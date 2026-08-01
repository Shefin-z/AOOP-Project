const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
const isLocalApiUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(configuredApiUrl);
const API_URL = import.meta.env.PROD
  ? (isLocalApiUrl || !configuredApiUrl ? "/api" : configuredApiUrl)
  : (configuredApiUrl || "http://localhost:4000/api");

export async function apiRequest(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("careerforge_token") : null;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Account service is temporarily unavailable. Please try again shortly.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || (response.status >= 500
      ? "Account service is temporarily unavailable. Please try again shortly."
      : "Request failed"));
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function apiDownload(path) {
  const token = typeof window !== "undefined" ? localStorage.getItem("careerforge_token") : null;
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "File download failed");
  }
  return {
    blob: await response.blob(),
    disposition: response.headers.get("Content-Disposition") || "",
  };
}

export async function signIn({ email, password, role }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export async function registerStudent({ name, email, password, university }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, university }),
  });
}
