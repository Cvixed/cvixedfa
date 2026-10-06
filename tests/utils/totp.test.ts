import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateTotpSecret,
  generateTotpToken,
  verifyTotpToken,
  getTotpUri,
} from '../../src/lib/auth/totp.ts';

describe('Google Authenticator TOTP Logic', () => {
  it('generates a valid base32 secret', () => {
    const secret = generateTotpSecret();
    assert.ok(secret.length >= 16);
    assert.match(secret, /^[A-Z2-7]+$/);
  });

  it('generates a 6-digit TOTP token', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const token = generateTotpToken(secret);
    assert.equal(token.length, 6);
    assert.match(token, /^\d{6}$/);
  });

  it('verifies valid current token successfully', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const token = generateTotpToken(secret);
    const isValid = verifyTotpToken(token, secret);
    assert.equal(isValid, true);
  });

  it('rejects incorrect tokens', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const isValid = verifyTotpToken('000000', secret);
    assert.equal(isValid, false);
  });

  it('formats standard otpauth URI for Google Authenticator', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const uri = getTotpUri(secret, 'Owner', 'CvixedFA');
    assert.ok(uri.startsWith('otpauth://totp/CvixedFA:Owner'));
    assert.ok(uri.includes('secret=JBSWY3DPEHPK3PXP'));
    assert.ok(uri.includes('issuer=CvixedFA'));
  });

  it('normalizes 0 to O in secret for 100% Google Authenticator compatibility', () => {
    const rawSecret = 'CVIXEDFA2026TOTPSECRETKEY';
    const normalizedSecret = 'CVIXEDFA2O26TOTPSECRETKEY';
    const token = generateTotpToken(normalizedSecret);
    const isValid = verifyTotpToken(token, rawSecret);
    assert.equal(isValid, true);
  });
});
