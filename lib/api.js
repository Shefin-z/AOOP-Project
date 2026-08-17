const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
const API_URL = (configuredApiUrl || "/api").replace(/\/+$/, "");
const productionApiMissing = Boolean(import.meta.env.PROD) && !configuredApiUrl;

async function readResponse(response) {
  const body = await response.text();
  if (!body) return { data: {}, isJson: true };
  try {
    return { data: JSON.parse(body), isJson: true };
  } catch {
    return { data: {}, isJson: false };
  }
}

export async function apiRequest(path, options = {}) {
  if (productionApiMissing) {
    throw new Error("This deployment is missing VITE_API_URL for the Spring Boot API.");
  }
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
  const { data, isJson } = await readResponse(response);
  if (!response.ok) {
    const error = new Error(data.error || (!isJson
      ? "The account service returned an invalid response. Please try again shortly."
      : response.status >= 500
      ? "Account service is temporarily unavailable. Please try again shortly."
      : "Request failed"));
    error.status = response.status;
    error.details = data;
    if (data.retryAfterSeconds != null) error.retryAfterSeconds = Number(data.retryAfterSeconds);
    if (data.attemptsRemaining != null) error.attemptsRemaining = Number(data.attemptsRemaining);
    throw error;
  }
  return data;
}

export async function apiDownload(path) {
  if (productionApiMissing) {
    throw new Error("This deployment is missing VITE_API_URL for the Spring Boot API.");
  }
  const token = typeof window !== "undefined" ? localStorage.getItem("careerforge_token") : null;
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const { data } = await readResponse(response);
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

export async function verifyStudentEmail({ email, code }) {
  return apiRequest("/auth/register/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function resendRegistrationCode(email) {
  return apiRequest("/auth/register/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function requestPasswordReset(email) {
  return apiRequest("/auth/password/reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resendPasswordResetCode(email) {
  return apiRequest("/auth/password/reset/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyPasswordResetCode({ email, code }) {
  return apiRequest("/auth/password/reset/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function confirmPasswordReset({ resetToken, password }) {
  return apiRequest("/auth/password/reset/confirm", {
    method: "POST",
    body: JSON.stringify({ resetToken, password }),
  });
}
