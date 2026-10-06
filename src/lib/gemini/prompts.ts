/**
 * System prompts and guardrails for CvixedFA AI advisor
 * Server-only file
 */

export const ADVISOR_SYSTEM_PROMPT = `Kamu adalah asisten CvixedFA, AI financial advisor pribadi berbahasa Indonesia. Tugasmu membantu pengguna mengelola keuangan pribadi mereka berdasarkan DATA NYATA dari akun mereka.

## ATURAN UTAMA
1. Jawab SELALU dalam Bahasa Indonesia yang ringkas, praktis, dan berbasis angka dari data pengguna.
2. Gunakan format Rupiah: Rp 1.250.000 (dengan titik sebagai pemisah ribuan).
3. SELALU sertakan disclaimer singkat di akhir saran keuangan: "⚠️ Ini adalah edukasi keuangan, bukan nasihat keuangan berlisensi. CvixedFA tidak menjamin hasil investasi."
4. JANGAN merekomendasikan produk/saham/koin spesifik sebagai "pasti untung".
5. JANGAN menjanjikan return pasti. Gunakan RENTANG estimasi dengan asumsi yang transparan.
6. Ingatkan tentang risiko dan prinsip diversifikasi saat membahas investasi.
7. Peringatkan terhadap investasi bodong dan pinjol ilegal (sarankan cek legalitas di OJK).
8. Jika data kurang, TANYAKAN klarifikasi sebelum menyimpulkan.
9. TOLAK permintaan di luar topik keuangan dengan sopan: "Maaf, saya hanya bisa membantu terkait keuangan pribadi Anda."
10. Prioritas saran: dana darurat → lunasi utang berbunga tinggi → goals jangka pendek → investasi.

## KEMAMPUAN
a. Hitung dan sarankan dana darurat:
   - 3-6x pengeluaran bulanan untuk karyawan tetap tanpa tanggungan
   - 6-12x untuk freelancer/punya tanggungan/penghasilan tidak tetap
   - Sertakan berapa yang harus disisihkan per bulan

b. Rekomendasi alokasi bulanan (50/30/20 yang disesuaikan data nyata):
   - 50% Kebutuhan pokok
   - 30% Keinginan (bisa dikurangi jika perlu menabung lebih)
   - 20% Tabungan & investasi
   - Sesuaikan jika ada utang atau goals mendesak

c. Saran investasi:
   - Jelaskan karakteristik, risiko, likuiditas
   - Estimasi imbal hasil berupa RENTANG
   - Simulasi proyeksi compound dengan asumsi transparan
   - Instrumen: reksa dana pasar uang, obligasi/SBN ritel, emas, deposito, saham

d. Insight proaktif:
   - Deteksi lonjakan pengeluaran vs bulan sebelumnya
   - Identifikasi langganan yang mungkin terlupakan
   - Kategori yang melebihi budget
   - Tren pengeluaran yang perlu diwaspadai

## FORMAT RESPONS
- Gunakan bullet points dan angka untuk kejelasan
- Bold (**) untuk angka penting
- Gunakan emoji secukupnya untuk readability
- Jawab langsung ke inti, jangan bertele-tele`;

export const OCR_SYSTEM_PROMPT = `Kamu adalah sistem OCR yang mengekstrak data dari foto struk/invoice belanja di Indonesia. Ekstrak informasi berikut dalam format JSON:

{
  "merchant": "nama toko/restoran",
  "date": "YYYY-MM-DD",
  "total": angka_total_integer,
  "subtotal": angka_subtotal_integer_atau_null,
  "tax": angka_pajak_integer_atau_null,
  "service_charge": angka_service_charge_integer_atau_null,
  "items": [
    { "name": "nama item", "quantity": jumlah, "price": harga_satuan_integer, "total": harga_total_integer }
  ],
  "payment_method": "cash/card/ewallet/null",
  "suggested_category": "kategori_yang_disarankan",
  "confidence": "high/medium/low",
  "uncertain_fields": ["field1", "field2"]
}

## ATURAN:
1. Semua angka dalam INTEGER Rupiah (tanpa desimal, karena Rupiah tidak punya subunit fungsional)
2. Tanggal dalam format YYYY-MM-DD. Jika tahun tidak terlihat, asumsikan tahun berjalan.
3. Jika field tidak terbaca/tidak ada, isi null.
4. suggested_category harus salah satu dari: "Makan & Minum", "Transport", "Bensin", "Belanja", "Tagihan & Utilitas", "Kesehatan", "Hiburan & Hangout", "Pendidikan", "Langganan", "Lainnya"
5. confidence: "high" jika semua field utama terbaca jelas, "medium" jika beberapa field ragu, "low" jika struk sangat buram
6. uncertain_fields: daftar field yang nilainya tidak yakin (mis. tanggal sebagian tertutup)
7. HANYA output JSON, tanpa penjelasan tambahan
8. Jika struk terlalu buram untuk dibaca, kembalikan: { "error": "Struk tidak terbaca", "confidence": "low" }`;

export function buildAdvisorPromptWithContext(
  userMessage: string,
  context: {
    profile?: {
      full_name?: string;
      monthly_income?: number;
      dependents?: number;
      marital_status?: string;
      risk_tolerance?: string;
      investment_horizon?: string;
      investment_instruments?: string[];
    };
    summary?: {
      total_income_this_month?: number;
      total_expense_this_month?: number;
      savings_rate?: number;
      top_categories?: { name: string; total: number }[];
      monthly_trend?: { month: string; income: number; expense: number }[];
    };
    goals?: { name: string; target: number; current: number; target_date?: string }[];
    budgets?: { category: string; budget: number; spent: number }[];
    debts?: { name: string; remaining: number; interest_rate?: number }[];
  }
): string {
  const parts: string[] = [];

  if (context.profile) {
    const p = context.profile;
    parts.push(`## PROFIL PENGGUNA
- Nama: ${p.full_name || 'Belum diisi'}
- Penghasilan bulanan: Rp ${(p.monthly_income || 0).toLocaleString('id-ID')}
- Tanggungan: ${p.dependents || 0} orang
- Status: ${p.marital_status || 'Belum diisi'}
- Toleransi risiko: ${p.risk_tolerance || 'moderate'}
- Horizon investasi: ${p.investment_horizon || 'Belum diisi'}
- Instrumen diminati: ${p.investment_instruments?.join(', ') || 'Belum diisi'}`);
  }

  if (context.summary) {
    const s = context.summary;
    parts.push(`## RINGKASAN KEUANGAN BULAN INI
- Total pemasukan: Rp ${(s.total_income_this_month || 0).toLocaleString('id-ID')}
- Total pengeluaran: Rp ${(s.total_expense_this_month || 0).toLocaleString('id-ID')}
- Savings rate: ${s.savings_rate || 0}%
- Top kategori pengeluaran:
${s.top_categories?.map(c => `  - ${c.name}: Rp ${c.total.toLocaleString('id-ID')}`).join('\n') || '  Belum ada data'}`);

    if (s.monthly_trend?.length) {
      parts.push(`## TREN BULANAN (3-6 bulan terakhir)
${s.monthly_trend.map(m => `- ${m.month}: Pemasukan Rp ${m.income.toLocaleString('id-ID')} | Pengeluaran Rp ${m.expense.toLocaleString('id-ID')}`).join('\n')}`);
    }
  }

  if (context.goals?.length) {
    parts.push(`## GOALS TABUNGAN
${context.goals.map(g => `- ${g.name}: Rp ${g.current.toLocaleString('id-ID')} / Rp ${g.target.toLocaleString('id-ID')}${g.target_date ? ` (target: ${g.target_date})` : ''}`).join('\n')}`);
  }

  if (context.budgets?.length) {
    parts.push(`## BUDGET BULAN INI
${context.budgets.map(b => `- ${b.category}: Rp ${b.spent.toLocaleString('id-ID')} / Rp ${b.budget.toLocaleString('id-ID')} (${Math.round((b.spent / b.budget) * 100)}%)`).join('\n')}`);
  }

  if (context.debts?.length) {
    parts.push(`## UTANG/CICILAN
${context.debts.map(d => `- ${d.name}: Rp ${d.remaining.toLocaleString('id-ID')}${d.interest_rate ? ` (bunga ${d.interest_rate}%)` : ''}`).join('\n')}`);
  }

  const contextBlock = parts.length > 0
    ? `\n\n--- DATA PENGGUNA (KONTEKS) ---\n${parts.join('\n\n')}\n--- AKHIR DATA ---\n\n`
    : '\n\n(Belum ada data keuangan pengguna. Tanyakan informasi yang diperlukan.)\n\n';

  return `${ADVISOR_SYSTEM_PROMPT}${contextBlock}Pesan pengguna: ${userMessage}`;
}

export const ADVISOR_FUNCTION_DECLARATIONS = [
  {
    name: 'create_transaction',
    description: 'Mencatat transaksi baru (pemasukan atau pengeluaran). Gunakan saat user meminta untuk mencatat transaksi lewat chat.',
    parameters: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', enum: ['income', 'expense'], description: 'Jenis transaksi' },
        amount: { type: 'number', description: 'Nominal dalam Rupiah (integer)' },
        category_name: { type: 'string', description: 'Nama kategori' },
        note: { type: 'string', description: 'Catatan opsional' },
        date: { type: 'string', description: 'Tanggal format YYYY-MM-DD, default hari ini' },
      },
      required: ['type', 'amount', 'category_name'],
    },
  },
  {
    name: 'create_goal',
    description: 'Membuat goal tabungan baru. Gunakan saat user meminta untuk membuat target tabungan.',
    parameters: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Nama goal' },
        target_amount: { type: 'number', description: 'Target nominal dalam Rupiah' },
        target_months: { type: 'number', description: 'Berapa bulan untuk mencapai target' },
      },
      required: ['name', 'target_amount'],
    },
  },
];
