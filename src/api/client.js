const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v2";
const TOKEN_KEY = "xdsec_token";

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(body?.message || "Request failed");
    error.status = response.status;
    error.payload = body;
    throw error;
  }

  return body;
}
