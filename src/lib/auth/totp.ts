import crypto from 'crypto';

// Standard Base32 alphabet (RFC 4648)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode Base32 string to Buffer
 */
export function base32Decode(base32: string): Buffer {
  const cleaned = base32
    .toUpperCase()
    .replace(/=+$/, '')
    .replace(/0/g, 'O')
    .replace(/1/g, 'L')
    .replace(/8/g, 'B')
    .replace(/\s+/g, '')
    .replace(/-/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) continue; // ignore non-base32 chars

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Encode Buffer to Base32 string
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Generate a random Base32 secret for Google Authenticator (160-bit / 20 bytes)
 */
export function generateTotpSecret(length: number = 20): string {
  const randomBytes = crypto.randomBytes(length);
  return base32Encode(randomBytes);
}

/**
 * Generate TOTP code for a specific timestamp (RFC 6238)
 */
export function generateTotpToken(secret: string, timestamp: number = Date.now(), step: number = 30): string {
  const key = base32Decode(secret);
  const counter = Math.floor(timestamp / 1000 / step);

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  // Dynamic truncation
  const offset = digest[digest.length - 1] & 0xf;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const token = (code % 1000000).toString().padStart(6, '0');
  return token;
}

/**
 * Verify a 6-digit TOTP token against secret
 * @param token - 6 digit string entered by user
 * @param secret - Base32 secret key
 * @param window - Allowed step drift (+/- 1 step = 30 seconds drift tolerance)
 */
export function verifyTotpToken(
  token: string,
  secret: string,
  window: number = 2
): boolean {
  if (!token || !secret) return false;
  const cleanToken = token.trim();
  if (!/^\d{6}$/.test(cleanToken)) return false;

  const now = Date.now();
  const step = 30;

  for (let i = -window; i <= window; i++) {
    const checkTime = now + i * step * 1000;
    const generated = generateTotpToken(secret, checkTime, step);
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(generated))) {
      return true;
    }
  }

  return false;
}

/**
 * Generate standard otpauth URL for Google Authenticator
 */
export function getTotpUri(secret: string, accountName: string = 'Owner', issuer: string = 'CvixedFA'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
