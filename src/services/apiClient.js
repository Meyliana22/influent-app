// auth-aware fetch wrapper. Use this in place of window.fetch for calls that
// require authentication.
import { ensureValidToken, clearAuth } from "./authService";

/**
 * Perform a fetch with Authorization header. If token is expired, try to
 * refresh it. On persistent 401 the user will be redirected to /login.
 * @param {string} url
 * @param {RequestInit} opts
 */
export async function authFetch(url, opts = {}) {
  // ensure token is present and not expired (no refresh logic)
  const ok = ensureValidToken();
  if (!ok) {
    clearAuth();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Authentication required");
  }

  const token = localStorage.getItem("token");
  const headers = {
    ...(opts.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  let res = await fetch(url, { ...opts, headers });

  // If server returns 401, clear and redirect immediately (no refresh)
  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return res;
}

export default authFetch;
