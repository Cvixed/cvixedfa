import { NextResponse } from 'next/server';
import { generateTotpSecret, getTotpUri } from '@/lib/auth/totp';

export async function GET() {
  try {
    const existingSecret = process.env.APP_TOTP_SECRET || process.env.TOTP_SECRET;

    const secret = existingSecret || 'CVIXEDFA2026TOTPSECRETKEY';

    // Clean secret for 100% RFC 4648 Base32 compliance in QR code
    const cleanSecret = secret.toUpperCase().replace(/0/g, 'O').replace(/1/g, 'L').replace(/8/g, 'B').replace(/[^A-Z2-7]/g, '');
    const uri = getTotpUri(cleanSecret, 'Owner', 'CvixedFA');

    // Google Chart QR code URL or standard svg QR link for easy scanning
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(uri)}`;

    return NextResponse.json({
      secret,
      isConfigured: Boolean(existingSecret),
      uri,
      qrUrl,
      instructions: [
        'Buka aplikasi Google Authenticator di ponsel Anda.',
        'Pilih ikon "+" dan tap "Scan a QR code" (atau "Enter a setup key").',
        'Scan QR code di layar atau masukkan Secret Key secara manual.',
        'Jika belum disimpan di .env.local, tambahkan baris: APP_TOTP_SECRET=' + secret,
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menyiapkan Google Authenticator', details: error?.message }, { status: 500 });
  }
}
