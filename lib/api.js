const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function apiRequest(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("careerforge_token") : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    throw error;
  }
  return data;
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
