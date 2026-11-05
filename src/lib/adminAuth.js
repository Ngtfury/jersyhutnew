/**
 * MATCHDAY ADMIN AUTHENTICATION UTILITY
 * 
 * Provides timing-safe password validation, Web Crypto HMAC-SHA256 session tokens,
 * and cookie verification across Next.js Proxy (Edge), Route Handlers, and Server Components.
 */

export const ADMIN_COOKIE_NAME = 'matchday_admin_session';
export const DEFAULT_ADMIN_PASSWORD = 'matchday@admin2025';

const encoder = new TextEncoder();

/**
 * Returns the configured admin password from environment variables
 * or falls back to the default password with a warning.
 */
export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

/**
 * Checks if the application is currently running with the default fallback password.
 */
export function isDefaultPasswordInUse() {
  return !process.env.ADMIN_PASSWORD;
}

/**
 * Returns the secret key for HMAC token signing.
 */
function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'matchday_super_secure_admin_session_secret_key_2025'
  );
}

/**
 * Derives a CryptoKey for HMAC-SHA256
 */
async function getHmacKey(secret) {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function bufToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Generates a signed admin session token.
 * Valid for 14 days by default.
 */
export async function createSessionToken() {
  const secret = getSessionSecret();
  const timestamp = Date.now().toString();
  const key = await getHmacKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp));
  const sigHex = bufToHex(sigBuf);
  return `${timestamp}.${sigHex}`;
}

/**
 * Verifies if an admin session token is valid and unexpired.
 */
export async function verifySessionToken(token, maxAgeMs = 14 * 24 * 60 * 60 * 1000) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [timestampStr, sigHex] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  const now = Date.now();
  if (now - timestamp > maxAgeMs || timestamp > now + 60000) {
    return false; // Expired or future timestamp
  }

  try {
    const secret = getSessionSecret();
    const key = await getHmacKey(secret);
    const sigBuf = hexToBuf(sigHex);
    return await crypto.subtle.verify('HMAC', key, sigBuf, encoder.encode(timestampStr));
  } catch (err) {
    return false;
  }
}

/**
 * Timing-safe string comparison to protect against timing attacks.
 */
export async function verifyAdminPassword(inputPassword) {
  if (typeof inputPassword !== 'string') return false;
  const correctPassword = getAdminPassword();

  const aBuf = encoder.encode(inputPassword);
  const bBuf = encoder.encode(correctPassword);

  if (aBuf.byteLength !== bBuf.byteLength) {
    // Hash both so comparison time is constant regardless of length mismatch
    const [hashA, hashB] = await Promise.all([
      crypto.subtle.digest('SHA-256', aBuf),
      crypto.subtle.digest('SHA-256', bBuf)
    ]);
    const uA = new Uint8Array(hashA);
    const uB = new Uint8Array(hashB);
    let diff = 0;
    for (let i = 0; i < uA.length; i++) diff |= uA[i] ^ uB[i];
    return false;
  }

  let diff = 0;
  for (let i = 0; i < aBuf.length; i++) diff |= aBuf[i] ^ bBuf[i];
  return diff === 0;
}
