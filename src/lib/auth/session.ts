const SESSION_COOKIE_NAME = 'cvixedfa_session';
const DEFAULT_SECRET = 'cvixedfa-single-owner-secure-session-key-2026';

function getSessionSecret(): string {
  return process.env.APP_SESSION_SECRET || process.env.APP_TOTP_SECRET || DEFAULT_SECRET;
}

/**
 * Generate HMAC-SHA256 hex string using Web Crypto API (compatible with Edge and Node.js)
 */
async function generateHmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a signed session token
 */
export async function createSessionToken(userId: string = 'owner'): Promise<string> {
  const secret = getSessionSecret();
  const timestamp = Date.now();
  const payload = `${userId}:${timestamp}`;
  const hmac = await generateHmacSha256(payload, secret);
  return `${payload}:${hmac}`;
}

/**
 * Validate a session token
 */
export async function validateSessionToken(
  token: string | null | undefined,
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [userId, timestampStr, hmac] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration
  if (Date.now() - timestamp > maxAgeMs) {
    return false;
  }

  // Check signature
  const secret = getSessionSecret();
  const expectedPayload = `${userId}:${timestampStr}`;
  const expectedHmac = await generateHmacSha256(expectedPayload, secret);

  return hmac === expectedHmac;
}

export { SESSION_COOKIE_NAME };
