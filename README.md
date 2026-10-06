# CvixedFA — Cvixed Financial Advisor

Aplikasi pencatat keuangan pribadi berbasis web (PWA) dengan AI financial advisor. Target pengguna: individu di Indonesia, mobile-first, bahasa antarmuka Bahasa Indonesia, mata uang Rupiah.

## ✨ Fitur Utama

- 📝 **Pencatatan Pemasukan & Pengeluaran** — Input manual cepat dengan kategori, dompet, dan tag
- 📸 **Scan Struk Otomatis** — Foto struk → AI mengekstrak data → form konfirmasi
- 🎯 **Goals Tabungan (Sinking Funds)** — Target tabungan dengan kalkulasi setoran otomatis
- 🤖 **AI Financial Advisor** — Chatbot cerdas dengan konteks data keuangan Anda
- 📊 **Dashboard & Laporan** — Grafik pengeluaran, tren, dan ringkasan keuangan
- 💰 **Multi Dompet** — Kelola Tunai, Bank, E-wallet dengan transfer antar dompet
- 📱 **PWA** — Install ke home screen, terasa seperti aplikasi native

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS + shadcn/ui | Styling & komponen |
| Supabase | Database (Postgres), Auth, Storage |
| Gemini API | AI (OCR struk + chatbot) |
| Recharts | Grafik & visualisasi |
| Serwist | PWA & Service Worker |
| TanStack Query | Data fetching & caching |
| Zod | Validasi input |

## 🚀 Setup Lokal

### Prasyarat

- Node.js 18+
- npm
- Akun [Supabase](https://supabase.com) (gratis)
- [Gemini API Key](https://aistudio.google.com/apikey)

### 1. Clone & Install

```bash
git clone <repo-url>
cd cvixedfa
npm install
```

### 2. Setup Google Authenticator (Single-Owner 2FA)

Aplikasi ini dirancang untuk penggunaan pribadi (single owner) tanpa perlu registrasi/login email publik. Akses diamankan dengan **Google Authenticator (RFC 6238 TOTP)**:

1. Buat kunci secret Base32 di `.env.local`:
   ```bash
   APP_TOTP_SECRET=CVIXEDFA2026TOTPSECRETKEY
   ```
2. Atau jalankan aplikasi dan buka tombol **"Setup / Scan Google Authenticator"** di halaman `/auth/totp` untuk scan QR code langsung dari layar ponsel Anda.
3. Masukkan 6 digit kode dari Google Authenticator untuk membuka aplikasi. Opsi *"Ingat saya"* akan menyimpan sesi aman selama 30 hari di perangkat Anda.

### 3. Setup Supabase (Database & Storage)

1. Buat project baru di [Supabase Dashboard](https://app.supabase.com)
2. Buka **SQL Editor** dan jalankan migration files secara berurutan:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_categories.sql`

### 4. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi:

| Variable | Cara Mendapatkan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (atau URL deploy) |

> ⚠️ **JANGAN** commit file `.env.local`. File ini sudah ada di `.gitignore`.

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📱 Add to Home Screen

### Android (Chrome)
1. Buka aplikasi di Chrome
2. Tap menu (⋮) → **"Add to Home Screen"** / **"Install app"**
3. Konfirmasi → Aplikasi muncul di home screen

### iOS (Safari)
1. Buka aplikasi di Safari
2. Tap tombol Share (□↑) → **"Add to Home Screen"**
3. Beri nama → **"Add"**

## 🌐 Deploy ke Vercel

1. Push ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import repository
3. Set environment variables yang sama seperti `.env.local`
4. Deploy!

Jangan lupa update URL di Supabase:
- Site URL → URL Vercel Anda
- Redirect URLs → `https://your-domain.vercel.app/auth/callback`

## 📂 Struktur Folder

```
src/
├── app/            # Routes (App Router)
│   ├── (auth)/     # Login & register
│   ├── (main)/     # Halaman utama (dengan bottom nav)
│   └── api/        # Route handlers (AI, upload, export)
├── components/     # React components
│   ├── ui/         # shadcn/ui primitives
│   ├── layout/     # Navigation & shell
│   └── ...         # Feature-specific components
└── lib/            # Utilities, hooks, types, Supabase/Gemini clients
```

## 🔒 Keamanan

- Autentikasi via Supabase Auth (magic link / Google)
- Row Level Security (RLS) di semua tabel
- API key Gemini hanya di server (Route Handler), tidak pernah terekspos ke client
- Validasi input dengan Zod di server
- Rate limiting untuk endpoint AI dan upload

## 📄 Lisensi

MIT
