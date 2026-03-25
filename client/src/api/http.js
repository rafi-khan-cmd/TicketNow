const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function http(path, options = {}) {
  const storedUser = JSON.parse(window.localStorage.getItem("ticketnow_user") || "{}");
  const roleHeader = storedUser.role || "Requester";
  const userIdHeader = storedUser.userId ? String(storedUser.userId) : "";
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "x-user-role": roleHeader,
      ...(userIdHeader ? { "x-user-id": userIdHeader } : {}),
      ...(options.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "API request failed");
  }
  return res.json();
}
