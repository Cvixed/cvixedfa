import { NextRequest, NextResponse } from 'next/server';
import { verifyTotpToken } from '@/lib/auth/totp';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, remember = true } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Kode 6 digit wajib diisi' }, { status: 400 });
    }

    // Retrieve master secret from environment variable or fallback configuration
    const secret = process.env.APP_TOTP_SECRET || process.env.TOTP_SECRET;

    if (!secret) {
      // If secret is not configured in .env.local yet, guide the user
      return NextResponse.json(
        {
          error: 'Kunci APP_TOTP_SECRET belum diset di .env.local. Silakan buka tab Setup terlebih dahulu.',
          needsSetup: true,
        },
        { status: 400 }
      );
    }

    // Verify 6-digit code with +/- 2 step tolerance (60 seconds leeway)
    const isValid = verifyTotpToken(code, secret, 2);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Kode Google Authenticator salah atau sudah kedaluwarsa. Coba lagi.' },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createSessionToken('owner');

    const res = NextResponse.json({ success: true, message: 'Autentikasi berhasil' });

    // Set HTTP-only secure session cookie (30 days if remember is true, else session cookie)
    const maxAge = remember ? 30 * 24 * 60 * 60 : undefined;

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return res;
  } catch (error: any) {
    console.error('TOTP Verify Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem', details: error?.message }, { status: 500 });
  }
}
