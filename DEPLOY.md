# Panduan Deploy CvixedFA (Vercel + Supabase)

Ikuti 3 langkah berikut untuk men-deploy CvixedFA ke cloud agar bisa dibuka di HP Anda kapan saja tanpa perlu menyalakan laptop.

---

## Langkah 1: Setup Database Supabase (3 Menit)

1. Buka [supabase.com](https://supabase.com) dan login/daftar (gratis).
2. Klik **"New Project"**, beri nama misalnya `cvixedfa`, pilih region terdekat (misalnya `Singapore`).
3. Setelah project selesai dibuat, buka menu **SQL Editor** di sidebar kiri.
4. Klik **"New query"**.
5. Buka file `supabase_setup.sql` yang ada di folder project ini, **salin seluruh isinya**, lalu paste ke dalam SQL Editor di Supabase.
6. Klik tombol **"Run"** (hijau). 
   > Skrip ini otomatis membuat 15 tabel, mengisi kategori default (Makan, Bensin, Gaji, dll.), membuat dompet awal (BCA, GoPay, Tunai), goals awal, dan storage bucket foto struk.
7. Buka menu **Project Settings** (ikon gear di kiri bawah) -> **API**. Salin 3 nilai berikut:
   - **Project URL** (mis. `https://xxxx.supabase.co`)
   - **anon / public key**
   - **service_role key** (klik *Reveal* untuk melihat kuncinya)

---

## Langkah 2: Deploy ke Vercel (2 Menit)

### Opsi A: Melalui GitHub & Vercel Dashboard (Rekomendasi)

1. Buat repository baru di [github.com/new](https://github.com/new) (bisa pilih **Private**).
2. Di terminal laptop Anda, jalankan perintah untuk menghubungkan repo:
   ```bash
   git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git
   git branch -M main
   git push -u origin main
   ```
3. Buka [vercel.com](https://vercel.com) dan login.
4. Klik **"Add New..."** -> **"Project"** -> Pilih repository yang baru Anda buat -> Klik **"Import"**.
5. Di bagian **Environment Variables**, tambahkan variabel-variabel berikut:

| Key | Value | Keterangan |
|---|---|---|
| `APP_TOTP_SECRET` | `CVIXEDFA2026TOTPSECRETKEY` | Kunci rahasia Google Authenticator Anda |
| `APP_SESSION_SECRET` | `cvixedfa-single-owner-secure-session-key-2026` | Kunci enkripsi sesi cookie |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Dari Project Settings Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJh...` | Dari Project Settings Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJh...` | Dari Project Settings Supabase |
| `GEMINI_API_KEY` | Kunci API Gemini Anda | Dari [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_APP_URL` | `https://nama-project-anda.vercel.app` | URL Vercel yang Anda gunakan |

6. Klik tombol **"Deploy"**!
   Dalam 1-2 menit, aplikasi Anda sudah online dengan URL HTTPS (misalnya `https://cvixedfa.vercel.app`).

---

### Opsi B: Deploy Langsung via Terminal (Vercel CLI)

Jika tidak ingin membuat repo GitHub, Anda bisa langsung menjalankan perintah ini di folder project:

```bash
npx vercel
```

- Ikuti petunjuk di terminal (pilih link project, login Vercel via browser).
- Masukkan environment variables di Vercel Dashboard project settings.
- Jalankan deploy production:
  ```bash
  npx vercel --prod
  ```

---

## Langkah 3: Buka & Install di HP (Add to Home Screen)

1. Buka browser di HP Anda (Chrome di Android, atau Safari di iPhone).
2. Kunjungi URL Vercel Anda, misalnya: `https://cvixedfa.vercel.app`.
3. Anda akan melihat layar kunci **CvixedFA**:
   - Jika belum memasukkan key ke Google Authenticator: klik *"Setup / Scan Google Authenticator"* untuk scan QR code atau masukkan kunci `CVIXEDFA2026TOTPSECRETKEY`.
   - Masukkan 6 digit kode dari aplikasi **Google Authenticator** di HP Anda.
   - Centang **"Ingat saya di perangkat ini (30 hari)"**.
   - Klik **"Buka Kunci CvixedFA"**.
4. Jadikan aplikasi native di HP:
   - **Android (Chrome)**: Tap menu titik tiga (⋮) di kanan atas -> Pilih **"Install app"** atau **"Add to Home screen"** (Tambahkan ke layar utama).
   - **iPhone (Safari)**: Tap tombol Share (ikon kotak dengan panah ke atas di bagian bawah) -> Scroll ke bawah dan pilih **"Add to Home Screen"** (Tambah ke Layar Utama).
5. Ikon **CvixedFA** akan muncul di layar utama HP Anda. Tap ikon tersebut dan aplikasi akan terbuka secara fullscreen tanpa address bar browser, persis seperti aplikasi native!
