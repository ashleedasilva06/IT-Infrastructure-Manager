const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch(path, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return null;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}

export function createApi(token) {
  return {
    get: (path) => apiFetch(path, { method: "GET" }, token),
    post: (path, body) => apiFetch(path, { method: "POST", body: JSON.stringify(body) }, token),
    put: (path, body) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) }, token),
    patch: (path, body) => apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }, token),
    del: (path) => apiFetch(path, { method: "DELETE" }, token),
  };
}