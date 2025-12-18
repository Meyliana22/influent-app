// Lightweight auth helpers: parse JWT, check expiry, and simple token helpers.

export function parseJwt(token) {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(
      atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Check whether a JWT is expired (uses `exp` claim). Adds a small offset to
 * avoid expiry during network calls.
 * @param {string} token
 * @param {number} offsetSeconds seconds of leeway (default 10s)
 * @returns {boolean} true if expired or invalid
 */
export function isTokenExpired(token, offsetSeconds = 10) {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== "number") return true;
  const now = Date.now() / 1000;
  return now > payload.exp - offsetSeconds;
}

export function clearAuth() {
  localStorage.removeItem("token");
  // If you stored refreshToken earlier, remove it as well.
  localStorage.removeItem("refreshToken");
}

/**
 * Ensure that a token exists and is not expired. Does NOT attempt to refresh.
 * Returns true when token exists and not expired; false otherwise.
 */
export function ensureValidToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  return !isTokenExpired(token);
}

export default {
  parseJwt,
  isTokenExpired,
  clearAuth,
  ensureValidToken,
};
